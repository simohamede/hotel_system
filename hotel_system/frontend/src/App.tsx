import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ReservationForm from './components/ReservationForm';
import ChambreList from './components/ChambreList';
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import Login from './components/Login';
import ChambreManager from './components/ChambreManager';
import TarifManager from './components/TarifManager';
import HistoriqueFactures from './components/HistoriqueFactures';
import PersonnelManager from './components/PersonnelManager';


axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

const getRoleFromToken = (token: string | null) => {
  if (!token) return false;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    const payload = JSON.parse(jsonPayload);
    console.log("Contenu décodé du Token :", payload);
    return payload.is_staff === true;
  } catch (e) {
    console.error("Erreur de décodage du token :", e);
    return false;
  }
};

const ENHANCED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

  /* Entrée de page */
  .mlh-page {
    animation: mlhFadeIn 0.5s ease forwards;
  }
  @keyframes mlhFadeIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Animations héro séquentielles */
  .mlh-h1 { animation: mlhSlideUp 0.9s ease forwards; }
  .mlh-h2 { animation: mlhSlideUp 0.9s ease 0.15s both; }
  .mlh-h3 { animation: mlhSlideUp 0.9s ease 0.30s both; }
  .mlh-h4 { animation: mlhSlideUp 0.9s ease 0.45s both; }
  .mlh-h5 { animation: mlhSlideUp 0.9s ease 0.60s both; }
  @keyframes mlhSlideUp {
    from { opacity: 0; transform: translateY(26px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Nav links — underline doré au hover */
  .mlh-navlink {
    position: relative;
    transition: color 0.25s ease;
    text-decoration: none !important;
  }
  .mlh-navlink::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 0;
    height: 1px;
    background: #C8A055;
    transition: width 0.28s ease;
  }
  .mlh-navlink:hover         { color: #C8A055 !important; }
  .mlh-navlink:hover::after  { width: 100%; }
  .mlh-navlink-admin         { color: #C8A055 !important; }
  .mlh-navlink-admin::after  { background: #C8A055; }

  /* Bouton déconnexion */
  .mlh-logout {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 18px;
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #7A7A7A;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.10);
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .mlh-logout:hover {
    color: #C8A055;
    border-color: rgba(200,160,85,0.45);
  }

  /* Ligne décorative dorée */
  .mlh-gold-line {
    height: 1px;
    background: linear-gradient(90deg, #C8A055 0%, #E8D09A 50%, transparent 100%);
  }

  /* Badge tag de section */
  .mlh-tag {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    font-family: 'Outfit', sans-serif;
    font-size: 9.5px;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: #C8A055;
  }
  .mlh-tag::before,
  .mlh-tag::after {
    content: '';
    display: inline-block;
    width: 18px;
    height: 1px;
    background: rgba(200,160,85,0.55);
  }

  /* Carte formulaire */
  .mlh-form-card {
    background: #fff;
    border-top: 2px solid #C8A055;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(200,160,85,0.08);
  }

  /* Scrollbar subtile */
  ::-webkit-scrollbar        { width: 5px; }
  ::-webkit-scrollbar-track  { background: #F4EFE6; }
  ::-webkit-scrollbar-thumb  { background: #D4BA82; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #C8A055; }

  /* Séparateur nav */
  .mlh-nav-sep {
    width: 1px;
    height: 18px;
    background: rgba(255,255,255,0.10);
    display: inline-block;
    vertical-align: middle;
  }
  .mlh-nav-sep-gold {
    width: 1px;
    height: 18px;
    background: rgba(200,160,85,0.20);
    display: inline-block;
    vertical-align: middle;
  }
`;

const PageSection = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <div className="mlh-page" style={{ backgroundColor: '#FDFAF5', minHeight: '100vh' }}>
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 40px 80px' }}>
      {/* En-tête décoratif */}
      <div style={{ marginBottom: 40 }}>
        <span className="mlh-tag">{subtitle ?? 'Gestion'}</span>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
            fontWeight: 500,
            color: '#1A1208',
            marginTop: 10,
            marginBottom: 14,
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </h2>
        <div className="mlh-gold-line" style={{ maxWidth: 260 }} />
      </div>

      {children}
    </div>
  </div>
);


const Accueil = ({ isAdmin }: { isAdmin: boolean }) => (
  <>
    {/* ---- Bloc Héro ---- */}
    <div
      style={{
        background:
          'linear-gradient(165deg, #F2E6D3 0%, #F8F1E7 35%, #FAF6EE 65%, #FDFAF6 100%)',
      }}
    >
      <header style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 16, paddingLeft: 16, paddingRight: 16 }}>

        {/* Badge rôle */}
        <div className="mlh-h1">
          <span className="mlh-tag">
            {isAdmin ? 'Espace Direction' : 'Espace Réceptionniste'}
          </span>
        </div>

        {/* Nom de l'hôtel */}
        <h1
          className="mlh-h2"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(3.2rem, 9vw, 7.5rem)',
            fontWeight: 600,
            color: '#1A1208',
            lineHeight: 1.0,
            letterSpacing: '0.06em',
            marginTop: 20,
            marginBottom: 6,
          }}
        >
          MOHAMED LAARIBI
        </h1>

        {/* Sous-titre */}
        <p
          className="mlh-h3"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 11,
            letterSpacing: '0.55em',
            textTransform: 'uppercase',
            color: '#9C8055',
            marginTop: 4,
            marginBottom: 0,
          }}
        >
          HÔTEL &amp; SUITES
        </p>

        {/* Ornement central */}
        <div
          className="mlh-h4"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginTop: 28,
            marginBottom: 28,
          }}
        >
          <span
            style={{
              display: 'block',
              width: 60,
              height: 1,
              background: 'linear-gradient(90deg, transparent, #C8A055)',
            }}
          />
          {/* Losange décoratif */}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect
              x="5" y="0.5"
              width="6.36" height="6.36"
              transform="rotate(45 5 5)"
              fill="none"
              stroke="#C8A055"
              strokeWidth="1"
            />
          </svg>
          <span
            style={{
              display: 'block',
              width: 60,
              height: 1,
              background: 'linear-gradient(90deg, #C8A055, transparent)',
            }}
          />
        </div>
      </header>

      {/* ---- Formulaire de réservation ---- */}
      <section
        className="mlh-h5"
        style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px 80px' }}
      >
        <div className="mlh-form-card" style={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Header de la carte */}
          <div
            style={{
              padding: '10px 24px',
              background: '#F8F4EC',
              borderBottom: '1px solid #EDE3D4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span className="mlh-tag" style={{ fontSize: 9 }}>
              Nouvelle Réservation
            </span>
          </div>
          {/* Contenu — composant inchangé */}
          <div style={{ padding: '20px 24px 24px' }}>
            <ReservationForm />
          </div>
        </div>
      </section>
    </div>

    {/* ---- Sections principales ---- */}
    <main style={{ backgroundColor: '#FDFAF5', paddingBottom: 80 }}>
      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 40px 0', display: 'flex', flexDirection: 'column', gap: 64 }}
      >
        {/* Réservations Actives */}
        <section className="mlh-page">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 32 }}>
            <div>
              <span
                className="mlh-tag"
                style={{ display: 'block', marginBottom: 8, fontSize: 9 }}
              >
                Tableau de bord
              </span>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                  fontWeight: 500,
                  color: '#1A1208',
                  letterSpacing: '0.03em',
                  margin: 0,
                }}
              >
                Réservations Actives
              </h3>
            </div>
            <div className="mlh-gold-line" style={{ flex: 1, marginBottom: 4 }} />
          </div>
          <Dashboard />
        </section>

        {/* Disponibilités */}
        <section className="mlh-page">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginBottom: 32 }}>
            <div>
              <span
                className="mlh-tag"
                style={{ display: 'block', marginBottom: 8, fontSize: 9 }}
              >
                Inventaire
              </span>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                  fontWeight: 500,
                  color: '#1A1208',
                  letterSpacing: '0.03em',
                  margin: 0,
                }}
              >
                Disponibilités
              </h3>
            </div>
            <div className="mlh-gold-line" style={{ flex: 1, marginBottom: 4 }} />
          </div>
          <ChambreList />
        </section>
      </div>
    </main>
  </>
);

// ============================================================
// APP PRINCIPALE (logique identique)
// ============================================================
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token')
  );
  const [isAdmin, setIsAdmin] = useState(
    getRoleFromToken(localStorage.getItem('access_token'))
  );

  useEffect(() => {
    if (isAuthenticated) {
      setIsAdmin(getRoleFromToken(localStorage.getItem('access_token')));
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      {/* Styles enrichis */}
      <style>{ENHANCED_STYLES}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#FDFAF5' }}>

        {/* ======================================================
            NAVIGATION — dark avec accents dorés
        ====================================================== */}
        <nav
          style={{
            background: '#0F0F0F',
            borderBottom: '1px solid rgba(200,160,85,0.18)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 40px',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          {/* Gauche : Logo + liens */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>

            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '0.12em',
                }}
              >
                M<span style={{ color: '#C8A055' }}>L</span>H
                <span style={{ color: '#C8A055', fontSize: 26, lineHeight: 1 }}>.</span>
              </span>
            </Link>

            <span className="mlh-nav-sep" />

            {/* Liens principaux */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              {[
                { to: '/', label: 'Accueil' },
                { to: '/clients', label: 'Clients' },
                { to: '/factures', label: 'Factures' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="mlh-navlink"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#8A8A8A',
                  }}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Liens admin (conditionnels — logique inchangée) */}
            {isAdmin && (
              <>
                <span className="mlh-nav-sep-gold" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 8,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'rgba(200,160,85,0.5)',
                      marginRight: 8,
                    }}
                  >
                    Direction
                  </span>
                  {[
                    { to: '/chambres', label: 'Chambres' },
                    { to: '/tarifs',   label: 'Yield Mgmt' },
                    { to: '/personnel', label: 'Personnel' },
                  ].map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="mlh-navlink mlh-navlink-admin"
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        marginLeft: 16,
                      }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Droite : Déconnexion */}
          <button onClick={handleLogout} className="mlh-logout">
            <span>Déconnexion</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </nav>

        {/* ======================================================
            ROUTES (logique de redirection inchangée)
        ====================================================== */}
        <Routes>
          <Route path="/" element={<Accueil isAdmin={isAdmin} />} />

          <Route
            path="/clients"
            element={
              <PageSection title="Espace Clients" subtitle="Gestion Clientèle">
                <ClientManager />
              </PageSection>
            }
          />

          <Route
            path="/factures"
            element={
              <PageSection title="Historique des Factures" subtitle="Comptabilité">
                <HistoriqueFactures />
              </PageSection>
            }
          />

          <Route
            path="/chambres"
            element={
              isAdmin ? (
                <PageSection title="Gestion des Chambres" subtitle="Administration">
                  <ChambreManager />
                </PageSection>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/tarifs"
            element={
              isAdmin ? (
                <PageSection title="Gestion Tarifaire" subtitle="Yield Management">
                  <TarifManager />
                </PageSection>
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/personnel"
            element={
              isAdmin ? (
                <PageSection title="Gestion du Personnel" subtitle="Ressources Humaines">
                  <PersonnelManager />
                </PageSection>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;