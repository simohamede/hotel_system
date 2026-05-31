import { useState, useEffect } from 'react';
import axios from 'axios';

export default function HistoriqueFactures() {
    const [factures, setFactures] = useState<any[]>([]);
    const [factureAImprimer, setFactureAImprimer] = useState<any | null>(null);

    useEffect(() => {
        const fetchFactures = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/factures/');
                setFactures(response.data);
            } catch (error) {
                console.error("Erreur de chargement des factures", error);
            }
        };
        fetchFactures();
    }, []);

    const handleImprimer = (facture: any) => {
        setFactureAImprimer(facture);
        // Petit délai pour laisser à React le temps d'afficher le ticket avant de lancer l'impression
        setTimeout(() => {
            window.print();
        }, 100);
    };

    return (
        <div className="bg-white p-8 border border-gray-200">
            
            {/* --- VUE NORMALE (Cachée lors de l'impression) --- */}
            <div className="print:hidden">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="font-playfair text-3xl text-[#1A1A1A] mb-2">Historique des Factures</h2>
                        <p className="text-gray-500 text-sm">Consultez et imprimez les factures de vos clients.</p>
                    </div>
                </div>

                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">N° Facture</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">Date</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">Client</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">Chambre</th>
                            <th className="py-3 px-4 font-semibold uppercase text-xs">Total net</th>
                            <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {factures.map(f => (
                            <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 font-bold text-gray-900">FAC-{f.id.toString().padStart(4, '0')}</td>
                                <td className="py-3 px-4 text-xs">{f.date_emission}</td>
                                <td className="py-3 px-4 font-medium">{f.client_nom} <br/><span className="text-xs text-gray-400">{f.client_cin}</span></td>
                                <td className="py-3 px-4">{f.chambre}</td>
                                <td className="py-3 px-4 font-bold text-green-700">{f.total} MAD</td>
                                <td className="py-3 px-4 text-right">
                                    <button 
                                        onClick={() => handleImprimer(f)}
                                        className="text-[#1A1A1A] hover:text-blue-600 font-bold text-xs uppercase underline"
                                    >
                                        Imprimer (PDF)
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- VUE IMPRESSION TICKET DE CAISSE (Visible UNIQUEMENT lors de l'impression) --- */}
            <div className="hidden print:block text-black p-8 max-w-2xl mx-auto font-sans">
                {factureAImprimer && (
                    <>
                        <div className="text-center mb-10 border-b-2 border-black pb-6">
                            <h1 className="text-4xl font-serif tracking-widest uppercase mb-2">Grand Hôtel</h1>
                            <p className="text-sm">Adresse de l'Hôtel • Ville, Maroc</p>
                            <p className="text-sm">Tél : +212 5 00 00 00 00</p>
                        </div>

                        <div className="flex justify-between mb-8 text-sm">
                            <div>
                                <p className="font-bold uppercase">Facturé à :</p>
                                <p>{factureAImprimer.client_nom}</p>
                                <p>CIN : {factureAImprimer.client_cin}</p>
                            </div>
                            <div className="text-right">
                                <p><span className="font-bold">Facture N° :</span> FAC-{factureAImprimer.id.toString().padStart(4, '0')}</p>
                                <p><span className="font-bold">Date :</span> {factureAImprimer.date_emission}</p>
                                <p><span className="font-bold">Chambre :</span> {factureAImprimer.chambre}</p>
                            </div>
                        </div>

                        <table className="w-full text-left mb-8 text-sm border-collapse">
                            <thead>
                                <tr className="border-b-2 border-black">
                                    <th className="py-2">Description</th>
                                    <th className="py-2 text-center">Quantité</th>
                                    <th className="py-2 text-right">Montant</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-300">
                                    <td className="py-3">
                                        Séjour du {factureAImprimer.date_arrive} au {factureAImprimer.date_depart}
                                    </td>
                                    <td className="py-3 text-center">{factureAImprimer.nuitees} Nuit(s)</td>
                                    <td className="py-3 text-right">
                                        {factureAImprimer.total - factureAImprimer.services + factureAImprimer.remise} MAD
                                    </td>
                                </tr>
                                {factureAImprimer.services > 0 && (
                                    <tr className="border-b border-gray-300">
                                        <td className="py-3">Services additionnels (Consommations, etc.)</td>
                                        <td className="py-3 text-center">-</td>
                                        <td className="py-3 text-right">{factureAImprimer.services} MAD</td>
                                    </tr>
                                )}
                                {factureAImprimer.remise > 0 && (
                                    <tr className="text-green-700 italic border-b border-gray-300">
                                        <td className="py-3">Remise commerciale appliquée</td>
                                        <td className="py-3 text-center">-</td>
                                        <td className="py-3 text-right">- {factureAImprimer.remise} MAD</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="flex justify-end">
                            <div className="w-64">
                                <div className="flex justify-between border-t-2 border-black pt-2 font-bold text-lg">
                                    <span>Total Net :</span>
                                    <span>{factureAImprimer.total} MAD</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 text-center text-xs text-gray-500">
                            <p>Merci pour votre séjour. À très bientôt.</p>
                            <p>La direction.</p>
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}