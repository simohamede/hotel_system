import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ClientManager() {
    const [clients, setClients] = useState<any[]>([]);
    const [editingCin, setEditingCin] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        cin: '', nom: '', prenom: '', courriel: '', telephone: '', adresse: ''
    });
    
    // Nouveaux états pour l'historique et la recherche
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    
    // États pour la fenêtre Modale d'Historique
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [clientHistory, setClientHistory] = useState<any[]>([]);
    const [currentHistoryClient, setCurrentHistoryClient] = useState<any>(null);

    const fetchClients = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/clients/');
            setClients(response.data);
        } catch (error) {
            console.error("Erreur", error);
        }
    };

    useEffect(() => { fetchClients(); }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (client: any) => {
        setFormData({
            cin: client.cin || '',
            nom: client.nom || '',
            prenom: client.prenom || '',
            courriel: client.courriel || client.email || '', 
            telephone: client.telephone || '',
            adresse: client.adresse || ''
        });
        setEditingCin(client.cin);
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCin) {
                await axios.put(`http://127.0.0.1:8000/api/clients/${editingCin}/`, formData);
            } else {
                await axios.post('http://127.0.0.1:8000/api/clients/', formData);
            }
            setFormData({ cin: '', nom: '', prenom: '', courriel: '', telephone: '', adresse: '' });
            setEditingCin(null);
            fetchClients();
        } catch (error: any) {
            alert(`❌ Échec :\n\n${error.response?.data?.erreur || "Erreur"}`);
        }
    };

    const handleDeactivate = async (cin: string) => {
        if (window.confirm("Voulez-vous modifier le statut de ce client ?")) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/clients/${cin}/`);
                fetchClients();
            } catch (error) {
                alert("Erreur lors du changement de statut.");
            }
        }
    };

    // NOUVELLE FONCTION : Récupérer et afficher l'historique
    const handleViewHistory = async (client: any) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/clients/${client.cin}/historique/`);
            setClientHistory(response.data);
            setCurrentHistoryClient(client);
            setIsHistoryModalOpen(true);
        } catch (error) {
            alert("Impossible de charger l'historique.");
        }
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = 
            client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.cin.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.telephone.includes(searchTerm);
            
        const matchesStatus = showInactive ? true : client.est_actif !== false;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-white p-8 border border-gray-200 relative">
            
            {/* FORMULAIRE (Reste identique) */}
            <div className="mb-10 bg-gray-50 p-6 border border-gray-100 rounded">
                <h4 className="text-sm tracking-widest text-[#1A1A1A] uppercase mb-6 font-bold">
                    {editingCin ? `✏️ Modification du profil : ${editingCin}` : "➕ Nouveau Profil Client"}
                </h4>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <input type="text" name="cin" required disabled={!!editingCin} value={formData.cin} onChange={handleChange} placeholder="CIN (Ex: AB12345)" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent disabled:text-gray-400" />
                    <input type="text" name="nom" required value={formData.nom} onChange={handleChange} placeholder="Nom" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                    <input type="text" name="prenom" required value={formData.prenom} onChange={handleChange} placeholder="Prénom" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                    <input type="email" name="courriel" required value={formData.courriel} onChange={handleChange} placeholder="Courriel (Email)" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                    <input type="text" name="telephone" required value={formData.telephone} onChange={handleChange} placeholder="Téléphone" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                    <input type="text" name="adresse" required value={formData.adresse} onChange={handleChange} placeholder="Adresse complète" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                    
                    <div className="lg:col-span-3 flex gap-4 mt-4">
                        <button type="submit" className="flex-1 bg-[#1A1A1A] hover:bg-black text-white text-sm font-semibold uppercase tracking-widest py-3 transition-colors">
                            {editingCin ? "Mettre à jour" : "Enregistrer"}
                        </button>
                        {editingCin && (
                            <button type="button" onClick={() => {setEditingCin(null); setFormData({cin: '', nom: '', prenom: '', courriel: '', telephone: '', adresse: ''})}} className="bg-gray-200 hover:bg-gray-300 text-black px-6 text-sm uppercase font-semibold">
                                Annuler
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* TABLEAU */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm tracking-widest text-gray-500 uppercase">Répertoire des Clients</h4>
                        <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 cursor-pointer">
                            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="accent-black" />
                            <span>AFFICHER LES CLIENTS DÉSACTIVÉS</span>
                        </label>
                    </div>
                    
                    <input type="text" placeholder="🔍 Rechercher par Nom, CIN..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-72 border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-black rounded-full bg-white shadow-sm" />
                </div>

                {filteredClients.length === 0 ? (
                    <p className="text-gray-400 italic text-sm">Aucun client trouvé.</p>
                ) : (
                    <div className="overflow-x-auto shadow-sm">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 font-semibold uppercase text-xs">CIN</th>
                                    <th className="py-3 px-4 font-semibold uppercase text-xs">Nom & Prénom</th>
                                    <th className="py-3 px-4 font-semibold uppercase text-xs">Contact</th>
                                    <th className="py-3 px-4 font-semibold uppercase text-xs text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr key={client.cin} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 font-medium text-gray-900">{client.cin}</td>
                                        <td className="py-3 px-4">{client.nom} {client.prenom}</td>
                                        <td className="py-3 px-4 text-xs">
                                            {client.telephone} <br/> <span className="text-gray-400">{client.courriel}</span>
                                        </td>
                                        <td className="py-3 px-4 text-right flex justify-end items-center gap-4">
                                            {/* NOUVEAU BOUTON HISTORIQUE */}
                                            <button onClick={() => handleViewHistory(client)} className="text-gray-600 hover:text-black font-semibold tracking-wider text-xs border-b border-transparent hover:border-black transition-all">
                                                📖 HISTORIQUE
                                            </button>
                                            
                                            <button onClick={() => handleEditClick(client)} className="text-blue-600 hover:text-blue-800 font-medium">Éditer</button>
                                            
                                            {client.est_actif === false ? (
                                                <button onClick={() => handleDeactivate(client.cin)} className="text-green-600 hover:text-green-800 font-medium">Réactiver</button>
                                            ) : (
                                                <button onClick={() => handleDeactivate(client.cin)} className="text-red-500 hover:text-red-700 font-medium">Désactiver</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* FENÊTRE MODALE DE L'HISTORIQUE (Le fameux Pop-up) */}
            {isHistoryModalOpen && currentHistoryClient && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#FDFBF7] max-w-3xl w-full shadow-2xl relative border border-gray-200">
                        
                        {/* En-tête de la modale */}
                        <div className="bg-white p-6 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-playfair text-2xl text-[#1A1A1A]">Historique des Séjours</h3>
                                <p className="text-sm tracking-widest text-gray-500 uppercase mt-1">
                                    {currentHistoryClient.nom} {currentHistoryClient.prenom} ({currentHistoryClient.cin})
                                </p>
                            </div>
                            <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-red-600 text-3xl font-light transition-colors">
                                &times;
                            </button>
                        </div>

                        {/* Corps de la modale avec le tableau */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {clientHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="text-4xl block mb-4">🧳</span>
                                    <p className="text-gray-500 italic">Aucun séjour archivé pour ce client.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="border-b border-gray-300">
                                        <tr>
                                            <th className="py-3 px-4 font-semibold uppercase text-xs">Arrivée</th>
                                            <th className="py-3 px-4 font-semibold uppercase text-xs">Départ</th>
                                            <th className="py-3 px-4 font-semibold uppercase text-xs">Chambre</th>
                                            <th className="py-3 px-4 font-semibold uppercase text-xs text-right">Facture</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientHistory.map((res) => (
                                            <tr key={res.id} className="border-b border-gray-200 hover:bg-white transition-colors">
                                                <td className="py-4 px-4 font-medium">{res.date_arrive}</td>
                                                <td className="py-4 px-4">{res.date_depart}</td>
                                                <td className="py-4 px-4">N° {res.chambre}</td>
                                                <td className="py-4 px-4 text-right font-semibold text-[#1A1A1A]">
                                                    {res.montant ? `${res.montant} MAD` : 'Non calculé'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}