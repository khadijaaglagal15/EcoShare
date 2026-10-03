from .serializers import UserSerializer
from .models import User, PasswordResetOTP
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
import random
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password


#Register View
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data = request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response(
                {   
                    "message" : "user created successfully",
                    "access_token" : str(refresh.access_token), 
                    "refresh_token" : str(refresh)

                }, status = status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)

#Login View
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        
        try:   
            user = User.objects.filter(email = email).first()
            if user and check_password(password, user.password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    "message" : "Login successfully!!", 
                    "access_token" : str(refresh.access_token), 
                    "refresh_token" : str(refresh)
                }, status=status.HTTP_200_OK)
            else:
                return Response({"error" : "email or password incorrect!!"}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({"error" : str(e)}, status=status.HTTP_400_BAD_REQUEST)

#LogoutView
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#SendResetOTPView
class SendResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            otp = f"{random.randint(100000, 999999)}"  # Générer un OTP à 6 chiffres
            
            # Stocker l'OTP
            PasswordResetOTP.objects.filter(user=user).delete()  # Supprime les anciens OTP
            PasswordResetOTP.objects.create(user=user, otp=otp)

            # Envoyer l'email
            send_mail(
                'Password Reset OTP',
                f'Your OTP for password reset is: {otp}',
                'no-reply@example.com',  # Adresse email de l'expéditeur
                [email],
                fail_silently=False,
            )

            return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
#VerifyResetOTPView       
class VerifyResetOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        try:
            user = User.objects.get(email=email)
            otp_record = PasswordResetOTP.objects.filter(user=user, otp=otp).first()

            if otp_record and otp_record.is_valid():
                return Response({"message": "OTP verified."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

#ResetPasswordView
class ResetPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        new_password = request.data.get('new_password')

        # Validate password length
        if not new_password or len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            user = User.objects.get(email=email)
            user.password = make_password(new_password)
            user.save()
            PasswordResetOTP.objects.filter(user=user).delete()  # Supprimer les OTP après utilisation
            return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        
