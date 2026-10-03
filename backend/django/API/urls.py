from django.urls import path
from .AuthenticationViews import RegisterView, LoginView,SendResetOTPView, VerifyResetOTPView, ResetPasswordView
from .userViews import UserView,UserProductsView
from .views import ProductsView, CategoryView, ProductView, SellerView, FavoritesView
from .userViews import DeleteProductImageView, FavoriteProductsView, EvaluationView, Get_Send_MessageView, ConversationListView, ConversationDetailView,Mark_Messages_ReadView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)   

urlpatterns = [
    #Authentication endpoints(register and login)
    path("register/", RegisterView.as_view(), name = "register"), 
    path("login/", LoginView.as_view(), name = "login"),
    #-------------------------------------------------------------------------------------------------
    #Enpoint for retreiving user connected data
    path("profile/", UserView.as_view(), name = "profile"),
    #Endpoint for retreiving seller data
    path("seller/<int:seller_id>/", SellerView.as_view(), name = "seller"),
    #-------------------------------------------------------------------------------------------------
    #Endpoint for listing categories
    path("categories/", CategoryView.as_view(), name = "category"),
    #-------------------------------------------------------------------------------------------------
    #Endpoint for listing products
    path("products/", ProductsView.as_view(), name = "products"), #exemple of listing products: http://127.0.0.1:8000/app/products/?ville=Tiznit&categorie=Clothing
    #Endpoint for listing a single product by its id
    path("product/<int:product_id>/",ProductView.as_view()),
    #Endpoint for listing/posting/updating/deleting products for the authenticated user
    path("user-products/", UserProductsView.as_view(),name = "user-products"), #exmple put: http://127.0.0.1:8000/app/user-products/?id=2   get : http://127.0.0.1:8000/app/user-products/?query=title
    #Enpoint for deleting a product image
    path("user-products-image/<int:image_id>/", DeleteProductImageView.as_view(), name = "delete-product-image"),
    #-------------------------------------------------------------------------------------------------
    #Endpoint for listing/adding/deleting favorite products
    path("user-favorites/",FavoriteProductsView.as_view(), name = "favorite-products" ),
    #Endpoint for listing/adding/deleting favorite products
    path("favorites/<int:product_id>/",FavoritesView.as_view(), name = "favorite-products" ),
    #-------------------------------------------------------------------------------------------------
    #Endpoint for rating a seller by his product
    path("user-evaluation/", EvaluationView.as_view(), name = "evaluation"),
    #-------------------------------------------------------------------------------------------------
    #Enpoint for getting/sending messages 
    path("get-messages/<int:receiver_id>/", Get_Send_MessageView.as_view()), 
    path("send-messages/", Get_Send_MessageView.as_view()),
    #Endpoint for marking message as read
    path("mark-messages-read/<int:seller_id>/", Mark_Messages_ReadView.as_view()),
    #Endpoint for getting conversation
    path("conversations/", ConversationListView.as_view()),
    path('conversation/<int:seller_id>/', ConversationDetailView.as_view()),
    #-------------------------------------------------------------------------------------------------
    # reset password endpoints
    path('password-reset/send-otp/', SendResetOTPView.as_view(), name='send_reset_otp'),
    path('password-reset/verify-otp/', VerifyResetOTPView.as_view(), name='verify_reset_otp'),
    path('password-reset/reset/', ResetPasswordView.as_view(), name='reset_password'), 
    #-------------------------------------------------------------------------------------------------
    # Les endpoints pour obtenir et rafraichir un token
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),   
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    #-------------------------------------------------------------------------------------------------
]

