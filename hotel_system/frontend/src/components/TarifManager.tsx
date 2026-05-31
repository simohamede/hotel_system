import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TarifManager() {
    const [saisons, setSaisons] = useState<any[]>([]);
    const [tarifs, setTarifs] = useState<any[]>([]);

    // États pour les formulaires
    const [saisonForm, setSaisonForm] = useState({ nom: '', date_debut: '', date_fin: '' });
    const [tarifForm, setTarifForm] = useState({ type_chambre: 'Simple', saison_id: '', prix_par_nuit: '' });

    // Charger les données au démarrage
    const fetchData = async () => {
        try {
            const resSaisons = await axios.get('http://127.0.0.1:8000/api/saisons/');
            setSaisons(resSaisons.data);
            
            const resTarifs = await axios.get('http://127.0.0.1:8000/api/tarifs/');
            setTarifs(resTarifs.data);
        } catch (error) {
            console.error("Erreur de chargement", error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    // --- GESTION DES SAISONS ---
    const handleSaisonSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/saisons/', saisonForm);
            setSaisonForm({ nom: '', date_debut: '', date_fin: '' });
            fetchData();
            alert("✅ Saison ajoutée !");
        } catch (error: any) {
            alert(`❌ Erreur : ${error.response?.data?.erreur || "Impossible d'ajouter la saison"}`);
        }
    };

    const deleteSaison = async (id: number) => {
        if (window.confirm("Supprimer cette saison ? Attention, cela supprimera aussi les tarifs associés !")) {
            await axios.delete(`http://127.0.0.1:8000/api/saisons/${id}/`);
            fetchData();
        }
    };

    // --- GESTION DES TARIFS ---
    const handleTarifSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tarifForm.saison_id) {
            alert("Veuillez sélectionner une saison !");
            return;
        }
        try {
            await axios.post('http://127.0.0.1:8000/api/tarifs/', tarifForm);
            setTarifForm({ ...tarifForm, prix_par_nuit: '' }); // On garde le type et la saison pour aller plus vite
            fetchData();
            alert("✅ Tarif ajouté !");
        } catch (error: any) {
            alert(`❌ Erreur : ${error.response?.data?.erreur || "Impossible d'ajouter le tarif"}`);
        }
    };

    const deleteTarif = async (id: number) => {
        if (window.confirm("Supprimer ce tarif ?")) {
            await axios.delete(`http://127.0.0.1:8000/api/tarifs/${id}/`);
            fetchData();
        }
    };

    return (
        <div className="bg-white p-8 border border-gray-200 grid grid-cols-1 xl:grid-cols-2 gap-12">
            
            {/* COLONNE GAUCHE : LES SAISONS */}
            <div>
                <div className="mb-8 bg-gray-50 p-6 border border-gray-100 rounded">
                    <h4 className="text-sm tracking-widest text-[#1A1A1A] uppercase mb-6 font-bold">📅 Ajouter une Saison</h4>
                    <form onSubmit={handleSaisonSubmit} className="flex flex-col gap-4">
                        <input type="text" required value={saisonForm.nom} onChange={e => setSaisonForm({...saisonForm, nom: e.target.value})} placeholder="Nom (Ex: Haute Saison Été)" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Début</label>
                                <input type="date" required value={saisonForm.date_debut} onChange={e => setSaisonForm({...saisonForm, date_debut: e.target.value})} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Fin</label>
                                <input type="date" required value={saisonForm.date_fin} onChange={e => setSaisonForm({...saisonForm, date_fin: e.target.value})} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                            </div>
                        </div>
                        <button type="submit" className="mt-4 bg-[#1A1A1A] hover:bg-black text-white text-sm font-semibold uppercase tracking-widest py-3 transition-colors">Créer la Saison</button>
                    </form>
                </div>

                <h4 className="text-sm tracking-widest text-gray-500 uppercase mb-4">Périodes Enregistrées</h4>
                <table className="w-full text-left text-sm text-gray-600 mb-8">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="py-2 px-3 font-semibold uppercase text-xs">Saison</th>
                            <th className="py-2 px-3 font-semibold uppercase text-xs">Période</th>
                            <th className="py-2 px-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {saisons.map(s => (
                            <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-3 font-bold text-gray-900">{s.nom}</td>
                                <td className="py-3 px-3 text-xs">{s.date_debut} <br/><span className="text-gray-400">au {s.date_fin}</span></td>
                                <td className="py-3 px-3 text-right">
                                    <button onClick={() => deleteSaison(s.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                        {saisons.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-xs text-gray-400 italic">Aucune saison définie.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* COLONNE DROITE : LES TARIFS */}
            <div>
                <div className="mb-8 bg-gray-50 p-6 border border-gray-100 rounded">
                    <h4 className="text-sm tracking-widest text-[#1A1A1A] uppercase mb-6 font-bold">🏷️ Définir un Tarif</h4>
                    <form onSubmit={handleTarifSubmit} className="flex flex-col gap-4">
                        <select required value={tarifForm.type_chambre} onChange={e => setTarifForm({...tarifForm, type_chambre: e.target.value})} className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent text-gray-700">
                            <option value="Simple">Chambre Simple</option>
                            <option value="Double">Chambre Double</option>
                            <option value="Suite">Suite</option>
                            <option value="Présidentielle">Suite Présidentielle</option>
                        </select>
                        
                        <select required value={tarifForm.saison_id} onChange={e => setTarifForm({...tarifForm, saison_id: e.target.value})} className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent text-gray-700">
                            <option value="" disabled>-- Sélectionner la Saison --</option>
                            {saisons.map(s => (
                                <option key={s.id} value={s.id}>{s.nom}</option>
                            ))}
                        </select>

                        <input type="number" required min="0" step="0.01" value={tarifForm.prix_par_nuit} onChange={e => setTarifForm({...tarifForm, prix_par_nuit: e.target.value})} placeholder="Prix par nuit (MAD)" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                        
                        <button type="submit" disabled={saisons.length === 0} className="mt-4 bg-[#1A1A1A] hover:bg-black text-white text-sm font-semibold uppercase tracking-widest py-3 disabled:bg-gray-300">
                            Enregistrer le Tarif
                        </button>
                    </form>
                </div>

                <h4 className="text-sm tracking-widest text-gray-500 uppercase mb-4">Grille Tarifaire</h4>
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="py-2 px-3 font-semibold uppercase text-xs">Chambre</th>
                            <th className="py-2 px-3 font-semibold uppercase text-xs">Saison</th>
                            <th className="py-2 px-3 font-semibold uppercase text-xs">Prix / Nuit</th>
                            <th className="py-2 px-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tarifs.map(t => (
                            <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-3 font-medium text-gray-900">{t.type_chambre}</td>
                                <td className="py-3 px-3 text-xs">{t.saison_nom}</td>
                                <td className="py-3 px-3 font-bold text-green-700">{t.prix_par_nuit} MAD</td>
                                <td className="py-3 px-3 text-right">
                                    <button onClick={() => deleteTarif(t.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                        {tarifs.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-xs text-gray-400 italic">Aucun tarif défini (Prix par défaut: 500 MAD).</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}