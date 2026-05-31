from rest_framework.decorators import api_view # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer # type: ignore
from rest_framework_simplejwt.views import TokenObtainPairView # type: ignore
from rest_framework.permissions import IsAuthenticated, IsAdminUser # type: ignore
from rest_framework.decorators import permission_classes # type: ignore
from core.application.use_cases import AjouterChambreUseCase, AnnulerReservationUseCase, CreerClientUseCase , CalculerRemiseUseCase, CreerReceptionnisteUseCase, EffectuerCheckOutUseCase, ModifierChambreUseCase, ModifierReservationUseCase, ReserverChambreUseCase , GenererFactureUseCase , ModifierClientUseCase , BasculerStatutClientUseCase
from core.infrastructure.repositories import (
    DjangoChambreRepository, 
    DjangoClientRepository, 
    DjangoReservationRepository,
    DjangoFactureRepository,
    DjangoTarifRepository,
    DjangoSaisonRepository,
    DjangoUserRepository
)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff  # True = Admin, False = Réceptionniste
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAdminUser])
def chambres_api(request):
    try:
        repo = DjangoChambreRepository()
        
        if request.method == 'GET':
            if request.GET.get('dispo') == 'true':
                chambres = repo.trouver_toutes_disponibles()
            else:
                chambres = repo.lister_toutes()
            return Response(chambres, status=200)

        elif request.method == 'POST':
            use_case = AjouterChambreUseCase(repo)
            use_case.execute(
                num_chambre=request.data.get('num_chambre'),
                type_chambre=request.data.get('type_chambre'),
                # Si le champ est vide (""), on met 0 avant de convertir en entier
                etage=int(request.data.get('etage') or 0),
                capacite=int(request.data.get('capacite') or 0),
                description=request.data.get('description'),
                equipements=request.data.get('equipements', '')
            )
            return Response({"message": "Chambre créée avec succès !"}, status=201)

    except Exception as e:
        return Response({"erreur": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reserver_chambre_api(request):
    try:
        reservation_repo = DjangoReservationRepository()
        chambre_repo = DjangoChambreRepository()
        client_repo = DjangoClientRepository()
        
        use_case = ReserverChambreUseCase(chambre_repo, reservation_repo, client_repo)
        
        use_case.execute(
            client_cin=request.data.get('client_cin'),
            num_chambre=request.data.get('num_chambre'),
            date_arrive=request.data.get('date_arrive'),
            date_depart=request.data.get('date_depart'),
            type_reservation=request.data.get('type_reservation', 'Standard'),
            nbr_personnes=int(request.data.get('nbr_personnes', 1))
        )
        return Response({"message": "Réservation confirmée avec succès !"}, status=201)
    except Exception as e:
        return Response({"erreur": str(e)}, status=400)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
def detail_chambre_api(request, num_chambre):
    try:
        repo = DjangoChambreRepository()

        if request.method == 'PUT':
            use_case = ModifierChambreUseCase(repo)
            use_case.execute(
                num_chambre=num_chambre,
                type_chambre=request.data.get('type_chambre'),
                # Même protection ici pour la modification
                etage=int(request.data.get('etage') or 0),
                capacite=int(request.data.get('capacite') or 0),
                description=request.data.get('description'),
                equipements=request.data.get('equipements', '')
            )
            return Response({"message": "Chambre modifiée avec succès !"}, status=200)

        elif request.method == 'DELETE':
            repo.basculer_statut(num_chambre)
            return Response({"message": "Statut de la chambre modifié."}, status=200)

    except Exception as e:
        return Response({"erreur": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chambres_disponibles_api(request):
    repo = DjangoChambreRepository()
    chambres = repo.trouver_toutes_disponibles()
    return Response(chambres)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generer_facture_api(request, reservation_id):
    facture_repo = DjangoFactureRepository()
    reservation_repo = DjangoReservationRepository()
    tarif_repo = DjangoTarifRepository() 
    
    use_case = GenererFactureUseCase(facture_repo, reservation_repo, tarif_repo) 

    try:
        services = float(request.data.get('services', 0.0))
        remise = float(request.data.get('remise', 0.0))
        facture_db = use_case.execute(
            reservation_id=reservation_id,
            montant_services=services,
            montant_remise=remise
        )
        return Response({
            "message": "Facture générée avec succès !",
            "facture_id": facture_db.id,
            "nuitees": facture_db.detail_nuitees,
            "total_mad": facture_db.montant_total
        }, status=201)

    except Exception as e:
        return Response({"erreur": str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lister_reservations_api(request):
    repo = DjangoReservationRepository()
    reservations = repo.lister_reservations_actives()
    return Response(reservations)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def historique_client_api(request, cin):
    repo = DjangoReservationRepository()
    historique = repo.obtenir_historique_client(cin)
    return Response(historique, status=200)
 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def checkout_api(request, reservation_id):
    reservation_repo = DjangoReservationRepository()
    chambre_repo = DjangoChambreRepository()
    use_case = EffectuerCheckOutUseCase(reservation_repo, chambre_repo)

    try:
        chambre_liberee = use_case.execute(reservation_id)
        return Response({
            "message": f"Check-out réussi ! La chambre {chambre_liberee.num_chambre} est libérée."
        }, status=200)
    except Exception as e:
        return Response({"erreur": str(e)}, status=400)
    
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def clients_api(request):
    repo = DjangoClientRepository()

    if request.method == 'GET':
        clients = repo.lister_tous()
        return Response(clients, status=200)
    elif request.method == 'POST':
        use_case = CreerClientUseCase(repo)
        try:
            use_case.execute(
                cin=request.data.get('cin'),
                nom=request.data.get('nom'),
                prenom=request.data.get('prenom'),
                courriel=request.data.get('courriel'),
                telephone=request.data.get('telephone'),
                adresse=request.data.get('adresse')
            )
            return Response({"message": "Client créé avec succès !"}, status=201)
        except Exception as e:
            return Response({"erreur": str(e)}, status=400)
        
@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def detail_client_api(request, cin):
    repo = DjangoClientRepository()

    if request.method == 'PUT':
        use_case = ModifierClientUseCase(repo)
        try:
            use_case.execute(
                cin=cin,
                nom=request.data.get('nom'),
                prenom=request.data.get('prenom'),
                courriel=request.data.get('courriel'),
                telephone=request.data.get('telephone'),
                adresse=request.data.get('adresse')
            )
            return Response({"message": "Profil mis à jour avec succès !"}, status=200)
        except Exception as e:
            return Response({"erreur": str(e)}, status=400)

    elif request.method == 'DELETE':
        use_case = BasculerStatutClientUseCase(repo)
        try:
            use_case.execute(cin)
            return Response({"message": "Statut du client modifié avec succès."}, status=200)
        except Exception as e:
            return Response({"erreur": str(e)}, status=400)

from core.infrastructure.repositories import DjangoSaisonRepository

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def saisons_api(request, saison_id=None):
    repo = DjangoSaisonRepository()
    try:
        if request.method == 'GET':
            return Response(repo.lister_toutes(), status=200)
        elif request.method == 'POST':
            repo.sauvegarder(
                nom=request.data.get('nom'),
                date_debut=request.data.get('date_debut'),
                date_fin=request.data.get('date_fin')
            )
            return Response({"message": "Saison ajoutée"}, status=201)
        elif request.method == 'DELETE' and saison_id:
            repo.supprimer(saison_id)
            return Response({"message": "Saison supprimée"}, status=200)
    except Exception as e:
        return Response({"erreur": str(e)}, status=400)

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def tarifs_api(request, tarif_id=None):
    repo = DjangoTarifRepository()
    try:
        if request.method == 'GET':
            return Response(repo.lister_tous(), status=200)
        elif request.method == 'POST':
            repo.sauvegarder(
                type_chambre=request.data.get('type_chambre'),
                saison_id=request.data.get('saison_id'),
                prix=float(request.data.get('prix_par_nuit'))
            )
            return Response({"message": "Tarif ajouté"}, status=201)
        elif request.method == 'DELETE' and tarif_id:
            repo.supprimer(tarif_id)
            return Response({"message": "Tarif supprimé"}, status=200)
    except Exception as e:
        return Response({"erreur": str(e)}, status=400)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def estimer_facture_api(request, reservation_id):
    reservation_repo = DjangoReservationRepository()
    tarif_repo = DjangoTarifRepository()
    use_case = CalculerRemiseUseCase(reservation_repo, tarif_repo)
    
    try:
        estimation = use_case.execute(reservation_id)
        return Response(estimation, status=200)
    except Exception as e:
        return Response({"erreur": str(e)}, status=400)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lister_factures_api(request):
    repo = DjangoFactureRepository()
    try:
        return Response(repo.lister_toutes(), status=200)
    except Exception as e:
        return Response({"erreur": str(e)}, status=400)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def modifier_reservation_api(request, reservation_id):
    reservation_repo = DjangoReservationRepository()
    chambre_repo = DjangoChambreRepository()
    use_case = ModifierReservationUseCase(reservation_repo, chambre_repo)
    
    try:
        use_case.execute(
            reservation_id=reservation_id,
            date_arrive=request.data.get('date_arrive'),
            date_depart=request.data.get('date_depart'),
            nbr_personne=int(request.data.get('nbr_personne')),
            num_chambre_nouvelle=request.data.get('num_chambre')
        )
        return Response({"message": "Réservation modifiée avec succès !"}, status=200)
    except Exception as e:
        return Response({"erreur": str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def annuler_reservation_api(request, reservation_id):
    reservation_repo = DjangoReservationRepository()
    chambre_repo = DjangoChambreRepository()
    tarif_repo = DjangoTarifRepository()
    use_case = AnnulerReservationUseCase(reservation_repo, chambre_repo, tarif_repo)
    
    try:
        resultat = use_case.execute(reservation_id)
        return Response(resultat, status=200)
    except Exception as e:
        return Response({"erreur": str(e)}, status=400)
    

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAdminUser])
def personnel_api(request, user_id=None):
    repo = DjangoUserRepository()
    try:
        if request.method == 'GET':
            return Response(repo.lister_receptionnistes(), status=200)
            
        elif request.method == 'POST':
            use_case = CreerReceptionnisteUseCase(repo)
            use_case.execute(
                username=request.data.get('username'),
                password=request.data.get('password')
            )
            return Response({"message": "Compte réceptionniste créé avec succès !"}, status=201)
            
        elif request.method == 'DELETE' and user_id:
            repo.supprimer_receptionniste(user_id)
            return Response({"message": "Compte supprimé avec succès."}, status=200)
            
    except Exception as e:
        return Response({"erreur": str(e)}, status=400)