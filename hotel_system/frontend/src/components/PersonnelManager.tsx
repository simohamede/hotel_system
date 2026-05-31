import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PersonnelManager() {
    const [users, setUsers] = useState<any[]>([]);
    const [form, setForm] = useState({ username: '', password: '' });

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/personnel/');
            setUsers(res.data);
        } catch (error) {
            console.error("Erreur de chargement", error);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://127.0.0.1:8000/api/personnel/', form);
            setForm({ username: '', password: '' });
            fetchUsers();
            alert("✅ Compte réceptionniste créé avec succès !");
        } catch (error: any) {
            alert(`❌ Erreur : ${error.response?.data?.erreur || "Impossible de créer le compte"}`);
        }
    };

    const handleDelete = async (id: number, username: string) => {
        if (window.confirm(`Supprimer définitivement l'accès du réceptionniste "${username}" ?`)) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/personnel/${id}/`);
                fetchUsers();
            } catch (error) {
                alert("Erreur lors de la suppression.");
            }
        }
    };

    return (
        <div className="bg-white p-8 border border-gray-200 grid grid-cols-1 xl:grid-cols-3 gap-12">
            
            {/* COLONNE GAUCHE : FORMULAIRE */}
            <div className="xl:col-span-1">
                <div className="bg-gray-50 p-6 border border-gray-100 rounded">
                    <h4 className="text-sm tracking-widest text-[#1A1A1A] uppercase mb-6 font-bold">👤 Nouvel Employé</h4>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-semibold">Identifiant</label>
                            <input 
                                type="text" required value={form.username} 
                                onChange={e => setForm({...form, username: e.target.value})} 
                                placeholder="ex: recep_ahmed" 
                                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" 
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-semibold">Mot de passe provisoire</label>
                            <input 
                                type="password" required value={form.password} 
                                onChange={e => setForm({...form, password: e.target.value})} 
                                placeholder="••••••••" 
                                className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-black bg-transparent" 
                            />
                        </div>
                        
                        <button type="submit" className="mt-4 bg-[#1A1A1A] hover:bg-black text-white text-sm font-semibold uppercase tracking-widest py-3 transition-colors">
                            Créer le compte
                        </button>
                    </form>
                </div>
            </div>

            {/* COLONNE DROITE : LISTE DU PERSONNEL */}
            <div className="xl:col-span-2">
                <h4 className="text-sm tracking-widest text-gray-500 uppercase mb-4">Comptes Réceptionnistes Actifs</h4>
                <table className="w-full text-left text-sm text-gray-600 mb-8">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">ID</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">Identifiant</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">Date de création</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium text-gray-400">#{u.id}</td>
                                <td className="py-3 px-4 font-bold text-gray-900">{u.username}</td>
                                <td className="py-3 px-4">{u.date_joined}</td>
                                <td className="py-3 px-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(u.id, u.username)} 
                                        className="text-red-500 hover:text-red-700 font-bold text-xs uppercase"
                                    >
                                        Révoquer l'accès
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-6 text-center text-sm text-gray-400 italic">
                                    Aucun compte réceptionniste n'est configuré.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}