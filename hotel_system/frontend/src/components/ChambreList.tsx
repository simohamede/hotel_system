import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ChambreList() {
    const [chambres, setChambres] = useState<any[]>([]);

    useEffect(() => {
        const fetchChambres = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/chambres/');
                setChambres(response.data);
            } catch (error) {
                console.error("Erreur lors du chargement des chambres", error);
            }
        };
        fetchChambres();
    }, []);

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Chambres Disponibles</h2>
            
            {chambres.length === 0 ? (
                <p className="text-gray-500 italic">Aucune chambre disponible pour le moment.</p>
            ) : (
                // Voici la grille (grid) qui s'adapte à la taille de l'écran
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chambres.map((chambre) => (
                        // Voici la "Carte" pour chaque chambre
                        <div key={chambre.num_chambre} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                                <span className="font-bold text-blue-800 text-lg">Chambre {chambre.num_chambre}</span>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold uppercase tracking-wide">Dispo</span>
                            </div>
                            <div className="p-4">
                                <div className="text-gray-600 text-sm mb-3">
                                    <p><span className="font-semibold text-gray-800">Type :</span> {chambre.type_chambre}</p>
                                    <p><span className="font-semibold text-gray-800">Étage :</span> {chambre.etage}</p>
                                    <p><span className="font-semibold text-gray-800">Capacité :</span> {chambre.capacite} pers.</p>
                                </div>
                                <p className="text-gray-500 text-sm italic">"{chambre.description}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}