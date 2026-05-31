import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    // NOUVEAU : État pour gérer l'animation de chargement
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true); // 1. On lance l'animation
        setError('');
        
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/token/', {
                username,
                password
            });
            
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            onLogin();
        } catch (err) {
            setError("Identifiants incorrects. Accès refusé.");
            setIsLoading(false); // 2. On arrête l'animation s'il y a une erreur
        }
    };

    return (
        // Nouveau fond avec un léger dégradé élégant
        <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] to-[#EAE6DF] flex items-center justify-center px-4 font-sans">
            
            {/* Nouvelle carte avec effet "Glassmorphism" (verre) et bords arrondis */}
            <div className="bg-white/80 backdrop-blur-md p-10 shadow-2xl rounded-2xl max-w-md w-full border border-white/50">
                
                <div className="text-center mb-10">
                    {/* Un petit logo circulaire élégant avec ton initiale */}
                    <div className="mx-auto w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <span className="text-white font-playfair text-3xl font-bold">L</span>
                    </div>
                    <h2 className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-2">Accès Restreint</h2>
                    <h1 className="font-playfair text-3xl text-[#1A1A1A] tracking-wide">LAARIBI HOTEL</h1>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg mb-6 border border-red-100 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">Identifiant</label>
                        <input 
                            type="text" required value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 focus:border-[#1A1A1A] transition-all text-gray-800" 
                            placeholder="Nom d'utilisateur"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">Mot de passe</label>
                        <input 
                            type="password" required value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/20 focus:border-[#1A1A1A] transition-all text-gray-800" 
                            placeholder="••••••••"
                        />
                    </div>
                    
                    {/* Le bouton magique avec l'animation */}
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#1A1A1A] hover:bg-black text-white text-sm font-semibold uppercase tracking-widest py-4 mt-8 rounded-lg shadow-lg shadow-black/20 transition-all duration-300 flex justify-center items-center gap-3 disabled:opacity-80 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                {/* Le cercle d'animation (Spinner) de Tailwind */}
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authentification...
                            </>
                        ) : (
                            "Se connecter"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}