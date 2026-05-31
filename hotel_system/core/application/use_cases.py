from core.domain.entities import Chambre, Client, Reservation , Facture
from datetime import datetime
class ReserverChambreUseCase:
    def __init__(self, chambre_repository, reservation_repository, client_repository):
        self.chambre_repo = chambre_repository
        self.reservation_repo = reservation_repository
        self.client_repo = client_repository
    def execute(self, client_cin: str, num_chambre: str, date_arrive, date_depart, nbr_personnes: int, type_reservation: str = "Standard"):
        
        chambre = self.chambre_repo.trouver_par_numero(num_chambre)
        client = self.client_repo.trouver_par_cin(client_cin)
        
        if not chambre.dispo:
            raise Exception("La chambre n'est pas disponible")
            
        chambre.dispo = False
        
        nouvelle_reservation = Reservation(
            date_arrive=date_arrive,
            date_depart=date_depart,
            type_reservation=type_reservation,  
            nbr_personne=nbr_personnes,
            client=client,
            chambre=chambre
        )
        
        self.chambre_repo.mettre_a_jour(chambre) 
        self.reservation_repo.sauvegarder(nouvelle_reservation)

        return nouvelle_reservation
    
class ModifierReservationUseCase:
    def __init__(self, reservation_repo, chambre_repo):
        self.reservation_repo = reservation_repo
        self.chambre_repo = chambre_repo

    def execute(self, reservation_id, date_arrive, date_depart, nbr_personne, num_chambre_nouvelle):
        reservation = self.reservation_repo.trouver_par_id(reservation_id)
        if not reservation: 
            raise ValueError("Réservation introuvable")
        if reservation.chambre.num_chambre != num_chambre_nouvelle:
            nouvelle_chambre = self.chambre_repo.trouver_par_numero(num_chambre_nouvelle)
            if not nouvelle_chambre.dispo:
                raise ValueError(f"La chambre {num_chambre_nouvelle} n'est pas disponible.")
            ancienne_chambre = reservation.chambre
            ancienne_chambre.dispo = True
            self.chambre_repo.mettre_a_jour(ancienne_chambre)

            nouvelle_chambre.dispo = False
            self.chambre_repo.mettre_a_jour(nouvelle_chambre)

        self.reservation_repo.mettre_a_jour(reservation_id, date_arrive, date_depart, nbr_personne, num_chambre_nouvelle)
        return True


class AnnulerReservationUseCase:
    def __init__(self, reservation_repo, chambre_repo, tarif_repo):
        self.reservation_repo = reservation_repo
        self.chambre_repo = chambre_repo
        self.tarif_repo = tarif_repo

    def execute(self, reservation_id):
        from datetime import date, datetime # On force l'importation stricte ici !

        reservation = self.reservation_repo.trouver_par_id(reservation_id)
        if not reservation: 
            raise ValueError("Réservation introuvable")

        aujourd_hui = date.today() 
        
        # Sécurité pour convertir le format date si besoin
        date_arrivee = reservation.date_arrive
        if isinstance(date_arrivee, str):
            date_arrivee = datetime.strptime(date_arrivee, "%Y-%m-%d").date() # <-- Et ici

        jours_avant_arrivee = (date_arrivee - aujourd_hui).days

        # Règle métier : Pénalité de 10% si < 48h
        penalite = 0.0
        message = "Annulation gratuite effectuée avec succès."

        if jours_avant_arrivee < 2:
            montant_total = self.tarif_repo.calculer_montant_sejour(
                reservation.chambre.type_chambre,
                reservation.date_arrive,
                reservation.date_depart
            )
            penalite = (montant_total * 10) / 100
            message = f"Annulation tardive (< 48h). Une pénalité de 10% a été appliquée : {penalite} MAD."

        chambre = reservation.chambre
        chambre.dispo = True
        self.chambre_repo.mettre_a_jour(chambre)

        self.reservation_repo.annuler_reservation(reservation_id, penalite)

        return {"message": message, "penalite": penalite}

class CreerReceptionnisteUseCase:
    def __init__(self, user_repo):
        self.user_repo = user_repo

    def execute(self, username, password):
        if not username or len(username) < 3:
            raise ValueError("Le nom d'utilisateur doit contenir au moins 3 caractères.")
        if not password or len(password) < 6:
            raise ValueError("Le mot de passe doit contenir au moins 6 caractères.")
            
        return self.user_repo.creer_receptionniste(username, password)

