from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager,PermissionsMixin
from django.utils import timezone
from django.contrib.auth import get_user_model

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('L\'email doit être défini')
        email = self.normalize_email(email)
        user = self.model(email=email,  **extra_fields)
        user.set_password(password)  # Hashage du mot de passe
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)
    
# Modèle utilisateur personnalisé (table 1)
class User(AbstractBaseUser, PermissionsMixin):
    fullname = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Le mot de passe est stocké de manière sécurisée
    phone = models.CharField(max_length=15, unique=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female')])

    rating_avg = models.FloatField(default=0)
    profile_picture = models.ImageField(upload_to='profile_images/', default='profile_images/default.png')    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Champ pour déterminer l'accès à l'admin
    is_superuser = models.BooleanField(default=False)  # Champ pour déterminer si l'utilisateur est un superutilisateur
    date_joined = models.DateTimeField(auto_now_add=True)

    # Champs obligatoires pour l'authentification
    USERNAME_FIELD = 'email'  # Tu peux utiliser email ou username comme champ pour l'authentification
    REQUIRED_FIELDS = ['fulname']  # Ce champ est requis lors de la création d'un superutilisateur

    objects = UserManager()

    def update_seller_rating(seller):
        evaluations = Evaluation.objects.filter(seller=seller)
        if evaluations.exists():
            average = evaluations.aggregate(models.Avg('rating'))['rating__avg']
            seller.rating_avg = round(average, 2)
        else:
            seller.average_rating = 0.0
        seller.save()


    def __str__(self):
        return self.fullname
#-------------------------------------------------------------------------------------------------------------
#Category model (table 2)
class Category(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name
    
#Products model (table 3)
class Products(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True, default = "")
    price = models.FloatField(default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    status  = models.CharField(max_length=10, choices=[('good', "good"), ("new", "new"), ("like-new", "like-new"), ("used", "used")])
    seller = models.ForeignKey(User,on_delete=models.CASCADE)
    location = models.CharField(max_length=255, default="hhhh")
    sold = models.BooleanField(default=False)
    posted_date = models.DateTimeField(auto_now_add=True)

    def __self__(self):
        return self.title
    
#Product Images model (table 4):
class ProductImage(models.Model):
    product = models.ForeignKey(Products, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')

    def __str__(self):
        return f"Image for {self.product.title}"
    
#------------------------------------------------------------------------------------------------------------
#Favorites model (table 5)
class Favorites(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.fullname} liked {self.product.title}"
        
#Evaluation model (table 6)
class Evaluation(models.Model):
    id = models.AutoField(primary_key=True)
    rating = models.IntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')], default=1)
    comment = models.TextField()
    evaluation_date = models.DateTimeField(auto_now_add=True)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reveived_evaluation")
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name = "given_evaluation")

    def __str__(self):
        return f"{self.buyer.fullname} evaluated {self.seller.fullname}"
    
#Historique model (table 7)
class Historique(models.Model):
    ACTION_CHOICES = [
        ('achat', 'Achat'),
        ('vente', 'Vente'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='historiques')
    produit = models.ForeignKey(Products, on_delete=models.CASCADE, related_name='historiques')
    action = models.CharField(max_length=5, choices=ACTION_CHOICES)
    date_action = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.produit.title}"

#-------------------------------------------------------------------------------------------------------------
#Modele messages (table 8)
User = get_user_model()

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    product = models.ForeignKey(Products, on_delete=models.CASCADE,help_text="Produit concerné par le message (optionnel)", null=True, blank=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.content[:30]}"
    
#-------------------------------------------------------------------------------------------------------------
#Modele reset password (table )
class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)  # Code OTP à 6 chiffres
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        from datetime import timedelta
        from django.utils.timezone import now
        return now() - self.created_at < timedelta(minutes=10)  # Valide pendant 10 minutes

    def __str__(self):
        return f"OTP for {self.user.email}"
    
#Modele notification
class Notification(models.Model):
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Notification for {self.recipient.username}: {self.message}"

#fonction de la creation d'une notification
def create_notification(user, message):
    Notification.objects.create(receiver=user, message=message)
    print(f"✅ Notification envoyée à {user.fullname}: {message}")