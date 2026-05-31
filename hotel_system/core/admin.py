from django.contrib import admin # type: ignore
from .infrastructure.models import ChambreModel, ClientModel, ReservationModel , FactureModel , TarifModel , SaisonModel

admin.site.register(ChambreModel)
admin.site.register(ClientModel)
admin.site.register(ReservationModel)
admin.site.register(FactureModel)
admin.site.register(SaisonModel)
admin.site.register(TarifModel)