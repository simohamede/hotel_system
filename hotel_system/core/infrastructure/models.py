from django.db import models # type: ignore


class ClientModel(models.Model):
    cin = models.CharField(max_length=20 , unique=True , primary_key=True)
    nom = models.CharField(max_length=20)
    prenom = models.CharField(max_length=20)
    email = models.EmailField()
    telephone= models.CharField(max_length=20)
    adresse = models.CharField(max_length=100)
    est_actif = models.BooleanField(default=True)
    def __str__(self):
        return f"{self.nom} {self.prenom} - {self.cin}"
    class Meta:
        app_label = 'core'

class ChambreModel(models.Model):
    num_chambre = models.IntegerField(unique=True)
    type_chambre = models.CharField(max_length=20)
    etage = models.IntegerField()
    capacite = models.IntegerField()
    description = models.TextField()
    dispo = models.BooleanField()
    est_actif = models.BooleanField(default=True)
    equipements = models.TextField(blank=True, default="")
    def __str__(self):
        return  f"Chambre {self.num_chambre} - {self.type_chambre}"
    class Meta:
        app_label = 'core'

class ReservationModel(models.Model):
    date_arrive = models.DateField()
    date_depart = models.DateField()
    type_reservation = models.CharField(max_length=20)
    nbr_personne = models.IntegerField()
    client = models.ForeignKey(ClientModel, on_delete=models.CASCADE)
    chambre = models.ForeignKey(ChambreModel, on_delete=models.CASCADE)
    statut = models.CharField(max_length=20, default='ACTIVE') 
    montant_facture = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f"Réservation {self.id} - {self.client.nom} ({self.statut})"
    class Meta:
        app_label = 'core'

class FactureModel(models.Model):
    reservation = models.OneToOneField(ReservationModel, on_delete=models.CASCADE)
    detail_nuitees = models.IntegerField(default=1)
    services = models.FloatField(default=0.0)
    remise = models.FloatField(default=0.0)
    montant_total = models.FloatField(default=0.0)  
    date_emission = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Facture pour la réservation {self.reservation.id} - {self.montant_total} MAD"
    class Meta:
        app_label = 'core'


class SaisonModel(models.Model):
    nom = models.CharField(max_length=50) # "Haute Saison", "Basse Saison"
    date_debut = models.DateField()
    date_fin = models.DateField()

    def __str__(self):
        return f"{self.nom} ({self.date_debut} au {self.date_fin})"
        
    class Meta:
        app_label = 'core'

class TarifModel(models.Model):
    type_chambre = models.CharField(max_length=20) # Ex: "Simple", "Double", "Suite"
    saison = models.ForeignKey(SaisonModel, on_delete=models.CASCADE)
    prix_par_nuit = models.FloatField()

    def __str__(self):
        return f"{self.type_chambre} - {self.saison.nom} : {self.prix_par_nuit} MAD"
        
    class Meta:
        app_label = 'core'