import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Dashboard() {
    const [reservations, setReservations] = useState<any[]>([]);

    // États pour la facturation
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<number | null>(null);
    const [estimation, setEstimation] = useState<any>(null);
    const [servicesExtra, setServicesExtra] = useState<number>(0);

    // États pour la modification
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({ id: 0, date_arrive: '', date_depart: '', nbr_personne: 1, num_chambre: '' });

    const fetchReservations = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/reservations/');
            setReservations(response.data);
        } catch (error) {
            console.error("Erreur lors du chargement des réservations", error);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    // --- 1. GESTION DE LA FACTURATION ET CHECK-OUT ---
    const handleOuvrirFacturation = async (reservationId: number) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/factures/${reservationId}/estimer/`);
            setEstimation(response.data);
            setSelectedReservation(reservationId);
            setServicesExtra(0);
            setIsModalOpen(true);
        } catch (error: any) {
            alert(`❌ Impossible de calculer la facture :\n\n${error.response?.data?.erreur || "Erreur serveur"}`);
        }
    };

    const handleGenererFacture = async () => {
        if (!selectedReservation || !estimation) return;
        try {
            const payload = { services: servicesExtra, remise: estimation.montant_remise };
            await axios.post(`http://127.0.0.1:8000/api/factures/${selectedReservation}/generer/`, payload);
            await axios.post(`http://127.0.0.1:8000/api/reservations/${selectedReservation}/checkout/`);
            
            alert(`✅ Facture générée et Check-out effectué avec succès !\nLa chambre a été libérée.`);
            setIsModalOpen(false); 
            fetchReservations();
        } catch (error: any) {
            alert(`❌ Opération annulée :\n\n${error.response?.data?.erreur || "Erreur de connexion"}`);
            setIsModalOpen(false);
        }
    };

    // --- 2. GESTION DE L'ANNULATION ---
    const handleAnnuler = async (reservationId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ? Des pénalités s'appliqueront si l'arrivée est dans moins de 48h.")) {
            try {
                const response = await axios.post(`http://127.0.0.1:8000/api/reservations/${reservationId}/annuler/`);
                // On affiche le message du backend (qui contient le calcul de la pénalité !)
                alert(`✅ ${response.data.message}`);
                fetchReservations();
            } catch (error: any) {
                alert(`❌ Échec de l'annulation :\n\n${error.response?.data?.erreur || "Erreur de connexion"}`);
            }
        }
    };

    // --- 3. GESTION DE LA MODIFICATION ---
    const handleOuvrirModification = (res: any) => {
        setEditForm({
            id: res.id,
            date_arrive: res.date_arrive,
            date_depart: res.date_depart,
            nbr_personne: res.nbr_personne,
            num_chambre: res.num_chambre
        });
        setIsEditModalOpen(true);
    };

    const handleModifierSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`http://127.0.0.1:8000/api/reservations/${editForm.id}/modifier/`, editForm);
            alert("✅ Réservation modifiée avec succès !");
            setIsEditModalOpen(false);
            fetchReservations();
        } catch (error: any) {
            alert(`❌ Erreur lors de la modification :\n\n${error.response?.data?.erreur || "Vérifiez que la nouvelle chambre est disponible."}`);
        }
    };

    return (
        <div className="mb-12 bg-white rounded-xl shadow-md p-6 border border-gray-100 relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                Tableau de bord Réceptionniste
            </h2>
            
            {reservations.length === 0 ? (
                <p className="text-gray-500 italic">Aucune réservation en cours.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {reservations.map((res) => (
                        <div key={res.id} className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg shadow-sm flex flex-col justify-between">
                            
                            <div className="mb-4">
                                <p className="font-bold text-gray-800 text-lg">
                                    Chambre {res.num_chambre} 
                                    <span className="text-sm font-normal text-gray-500 ml-2">(Client: {res.client_cin})</span>
                                </p>
                                <div className="text-sm text-gray-600 mt-1 flex justify-between">
                                    <div>
                                        <p>📅 {res.date_arrive} ➔ {res.date_depart}</p>
                                        <p>👥 {res.nbr_personne} personne(s)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Les 3 boutons d'action */}
                            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                                <button onClick={() => handleOuvrirFacturation(res.id)} className="bg-[#1A1A1A] hover:bg-black text-white text-xs font-bold py-2 px-3 rounded shadow transition-colors flex-grow">
                                    🧾 Facturer & Check-out
                                </button>
                                <button onClick={() => handleOuvrirModification(res)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded shadow transition-colors">
                                    ✏️ Modifier
                                </button>
                                <button onClick={() => handleAnnuler(res.id)} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-3 rounded shadow transition-colors">
                                    ❌ Annuler
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL DE FACTURATION (Inchangé) --- */}
            {isModalOpen && estimation && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#FDFBF7] max-w-md w-full shadow-2xl relative border border-gray-200">
                        <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-playfair text-2xl text-[#1A1A1A]">Détail de la Facture</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-600 text-3xl font-light">&times;</button>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-3 text-gray-600">
                                <span>Séjour (Montant brut) :</span>
                                <span className="font-medium">{estimation.montant_brut} MAD</span>
                            </div>
                            {estimation.pourcentage > 0 && (
                                <div className="flex justify-between items-center mb-3 text-green-600 bg-green-50 p-2 rounded">
                                    <div>
                                        <span className="font-bold">Remise ({estimation.pourcentage}%)</span>
                                        <p className="text-xs italic">{estimation.motif}</p>
                                    </div>
                                    <span className="font-bold">- {estimation.montant_remise} MAD</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center mb-6 mt-4 border-t border-gray-200 pt-4">
                                <label className="text-gray-600 font-medium">Frais annexes (Services) :</label>
                                <div className="flex items-center">
                                    <input type="number" min="0" value={servicesExtra} onChange={(e) => setServicesExtra(Number(e.target.value))} className="w-24 border-b border-gray-300 py-1 text-right focus:outline-none focus:border-black bg-transparent mr-2"/>
                                    <span className="text-gray-600">MAD</span>
                                </div>
                            </div>
                            <div className="bg-gray-100 p-4 flex justify-between items-center rounded mb-6">
                                <span className="font-bold text-lg uppercase tracking-wider">Total à payer</span>
                                <span className="font-bold text-2xl text-[#1A1A1A]">{estimation.montant_net + servicesExtra} MAD</span>
                            </div>
                            <button onClick={handleGenererFacture} className="w-full bg-[#1A1A1A] hover:bg-black text-white font-bold uppercase tracking-widest py-4 transition-colors">
                                Valider & Générer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NOUVEAU : MODAL DE MODIFICATION --- */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white max-w-sm w-full shadow-2xl relative border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">✏️ Modifier Réservation</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-600 text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleModifierSubmit} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Chambre</label>
                                <input type="text" required value={editForm.num_chambre} onChange={e => setEditForm({...editForm, num_chambre: e.target.value})} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500 bg-transparent text-gray-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Arrivée</label>
                                    <input type="date" required value={editForm.date_arrive} onChange={e => setEditForm({...editForm, date_arrive: e.target.value})} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500 bg-transparent text-gray-800" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase font-bold">Départ</label>
                                    <input type="date" required value={editForm.date_depart} onChange={e => setEditForm({...editForm, date_depart: e.target.value})} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500 bg-transparent text-gray-800" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Personnes</label>
                                <input type="number" min="1" required value={editForm.nbr_personne} onChange={e => setEditForm({...editForm, nbr_personne: Number(e.target.value)})} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-blue-500 bg-transparent text-gray-800" />
                            </div>
                            <button type="submit" className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded shadow transition-colors">
                                Sauvegarder les modifications
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}