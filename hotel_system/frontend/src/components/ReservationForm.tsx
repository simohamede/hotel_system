import { useState } from 'react';
import axios from 'axios';
export default function ReservationForm() {
    const [formData, setFormData] = useState({
    client_cin: '',
    num_chambre: '',
    date_arrive: '',
    date_depart: '',
    nbr_personnes: ''
});
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
        ...formData, // On garde les anciennes valeurs
        [name]: value // On met à jour seulement le champ modifié
    });
};
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
       e.preventDefault();
         try {
            const response = await axios.post('http://127.0.0.1:8000/api/reserver/', formData);
            alert("Succès : " + response.data.message);
        } catch (error: any) {
            if (error.response) {
               alert("Erreur : " + error.response.data.erreur);
           } else {
               alert("Erreur de connexion au serveur.");
           }
        }
    };
   return (
        <div className="bg-white shadow-2xl p-4 md:p-6 w-full max-w-6xl mx-auto">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                
                {/* Client CIN */}
                <div className="flex flex-col border-b border-gray-300 pb-1">
                    <label className="text-xs text-gray-400 uppercase tracking-widest mb-1">Client (CIN)</label>
                    <input type="text" name="client_cin" required value={formData.client_cin} onChange={handleChange} 
                           className="focus:outline-none text-gray-800 font-medium bg-transparent" placeholder="Ex: AB12345" />
                </div>

                {/* Chambre */}
                <div className="flex flex-col border-b border-gray-300 pb-1">
                    <label className="text-xs text-gray-400 uppercase tracking-widest mb-1">Chambre</label>
                    <input type="number" name="num_chambre" required value={formData.num_chambre} onChange={handleChange} 
                           className="focus:outline-none text-gray-800 font-medium bg-transparent" placeholder="N°" />
                </div>

                {/* Arrivée */}
                <div className="flex flex-col border-b border-gray-300 pb-1">
                    <label className="text-xs text-gray-400 uppercase tracking-widest mb-1">Check-in</label>
                    <input type="date" name="date_arrive" required value={formData.date_arrive} onChange={handleChange} 
                           className="focus:outline-none text-gray-800 font-medium bg-transparent" />
                </div>

                {/* Départ */}
                <div className="flex flex-col border-b border-gray-300 pb-1">
                    <label className="text-xs text-gray-400 uppercase tracking-widest mb-1">Check-out</label>
                    <input type="date" name="date_depart" required value={formData.date_depart} onChange={handleChange} 
                           className="focus:outline-none text-gray-800 font-medium bg-transparent" />
                </div>

                {/* Personnes */}
                <div className="flex flex-col border-b border-gray-300 pb-1">
                    <label className="text-xs text-gray-400 uppercase tracking-widest mb-1">Personnes</label>
                    <input type="number" name="nbr_personnes" required value={formData.nbr_personnes} onChange={handleChange} 
                           className="focus:outline-none text-gray-800 font-medium bg-transparent" placeholder="Ex: 2" />
                </div>

                {/* Bouton Noir Luxe */}
                <button type="submit" className="bg-[#1A1A1A] hover:bg-black text-white text-sm font-semibold uppercase tracking-widest py-3 px-6 transition-colors duration-300 h-full">
                    Réserver
                </button>
            </form>
        </div>
    );
}