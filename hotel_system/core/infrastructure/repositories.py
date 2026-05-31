from core.domain.entities import Chambre , Client , Reservation , Facture 
from core.infrastructure.models import ChambreModel , ClientModel, FactureModel , ReservationModel , SaisonModel ,TarifModel
import datetime
from django.contrib.auth.models import User # type: ignore

class DjangoChambreRepository:
    def lister_toutes(self):
        return list(ChambreModel.objects.all().values())
    def trouver_par_numero(self, num: int) -> Chambre:
        chambre_django = ChambreModel.objects.get(num_chambre=num)        
        chambre_pure = Chambre(
            num_chambre=chambre_django.num_chambre,
            type_chambre=chambre_django.type_chambre,
            etage=chambre_django.etage,
            capacite=chambre_django.capacite,
            description=chambre_django.description,
            dispo=chambre_django.dispo

        )
        return chambre_pure

    def trouver_toutes_disponibles(self):
        chambres_django = ChambreModel.objects.filter(dispo=True, est_actif=True).values()
        return list(chambres_django)



    def sauvegarder(self, chambre: Chambre):
        ChambreModel.objects.update_or_create(
            num_chambre=chambre.num_chambre,
            defaults={
                'type_chambre': chambre.type_chambre,
                'etage': chambre.etage,
                'capacite': chambre.capacite,
                'description': chambre.description,
                'dispo': chambre.dispo,
                'est_actif': chambre.est_actif,
                'equipements': chambre.equipements
                
            }
        )
    def mettre_a_jour(self, chambre: Chambre):
        chambre_db = ChambreModel.objects.get(num_chambre=chambre.num_chambre)
        chambre_db.type_chambre = chambre.type_chambre
        chambre_db.etage = chambre.etage
        chambre_db.capacite = chambre.capacite
        chambre_db.description = chambre.description
        chambre_db.equipements = chambre.equipements
        chambre_db.dispo = chambre.dispo
        chambre_db.save()

    def basculer_statut(self, num_chambre):
        chambre_db = ChambreModel.objects.get(num_chambre=num_chambre)
        chambre_db.est_actif = not chambre_db.est_actif
        chambre_db.save()

class DjangoClientRepository:
    def trouver_par_cin(self, cin: str):
        client_django=ClientModel.objects.get(cin=cin)
        client_pure = Client(
            cin=client_django.cin,
            nom=client_django.nom,
            prenom=client_django.prenom,
            email=client_django.email,
            telephone=client_django.telephone,
            adresse=client_django.adresse
        )
        return client_pure
    def existe_deja(self, cin):
        return ClientModel.objects.filter(cin=cin).exists()
    def lister_tous(self):
        return list(ClientModel.objects.all().values())
    def sauvegarder(self, client: Client):
        ClientModel.objects.update_or_create(
            cin=client.cin,
            defaults={
                'nom': client.nom,
                'prenom': client.prenom,
                'email': client.email,
                'telephone': client.telephone,
                'adresse': client.adresse
            }
        )
    def mettre_a_jour(self, client: Client):
        db_client = ClientModel.objects.get(cin=client.cin)
        db_client.nom = client.nom
        db_client.prenom = client.prenom
        db_client.courriel = client.email
        db_client.telephone = client.telephone
        db_client.adresse = client.adresse
        db_client.save()
        return db_client

    def basculer_statut(self, cin):
        db_client = ClientModel.objects.get(cin=cin)
        db_client.est_actif = not db_client.est_actif  # Si c'est True ça devient False, et inversement
        db_client.save()
        
