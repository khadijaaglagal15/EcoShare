from .serializers import CatergorySerializer
from .serializers import ProductGetSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import UserSerializer, FavoritesSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import Category, Products, User, Favorites
from django.db.models import Q
from django.db import models
from rest_framework.parsers import MultiPartParser, FormParser

#View pour afficher un Utilisateur
class SellerView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self,request,seller_id):
        user = User.objects.get(id = seller_id)
        user_data =  {
            "id" : user.id,
            "email" : user.email, 
            "phone" : user.phone, 
            "fullname" : user.fullname,
            "gender" : user.gender, 
            "rating": user.rating_avg,
            "profile_picture" : request.build_absolute_uri(user.profile_picture.url) if user.profile_picture else None
        }
        return Response(user_data, status=200)


#View pour afficher les categories 
class CategoryView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        search = request.query_params.get('query', None)
        
        if not search: 
            categories = Category.objects.all()
        else:
            try:
                x = int(search)
                categories = Category.objects.filter(id = x)
            except ValueError:
                categories = Category.objects.filter(models.Q(name__icontains = search))
            
        serializer = CatergorySerializer(categories, many = True)
        return Response(serializer.data, status = 200)
    
#View pour afficher les annonces 
class ProductsView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        search = request.query_params.get("query")
        ville = request.query_params.get("ville")
        categorie = request.query_params.get("categorie")

        filters = Q()

        if search:
            try:
                price = float(search)
                filters &= Q(price=price)
            except ValueError:
                filters &= Q(title__icontains=search)

        if ville:
            filters &= Q(location__icontains=ville)  
        if categorie:
            filters &= Q(category__name__icontains=categorie)  

        products = Products.objects.filter(filters).order_by('-posted_date')
        serializer = ProductGetSerializer(products, many = True)
        return Response(serializer.data, status = 200)
    
#View pour afficher les infos d'une annonce:
class ProductView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, product_id):
        product = Products.objects.get(id = product_id)
        serializer = ProductGetSerializer(product)
        return Response(serializer.data, status = 200)
    
#View pour ajouter/supprimer un produit dans favoris
class FavoritesView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request, product_id):
        favorite_product = Favorites.objects.filter(user=request.user, product=product_id).first()
        if not favorite_product:
            return Response([], status=200)
        serializer = FavoritesSerializer(favorite_product)
        return Response(serializer.data, status=200)
    
    def post(self, request, product_id):
        if not product_id:
            return Response({"detail": "L'ID du produit est requis."}, status=400)
        try:
            product = Products.objects.get(id=product_id)
        except Products.DoesNotExist:
            return Response({"detail": "Ce produit n'existe pas."}, status=404)

        favorite_exists = Favorites.objects.filter(user=request.user, product=product).exists()
        if favorite_exists:
            return Response({"detail": "Ce produit est déjà dans vos favoris."}, status=400)
        Favorites.objects.create(user=request.user, product=product)
        return Response({"detail": "Produit ajouté aux favoris avec succès."}, status=201)

    def delete(self, request, product_id):
        favorite = Favorites.objects.filter(user=request.user, product=product_id).first()
        if not favorite:
            return Response({"detail": "Produit non trouvé dans vos favoris."}, status=404)

        favorite.delete()
        return Response({"detail": "Produit retiré des favoris."}, status=status.HTTP_200_OK)