from rest_framework import serializers
from .models import User, Category, Products, Historique, Favorites, Evaluation, ProductImage, Message, Notification
from django.contrib.auth.hashers import make_password
import re
import os
from django.conf import settings


#User serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True}, 
            'id': {'read_only': True},
            'rating' : {'read_only' : True}
        }
    
    def validate_fullname(self, value):
        """Vérifie que le fullname ne contient que des lettres et des espaces."""
        if not value:  # Vérifie si la valeur est None ou vide
            raise serializers.ValidationError("Fullname is required.")
        if not re.match(r'^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$', value):
            raise serializers.ValidationError("Le nom complet ne doit contenir que des lettres et des espaces.")
        return value
    
    def validate_password(self, value):
        if not value:  # Vérifie si la valeur est None ou vide
            raise serializers.ValidationError("password is required.")
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value 
    
    def validate_phone(self, value):
        if not value:  # Vérifie si la valeur est None ou vide
            raise serializers.ValidationError("Phone is required.")
        """Vérifie que le numéro de téléphone est valide."""
        if not re.match(r'^\+?\d{9,15}$', value):
            raise serializers.ValidationError("Le numéro de téléphone doit contenir uniquement des chiffres et peut commencer par '+'.")
        return value
    
    def update(self, instance, validated_data):
        # Vérifier si une nouvelle image est fournie
        new_image = validated_data.get('profile_picture', None)

        if new_image and instance.profile_picture and instance.profile_picture.name != 'profile_images/default.png':
            # Chemin absolu de l'ancienne image
            old_image_path = os.path.join(settings.MEDIA_ROOT, instance.profile_picture.name)

            if os.path.exists(old_image_path):
                os.remove(old_image_path)

        return super().update(instance, validated_data)

    def create(self, validated_data):
        # Hacher le mot de passe avant de sauvegarder
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
#Category serializer
class CatergorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__' 
        extra_kwargs = {
            'id': {'read_only': True}
        }

#ProductImage serializer
class ProductImageSerializer(serializers.ModelSerializer):
    # product_image = serializers.ImageField(required = True)
    class Meta:
        model = ProductImage
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True}
        }

#Products Serializer for post method
class ProductSerializer(serializers.ModelSerializer):
    # images = ProductImageSerializer(many=True, read_only=False, required = False)
    class Meta:
        model = Products
        fields = ['id', 'title', 'description', 'price', 'status', 'location', 'category', 'seller', 'sold', 'posted_date']
        extra_kwargs = {
            'id': {'read_only': True},
            'seller' : {'read_only' : True}
        }

    def validate_images(self, value):
        # Vérifier que le champ images contient au moins une image
        if not value or len(value) == 0:
            raise serializers.ValidationError("Vous devez fournir au moins une image.")
        return value
    
    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0.")
        return value

    def validate_title(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Le titre doit contenir au moins 3 caractères.")
        return value
        
    def validate(self, attrs):
        if 'location' in attrs and attrs['location'].strip() == '':
            raise serializers.ValidationError({"location": "La localisation ne peut pas être vide."})
        return attrs

    def validate_category(self, value):
        if not Category.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("La catégorie sélectionnée n'existe pas.")
        return value
        
    def validate_status(self, value):
        allowed_statuses = ['good', 'like-new', 'new', 'used']
        if value not in allowed_statuses:
            raise serializers.ValidationError(f"Le statut doit être parmi {allowed_statuses}.")
        return value

#Products serializer for get method
class ProductGetSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    class Meta:
        model = Products
        fields = ['id', 'title', 'description', 'price', 'status', 'location', 'category', 'seller', 'sold', 'posted_date', 'images']
        extra_kwargs = {
            'id': {'read_only': True},
            'seller' : {'read_only' : True}
        }
#Favorites serializer
class FavoritesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorites
        fields = '__all__'
        extra_kwargs = {
            'id': {'read_only': True}
        }

#Evaluation serializer
class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = ['id', 'rating', 'comment', 'evaluation_date', 'seller', 'buyer']
        read_only_fields = ['buyer', 'evaluation_date']

    def validate(self, data):
        request_user = self.context['request'].user
        if data['seller'] == request_user:
            raise serializers.ValidationError("Vous ne pouvez pas évaluer votre propre profil.")
        return data
    
#Message serializer
class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'is_read', "product"]
        read_only_fields = ['id', 'sender', 'timestamp', 'is_read']

#Notification serializer

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'