class DjangoReservationRepository:
    def sauvegarder(self, reservation : Reservation):
        client_django = ClientModel.objects.get(cin=reservation.client.cin)
        chambre_django = ChambreModel.objects.get(num_chambre=reservation.chambre.num_chambre)
        ReservationModel.objects.create(
            date_arrive=reservation.date_arrive,
            date_depart=reservation.date_depart,
            type_reservation=reservation.type_reservation,
            nbr_personne=reservation.nbr_personne,
            client=client_django,
            chambre=chambre_django
        )
    def trouver_par_id(self , reservation_id):
        try:
            res_django = ReservationModel.objects.get(id=reservation_id)
            client_entity=Client(cin=res_django.client.cin ,
                                    nom=getattr(res_django.client, 'nom', 'Inconnu'),
                                    prenom=getattr(res_django.client, 'prenom', 'Inconnu'),
                                    email=getattr(res_django.client, 'courriel', 'Inconnu'), # ou 'email' selon ton entité
                                    telephone=getattr(res_django.client, 'telephone', 'Inconnu'),
                                    adresse=getattr(res_django.client, 'adresse', 'Inconnu'))
            chambre_entity=Chambre(num_chambre=res_django.chambre.num_chambre,
                                   type_chambre=res_django.chambre.type_chambre,
                                   etage=res_django.chambre.etage,
                                   capacite=res_django.chambre.capacite,
                                   description=res_django.chambre.description,
                                   dispo=res_django.chambre.dispo)
            return Reservation(
                date_arrive =res_django.date_arrive,
                date_depart =res_django.date_depart,
                chambre=chambre_entity,
                client=client_entity,
                nbr_personne=res_django.nbr_personne,
                type_reservation=res_django.type_reservation,

            )
        except ReservationModel.DoesNotExist:
            return None
    def lister_reservations_actives(self):
        reservations_db = ReservationModel.objects.filter(statut='ACTIVE')        
        resultat = []        
        for res in reservations_db:
            resultat.append({
                "id": res.id,
                "client_cin": res.client.cin, 
                "num_chambre": res.chambre.num_chambre, 
                "date_arrive": res.date_arrive,
                "date_depart": res.date_depart,
                "type_reservation": res.type_reservation,
                "nbr_personne": res.nbr_personne,
                "statut": res.statut
            })
        return resultat
    def obtenir_historique_client(self, cin):
        reservations = ReservationModel.objects.filter(client__cin=cin, statut='TERMINEE').order_by('-date_depart')
        historique = []
        for res in reservations:
            historique.append({
                "id": res.id,
                "chambre": res.chambre.num_chambre,
                "date_arrive": res.date_arrive,
                "date_depart": res.date_depart,
                "montant": res.montant_facture
            })
        return historique
    def definir_montant_facture(self, reservation_id, montant):
        res_db = ReservationModel.objects.get(id=reservation_id)
        res_db.montant_facture = montant
        res_db.save()
    def archiver_reservation(self, reservation_id):
        res_db = ReservationModel.objects.get(id=reservation_id)
        res_db.statut = 'TERMINEE'
        res_db.save()
    def supprimer(self, reservation_id):
        try:
            ReservationModel.objects.get(id=reservation_id).delete()
        except ReservationModel.DoesNotExist:
            pass

    def mettre_a_jour(self, reservation_id, date_arrive, date_depart, nbr_personne, num_chambre):
        res_db = ReservationModel.objects.get(id=reservation_id)
        
        res_db.date_arrive = date_arrive
        res_db.date_depart = date_depart
        res_db.nbr_personne = nbr_personne
        if res_db.chambre.num_chambre != num_chambre:
            chambre_db = ChambreModel.objects.get(num_chambre=num_chambre)
            res_db.chambre = chambre_db
            
        res_db.save()

    def annuler_reservation(self, reservation_id, penalite):
        res_db = ReservationModel.objects.get(id=reservation_id)
        res_db.statut = 'ANNULEE'
        res_db.montant_facture = penalite # On enregistre la pénalité s'il y en a une
        res_db.save()
