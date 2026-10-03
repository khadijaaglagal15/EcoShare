from .serializers import UserSerializer, CatergorySerializer, ProductImageSerializer, ProductSerializer
from .serializers import FavoritesSerializer, ProductGetSerializer, EvaluationSerializer, MessageSerializer, NotificationSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import Category, Products, Favorites, Evaluation, ProductImage, User, Message, Notification, create_notification
from django.db.models import Q
from django.db import models
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync 

#View pour afficher ou modifier les infos personnelles de l'utilisateur connecte
class UserView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        user_data =  {
            "id" : user.id, 
            "email" : user.email, 
            "phone" : user.phone, 
            "fullname" : user.fullname,
            "gender" : user.gender, 
            "rating": user.rating_avg,
            "profile_picture" : request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None,
            "date_joined": user.date_joined
        }
        return Response(user_data, status=200)
    
    def put(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial = True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message" : "data modified succefully!!"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=400)

#View pour afficher/publier/modifier/supprimer les annonces de l'utilisateur connecte    
class UserProductsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        search = request.query_params.get("query", None)

        products = Products.objects.filter(seller = request.user)
        if search:
            try:
                x = float(search)
                products = products.filter(price = x)
            except ValueError:
                products = products.filter(title__icontains = search) 
        serializer = ProductGetSerializer(products, many = True)
        return Response (serializer.data, status = 200) 
    
    def post(self, request):
        serializer = ProductSerializer(data = request.data)
        if serializer.is_valid():
            images = request.FILES.getlist('images')
            if not images:
                 return Response({"images": ["Vous devez fournir au moins une image."]}, status=400)
            product = serializer.save(seller = request.user)
            for img in images:
                ProductImage.objects.create(product=product, image=img)
            return Response({"message" : "announcement posted successfully"})
        return Response(serializer.errors, status=400)
    
    def put(self, request):
        product_id = request.query_params.get("id")

        try:
            product = Products.objects.get(id = product_id)
        except Products.DoesNotExist:
            return Response ({"detail": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        if product.seller != request.user:
            return Response({"detail": "Vous n'êtes pas autorisé à modifier ce produit."},
                            status=status.HTTP_403_FORBIDDEN)
        serializer = ProductSerializer(product, data = request.data, partial = True)
        if serializer.is_valid():
            serializer.save()
            new_images = request.FILES.getlist('images')
            if new_images:
                for img in new_images:
                    ProductImage.objects.create(product=product, image=img)

            return Response({"message" : "Updated successfully"}, status = status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        product_id = request.query_params.get("id")
        try:
            product = Products.objects.get(id = product_id)
        except Products.DoesNotExist:
            return Response ({"detail": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        if product.seller != request.user:
            return Response({"detail": "Vous n'êtes pas autorisé à supprimer ce produit."},
                            status=status.HTTP_403_FORBIDDEN)
        product.delete()
        return Response ({"detail": "Produit supprimé avec succès."}, status=status.HTTP_200_OK)

#View pour supprimer une image d'un produit
class DeleteProductImageView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def delete(self, request, image_id):
        try:
            image = ProductImage.objects.get(id=image_id)
        except ProductImage.DoesNotExist:
            return Response({"detail": "Image introuvable."}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier que l'utilisateur est le propriétaire du produit
        if image.product.seller != request.user:
            return Response({"detail": "Non autorisé à supprimer cette image."}, status=status.HTTP_403_FORBIDDEN)

        # Vérifier qu'il reste au moins une image pour ce produit
        total_images = ProductImage.objects.filter(product=image.product).count()
        if total_images <= 1:
            return Response(
                {"detail": "Impossible de supprimer la dernière image. Ajoutez une autre image avant de supprimer celle-ci."},
                status=status.HTTP_400_BAD_REQUEST
            )

        image.delete()
        return Response({"detail": "Image supprimée avec succès."}, status=status.HTTP_200_OK)

#View pour les produits preferes
class FavoriteProductsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        search = request.query_params.get("query", None)
        favorite_products = Favorites.objects.filter(user = request.user)

        if search:
            try:
                x = float(search)
                favorite_products = Favorites.objects.filter(price = x)
            except ValueError:
                favorite_products = Favorites.objects.filter(models.Q(product__title__icontains = search))
        serializer = FavoritesSerializer(favorite_products, many = True)
        return Response(serializer.data, status=200)
    
    def post(self, request):
        product_id = request.query_params.get("query")
    
        if not product_id:
            return Response({"detail": "L'ID du produit est requis."}, status=400)

        try:
            product = Products.objects.get(id=product_id)
        except Products.DoesNotExist:
            return Response({"detail": "Ce produit n'existe pas."}, status=404)

        if product.seller == request.user:
            return Response({"detail": "Vous ne pouvez pas ajouter votre propre produit aux favoris."}, status=400)

        favorite_exists = Favorites.objects.filter(user=request.user, product=product).exists()
        if favorite_exists:
            return Response({"detail": "Ce produit est déjà dans vos favoris."}, status=400)
        Favorites.objects.create(user=request.user, product=product)
        return Response({"detail": "Produit ajouté aux favoris avec succès."}, status=201)

    def delete(self, request):
        product_id = request.query_params.get("query")
        favorite = Favorites.objects.filter(user=request.user, product__id=product_id).first()
        if not favorite:
            return Response({"detail": "Produit non trouvé dans vos favoris."}, status=404)

        favorite.delete()
        return Response({"detail": "Produit retiré des favoris."}, status=204)      
    
#View pour evaluation 
class EvaluationView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        seller_id = request.data.get("seller")
        try:
            seller = User.objects.get(id=seller_id)
        except User.DoesNotExist:
            return Response({"detail": "Vendeur introuvable."}, status=404)

        # L'utilisateur ne peut pas évaluer lui-même
        if seller == request.user:
            return Response({"detail": "Vous ne pouvez pas évaluer votre propre profil."}, status=403)

        # Vérifier s'il a déjà évalué ce vendeur
        try:
            evaluation = Evaluation.objects.get(buyer=request.user, seller=seller)
            serializer = EvaluationSerializer(evaluation, data=request.data, context={"request": request}, partial=True)
        except Evaluation.DoesNotExist:
            serializer = EvaluationSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            serializer.save(buyer=request.user)
            User.update_seller_rating(seller)
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)

#View pour les messages
User = get_user_model()
class Get_Send_MessageView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, receiver_id):
        try:
            receiver =  User.objects.get(id = receiver_id)
        except User.DoesNotExist:
            return Response({"detail" : "User not found "}, status=404)
        
        messages = Message.objects.filter(
            models.Q(sender = request.user, receiver = receiver) |
            models.Q(sender = receiver, receiver = request.user )
        ).order_by('timestamp')
        serializer = MessageSerializer(messages, many = True)
        return Response(serializer.data)
    
    def post(self, request):
        receiver_id = request.data.get("receiver")
        try:
            receiver =  User.objects.get(id = receiver_id)
        except User.DoesNotExist:
            return Response({"detail" : "User not found"}, status=404)
        serializer = MessageSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(sender = request.user, receiver = receiver)
            create_notification(receiver, request.data.get("content"))
            return Response(serializer.data, status = 201)
        return Response(serializer.errors, status=400)

#view pour marker les messages lu 
class Mark_Messages_ReadView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request, seller_id):
        user = request.user
        try:
            seller = User.objects.get(id=seller_id)
        except User.DoesNotExist:
            return Response({"detail": "Vendeur introuvable."}, status=404)

        # Marque comme lus tous les messages envoyés par le vendeur à l'utilisateur connecté
        updated = Message.objects.filter(sender=seller, receiver=user, is_read=False).update(is_read=True)
        return Response({"message": f"{updated} messages marked as read."}, status=200)

#View pour afficher les conversations de l'utilisateur:
class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        user = request.user
        # Récupère tous les messages où l'utilisateur est sender ou receiver
        messages = Message.objects.filter(models.Q(sender=user) | models.Q(receiver=user)).order_by('-timestamp')
        conversations = {}
        for msg in messages:
            # Identifie l'autre participant
            other = msg.receiver if msg.sender == user else msg.sender
            if other.id == user.id:
                continue  # ← Ignore la conversation avec soi-même
            key = (other.id)
            if key not in conversations:
                # Premier message trouvé = dernier message (car trié par -timestamp)
                unread_count = Message.objects.filter(sender=other, receiver=user, is_read=False, product=msg.product).count()
                conversations[key] = {
                    "sender_id": user.id,
                    "receiver_id": other.id,
                    "receiver_fullname": other.fullname,
                    "receiver_avatar": other.profile_picture.url if other.profile_picture else "",
                    "sender_avatar": user.profile_picture.url if user.profile_picture else "",
                    "lastMessage": msg.content,
                    "lastMessageTimestamp": msg.timestamp,
                    "unread_count": unread_count,
                    "product": {
                        "id": msg.product.id if msg.product else None,
                        "title": msg.product.title if msg.product else "",
                        "image": msg.product.images.first().image.url if msg.product and msg.product.images.exists() else ""
                    } if msg.product else None
                }
        return Response(list(conversations.values()))
    

#View pour afficher les infos d'une conversation avec un vendeur:
class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, seller_id):
        user = request.user
        try:
            seller = User.objects.get(id=seller_id)
        except User.DoesNotExist:
            return Response({"detail": "Vendeur introuvable."}, status=404)

        # Récupère tous les messages entre user et seller
        messages = Message.objects.filter(
            (models.Q(sender=user, receiver=seller) | models.Q(sender=seller, receiver=user))
        ).order_by('-timestamp')

        if not messages.exists():
            return Response({"detail": "Aucune conversation trouvée."}, status=404)

        # Dernier message
        last_msg = messages.first()
        # Produit du dernier message (optionnel)
        product = last_msg.product
        product_data = None
        if product:
            product_data = {
                "id": product.id,
                "title": product.title,
                "image": product.images.first().image.url if product.images.exists() else ""
            }

        # Nombre de messages non lus envoyés par le vendeur à l'utilisateur connecté
        unread_count = Message.objects.filter(sender=seller, receiver=user, is_read=False).count()

        data = {
            "sender_id": user.id,
            "receiver_id": seller.id,
            "receiver_fullname": seller.fullname,
            "receiver_avatar": seller.profile_picture.url if seller.profile_picture else "",
            "sender_avatar": user.profile_picture.url if user.profile_picture else "",
            "lastMessage": last_msg.content,
            "lastMessageTimestamp": last_msg.timestamp,
            "unread_count": unread_count,
            "product": product_data
        }
        return Response(data)

#View pour les notifications
class NotificationList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "Notifications marked as read."})
    
def send_realtime_notification(message):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "notifications",  # Groupe WebSocket
        {
            "type": "send_notification",
            "message": message
        }
    )