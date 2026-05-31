"""
URL configuration for hotel_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin # type: ignore
from django.urls import path # type: ignore
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # type: ignore
from core.presentation.views import (annuler_reservation_api, clients_api,chambres_api, detail_client_api, estimer_facture_api, lister_factures_api, modifier_reservation_api, personnel_api, reserver_chambre_api ,detail_chambre_api, historique_client_api,chambres_disponibles_api , generer_facture_api , lister_reservations_api , checkout_api,
                                    saisons_api , tarifs_api , CustomTokenObtainPairView)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/reserver/', reserver_chambre_api, name='api_reserver'),
    path('api/chambres/', chambres_disponibles_api , name="api_chambres_dispo"),
    path('api/gestion-chambres/', chambres_api, name="api_gestion_chambres"),
    path('api/gestion-chambres/<str:num_chambre>/', detail_chambre_api, name='api_detail_chambre'),
    path('api/factures/<int:reservation_id>/generer/',generer_facture_api, name='api_generer_facture'),
    path('api/reservations/', lister_reservations_api, name='api_lister_reservations'),
    path('api/reservations/<int:reservation_id>/checkout/', checkout_api, name='api_checkout'),
    path('api/clients/', clients_api, name='api_clients'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/clients/<str:cin>/', detail_client_api, name='api_detail_client'),
    path('api/clients/<str:cin>/historique/', historique_client_api, name='api_historique_client'),
    path('api/saisons/', saisons_api, name="api_saisons"),
    path('api/saisons/<int:saison_id>/', saisons_api, name="api_saisons_detail"),
    path('api/tarifs/', tarifs_api, name="api_tarifs"),
    path('api/tarifs/<int:tarif_id>/', tarifs_api, name="api_tarifs_detail"),
    path('api/factures/<int:reservation_id>/estimer/', estimer_facture_api, name='api_estimer_facture'),
    path('api/factures/', lister_factures_api, name='api_lister_factures'),
    path('api/reservations/<int:reservation_id>/modifier/', modifier_reservation_api, name='api_modifier_reservation'),
    path('api/reservations/<int:reservation_id>/annuler/', annuler_reservation_api, name='api_annuler_reservation'),
    path('api/personnel/', personnel_api, name='api_personnel'),
    path('api/personnel/<int:user_id>/', personnel_api, name='api_personnel_detail'),
    
]
