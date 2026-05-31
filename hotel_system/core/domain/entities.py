from dataclasses import dataclass
import datetime

@dataclass
class Chambre :
    num_chambre : str
    type_chambre : str
    etage : int
    capacite : int
    description : str
    dispo : bool
    est_actif: bool = True       
    equipements: str = ""

@dataclass
class Client :
    cin : str
    nom : str
    prenom : str
    email : str
    telephone : str
    adresse : str

@dataclass
class Reservation :
    date_arrive : datetime.date
    date_depart : datetime.date
    type_reservation : str
    nbr_personne : int
    client : Client
    chambre : Chambre

@dataclass
class Facture :
    reservation : Reservation
    detail_nuitees : int
    services : float
    remise : float
    montant_total : float