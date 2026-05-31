import { useState, useEffect } from 'react';
import axios from 'axios';

const EQUIPEMENTS_DISPONIBLES = [
    "Climatisation", "Vue Mer", "Balcon", "Mini-bar", 
    "Wi-Fi Haut Débit", "Jacuzzi", "Coffre-fort", "TV Écran Plat"
];

export default function ChambreManager() {
    const [chambres, setChambres] = useState<any[]>([]);
    const [editingNum, setEditingNum] = useState<string | null>(null);
    const [showInactive, setShowInactive] = useState(false);
    
    const [formData, setFormData] = useState({
        num_chambre: '', type_chambre: 'Simple', etage: '', capacite: '', 
        description: '', equipements: [] as string[]
    });

    const fetchChambres = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/gestion-chambres/`);
            setChambres(response.data);
        } catch (error) {
            console.error("Erreur", error);
        }
    };

    useEffect(() => { fetchChambres(); }, []);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleEquipement = (eq: string) => {
        setFormData(prev => {
            if (prev.equipements.includes(eq)) {
                return { ...prev, equipements: prev.equipements.filter(e => e !== eq) };
            } else {
                return { ...prev, equipements: [...prev.equipements, eq] };
            }
        });
    };

    const handleEditClick = (chambre: any) => {
        setFormData({
            num_chambre: chambre.num_chambre,
            type_chambre: chambre.type_chambre,
            etage: chambre.etage,
            capacite: chambre.capacite,
            description: chambre.description,
            equipements: chambre.equipements ? chambre.equipements.split(', ') : []
        });
        setEditingNum(chambre.num_chambre);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // On transforme le tableau d'équipements en texte (ex: "Climatisation, Balcon") pour la base de données
        const dataToSend = { ...formData, equipements: formData.equipements.join(', ') };
        
        try {
            if (editingNum) {
                await axios.put(`http://127.0.0.1:8000/api/gestion-chambres/${editingNum}/`, dataToSend);
            } else {
                await axios.post(`http://127.0.0.1:8000/api/gestion-chambres/`, dataToSend);
            }
            setFormData({ num_chambre: '', type_chambre: 'Simple', etage: '', capacite: '', description: '', equipements: [] });
            setEditingNum(null);
            fetchChambres();
            alert(editingNum ? "✅ Chambre mise à jour !" : "✅ Chambre ajoutée !");
        } catch (error: any) {
            alert(`❌ Erreur :\n\n${error.response?.data?.erreur || "Vérifiez que le numéro de chambre n'existe pas déjà."}`);
        }
    };

    const handleDeactivate = async (num_chambre: string) => {
        if (window.confirm("Modifier le statut de cette chambre ?")) {
            await axios.delete(`http://127.0.0.1:8000/api/gestion-chambres/${num_chambre}/`);
            fetchChambres();
        }
    };

    const filteredChambres = chambres.filter(c => showInactive ? true : c.est_actif !== false);

    return (
        <div className="bg-white p-8 border border-gray-200">
            {/* FORMULAIRE */}
            <div className="mb-10 bg-gray-50 p-6 border border-gray-100 rounded">
                <h4 className="text-sm tracking-widest text-[#1A1A1A] uppercase mb-6 font-bold">
                    {editingNum ? `✏️ Modification Chambre N°${editingNum}` : "➕ Ajouter une Chambre"}
                </h4>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <input type="text" name="num_chambre" required disabled={!!editingNum} value={formData.num_chambre} onChange={handleChange} placeholder="Numéro (ex: 101)" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent disabled:text-gray-400" />
                    
                    <select name="type_chambre" value={formData.type_chambre} onChange={handleChange} className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent text-gray-700">
                        <option value="Simple">Simple</option>
                        <option value="Double">Double</option>
                        <option value="Suite">Suite</option>
                        <option value="Présidentielle">Présidentielle</option>
                    </select>
                    
                    <input type="number" name="etage" required min="0" value={formData.etage} onChange={handleChange} placeholder="Étage" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                    <input type="number" name="capacite" required min="1" value={formData.capacite} onChange={handleChange} placeholder="Capacité (pers.)" className="border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" />
                    
                    <textarea name="description" required value={formData.description} onChange={handleChange} placeholder="Description élégante de la chambre..." className="md:col-span-4 border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent resize-none h-20" />
                    
                    {/* SECTION ÉQUIPEMENTS */}
                    <div className="md:col-span-4 mt-2">
                        <span className="text-xs text-gray-500 uppercase font-semibold tracking-widest block mb-3">Équipements associés :</span>
                        <div className="flex flex-wrap gap-3">
                            {EQUIPEMENTS_DISPONIBLES.map(eq => (
                                <button type="button" key={eq} onClick={() => toggleEquipement(eq)} 
                                        className={`px-3 py-1 text-xs border rounded-full transition-all ${formData.equipements.includes(eq) ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-500'}`}>
                                    {formData.equipements.includes(eq) ? '✓ ' : '+ '}{eq}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-4 flex gap-4 mt-4">
                        <button type="submit" className="flex-1 bg-[#1A1A1A] hover:bg-black text-white text-sm font-semibold uppercase tracking-widest py-3">
                            {editingNum ? "Mettre à jour" : "Enregistrer la chambre"}
                        </button>
                        {editingNum && (
                            <button type="button" onClick={() => {setEditingNum(null); setFormData({num_chambre: '', type_chambre: 'Simple', etage: '', capacite: '', description: '', equipements: []})}} className="bg-gray-200 text-black px-6 text-sm uppercase font-semibold">Annuler</button>
                        )}
                    </div>
                </form>
            </div>

            {/* TABLEAU */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h4 className="text-sm tracking-widest text-gray-500 uppercase">Répertoire des Chambres</h4>
                    <label className="flex items-center space-x-2 text-xs font-semibold text-gray-500 cursor-pointer">
                        <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="accent-black" />
                        <span>AFFICHER LES CHAMBRES DÉSACTIVÉES</span>
                    </label>
                </div>

                <div className="overflow-x-auto shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 font-semibold uppercase text-xs">N°</th>
                                <th className="py-3 px-4 font-semibold uppercase text-xs">Type & Étage</th>
                                <th className="py-3 px-4 font-semibold uppercase text-xs">Équipements</th>
                                <th className="py-3 px-4 font-semibold uppercase text-xs">Dispo</th>
                                <th className="py-3 px-4 font-semibold uppercase text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredChambres.map((chambre) => (
                                <tr key={chambre.num_chambre} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-bold text-gray-900">{chambre.num_chambre}</td>
                                    <td className="py-3 px-4">
                                        <span className="font-medium text-black">{chambre.type_chambre}</span> <br/>
                                        <span className="text-xs text-gray-400">Étage {chambre.etage} • {chambre.capacite} Pers.</span>
                                    </td>
                                    <td className="py-3 px-4 text-xs italic text-gray-500 max-w-[200px] truncate">
                                        {chambre.equipements || "Aucun"}
                                    </td>
                                    <td className="py-3 px-4">
                                        {chambre.dispo ? <span className="text-green-600 text-xs font-bold">OUI</span> : <span className="text-red-500 text-xs font-bold">NON</span>}
                                    </td>
                                    <td className="py-3 px-4 text-right flex justify-end items-center gap-4">
                                        <button onClick={() => handleEditClick(chambre)} className="text-blue-600 hover:text-blue-800 font-medium">Éditer</button>
                                        {chambre.est_actif === false ? (
                                            <button onClick={() => handleDeactivate(chambre.num_chambre)} className="text-green-600 font-medium">Réactiver</button>
                                        ) : (
                                            <button onClick={() => handleDeactivate(chambre.num_chambre)} className="text-red-500 font-medium">Désactiver</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}