class DjangoFactureRepository :
    def sauvegarder(self , facture : Facture):
        res_django = ReservationModel.objects.get(
            client__cin=facture.reservation.client.cin,
            chambre__num_chambre=facture.reservation.chambre.num_chambre,
            date_arrive=facture.reservation.date_arrive
        )
        nouvelle_facture_db = FactureModel.objects.create(
            reservation=res_django,
            detail_nuitees=facture.detail_nuitees,
            services=facture.services,
            remise=facture.remise,
            montant_total=facture.montant_total
        )
        return nouvelle_facture_db
    
    def lister_toutes(self):
        from core.infrastructure.models import FactureModel
        factures = FactureModel.objects.select_related('reservation__client', 'reservation__chambre').all().order_by('-date_emission')
        
        return [
            {
                "id": f.id,
                "client_nom": f"{f.reservation.client.nom} {f.reservation.client.prenom}",
                "client_cin": f.reservation.client.cin,
                "chambre": f.reservation.chambre.num_chambre,
                "date_arrive": f.reservation.date_arrive,
                "date_depart": f.reservation.date_depart,
                "nuitees": f.detail_nuitees,
                "services": f.services,
                "remise": f.remise,
                "total": f.montant_total,
                "date_emission": f.date_emission.strftime("%d/%m/%Y %H:%M")
            } for f in factures
        ]

    
    
class DjangoTarifRepository:
    def calculer_montant_sejour(self, type_chambre, date_arrive, date_depart):
        total = 0.0
        nuitees = (date_depart - date_arrive).days
        if nuitees <= 0:
            nuitees = 1
        jour_actuel = date_arrive
        
        # On calcule le prix pour CHAQUE nuit du séjour
        for _ in range(nuitees):
            saison = SaisonModel.objects.filter(date_debut__lte=jour_actuel, date_fin__gte=jour_actuel).first()
            
            prix_nuit = 500.0  # Prix de base (secours) si le directeur a oublié de configurer les tarifs            
            if saison:
                tarif = TarifModel.objects.filter(type_chambre=type_chambre, saison=saison).first()
                if tarif:
                    prix_nuit = tarif.prix_par_nuit
            
            # 3. On ajoute le prix de cette nuit au total
            total += float(prix_nuit)
            
            # 4. On passe au jour suivant
            jour_actuel += datetime.timedelta(days=1)

        return total
    def lister_tous(self):
        tarifs = TarifModel.objects.select_related('saison').all()
        return [
            {
                "id": t.id,
                "type_chambre": t.type_chambre,
                "prix_par_nuit": t.prix_par_nuit,
                "saison_id": t.saison.id,
                "saison_nom": t.saison.nom
            }
            for t in tarifs
        ]

    def sauvegarder(self, type_chambre, saison_id, prix):
        saison = SaisonModel.objects.get(id=saison_id)
        return TarifModel.objects.create(type_chambre=type_chambre, saison=saison, prix_par_nuit=prix)

    def supprimer(self, tarif_id):
        TarifModel.objects.filter(id=tarif_id).delete()

class DjangoSaisonRepository:
    def lister_toutes(self):
        return list(SaisonModel.objects.all().values('id', 'nom', 'date_debut', 'date_fin'))

    def sauvegarder(self, nom, date_debut, date_fin):
        return SaisonModel.objects.create(nom=nom, date_debut=date_debut, date_fin=date_fin)

    def supprimer(self, saison_id):
        SaisonModel.objects.filter(id=saison_id).delete()

class DjangoUserRepository:
    def lister_receptionnistes(self):
        # On liste uniquement les utilisateurs normaux (is_staff=False)
        users = User.objects.filter(is_staff=False, is_superuser=False).values('id', 'username', 'date_joined')
        # Formatage de la date pour un affichage plus propre
        return [
            {
                "id": u['id'],
                "username": u['username'],
                "date_joined": u['date_joined'].strftime("%d/%m/%Y") if u['date_joined'] else "N/A"
            } for u in users
        ]

    def creer_receptionniste(self, username, password):
        if User.objects.filter(username=username).exists():
            raise ValueError("Ce nom d'utilisateur existe déjà.")
        
        # create_user se charge de hacher le mot de passe automatiquement !
        user = User.objects.create_user(username=username, password=password)
        user.is_staff = False
        user.save()
        return user

    def supprimer_receptionniste(self, user_id):
        # Sécurité : on s'assure qu'on ne peut pas supprimer un Admin par erreur
        User.objects.filter(id=user_id, is_staff=False).delete()