class GenererFactureUseCase:
    def __init__(self, facture_repo, reservation_repo, tarif_repo):
        self.facture_repo = facture_repo
        self.reservation_repo = reservation_repo
        self.tarif_repo = tarif_repo # NOUVEAU
        
    def execute(self, reservation_id, montant_services=0.0, montant_remise=0.0):
        reservation = self.reservation_repo.trouver_par_id(reservation_id)
        if not reservation:
            raise ValueError("Réservation introuvable")
            
        nuitees = (reservation.date_depart - reservation.date_arrive).days
        if nuitees <= 0:
            nuitees = 1
            
        # ---> NOUVEAU : On utilise notre moteur intelligent pour calculer le prix des nuits !
        type_chambre = reservation.chambre.type_chambre
        montant_chambre = self.tarif_repo.calculer_montant_sejour(
            type_chambre, 
            reservation.date_arrive, 
            reservation.date_depart
        )
        
        # Calcul du total final avec les services et remises
        total = montant_chambre + montant_services - montant_remise
        
        self.reservation_repo.definir_montant_facture(reservation_id, total)

        nouvelle_facture = Facture(
            reservation=reservation,
            detail_nuitees=nuitees,
            services=montant_services,
            remise=montant_remise,
            montant_total=total
        )
        
        try:
            return self.facture_repo.sauvegarder(nouvelle_facture)
        except Exception as e:
            # On force le backend à afficher la VRAIE raison de l'erreur
            print("ERREUR FATALE LORS DE LA SAUVEGARDE :", str(e))
            raise ValueError(f"Erreur technique : {str(e)}")
        
class CalculerRemiseUseCase:
    def __init__(self, reservation_repo, tarif_repo):
        self.reservation_repo = reservation_repo
        self.tarif_repo = tarif_repo

    def execute(self, reservation_id):
        reservation = self.reservation_repo.trouver_par_id(reservation_id)
        if not reservation:
            raise ValueError("Réservation introuvable")

        montant_brut = self.tarif_repo.calculer_montant_sejour(
            reservation.chambre.type_chambre,
            reservation.date_arrive,
            reservation.date_depart
        )

        nuitees = (reservation.date_depart - reservation.date_arrive).days
        if nuitees <= 0: nuitees = 1

        historique = self.reservation_repo.obtenir_historique_client(reservation.client.cin)
        nombre_sejours_passes = len(historique)

        pourcentage_remise = 0
        motif_remise = "Aucune remise applicable"

        if nombre_sejours_passes >= 3:#Remise de Fidélité
            pourcentage_remise = 10
            motif_remise = "Remise Fidélité (Client régulier)"
        elif nuitees >= 7:#Remise Long Séjour
            pourcentage_remise = 5
            motif_remise = "Remise Long Séjour (>= 7 nuits)"

       
        montant_remise = (montant_brut * pourcentage_remise) / 100
        montant_net = montant_brut - montant_remise

        return {
            "montant_brut": montant_brut,
            "pourcentage": pourcentage_remise,
            "montant_remise": montant_remise,
            "motif": motif_remise,
            "montant_net": montant_net
        }
            
class EffectuerCheckOutUseCase:
    def __init__(self, reservation_repo, chambre_repo):
        self.reservation_repo = reservation_repo
        self.chambre_repo = chambre_repo

    def execute(self, reservation_id):
        reservation = self.reservation_repo.trouver_par_id(reservation_id)
        if not reservation:
            raise ValueError("Réservation introuvable")
        chambre = reservation.chambre
        chambre.dispo = True 
        self.chambre_repo.mettre_a_jour(chambre)
        self.reservation_repo.archiver_reservation(reservation_id)
        return chambre
    
class CreerClientUseCase:
    def __init__(self, client_repo):
        self.client_repo = client_repo

    def execute(self, cin, nom, prenom, courriel, telephone, adresse):
        if self.client_repo.existe_deja(cin):
            raise ValueError(f"Un client avec le CIN {cin} existe déjà.")
        
        nouveau_client = Client(
            cin=cin,
            nom=nom,
            prenom=prenom,
            email=courriel,
            telephone=telephone,
            adresse=adresse
        )
        return self.client_repo.sauvegarder(nouveau_client)
class AjouterChambreUseCase:
    def __init__(self, chambre_repo):
        self.chambre_repo = chambre_repo

    def execute(self, num_chambre, type_chambre, etage, capacite, description, equipements):
        nouvelle_chambre = Chambre(
            num_chambre=num_chambre,
            type_chambre=type_chambre,
            etage=etage,
            capacite=capacite,
            description=description,
            equipements=equipements,
            dispo=True,
            est_actif=True
        )
        self.chambre_repo.sauvegarder(nouvelle_chambre)

class ModifierChambreUseCase:
    def __init__(self, chambre_repo):
        self.chambre_repo = chambre_repo

    def execute(self, num_chambre, type_chambre, etage, capacite, description, equipements):
        chambre_modifiee = Chambre(
            num_chambre=num_chambre,
            type_chambre=type_chambre,
            etage=etage,
            capacite=capacite,
            description=description,
            equipements=equipements,
            dispo=True, 
            est_actif=True
        )
        self.chambre_repo.mettre_a_jour(chambre_modifiee)

class ModifierClientUseCase:
    def __init__(self, client_repo):
        self.client_repo = client_repo

    def execute(self, cin, nom, prenom, courriel, telephone, adresse):
        if not self.client_repo.existe_deja(cin):
            raise ValueError("Client introuvable.")
            
        client_modifie = Client(
            cin=cin, nom=nom, prenom=prenom, email=courriel, telephone=telephone, adresse=adresse
        )
        return self.client_repo.mettre_a_jour(client_modifie)

class BasculerStatutClientUseCase:
    def __init__(self, client_repo):
        self.client_repo = client_repo

    def execute(self, cin):
        if not self.client_repo.existe_deja(cin):
            raise ValueError("Client introuvable.")
        self.client_repo.basculer_statut(cin)