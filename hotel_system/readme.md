# Système de Gestion Hôtelière — Laaribi Boutique Hotel

> Système d'information dédié à la gestion des réservations hôtelières, conçu en respectant rigoureusement les principes de la **Clean Architecture** afin de garantir une séparation stricte des responsabilités, une haute testabilité et une évolutivité optimale.

**Auteur :** Mohamed Laaribi

---

## 📁 Architecture du Dépôt

```
.
├── uml/                  # Diagrammes de conception (Cas d'utilisation, Classes, etc.)
└── hotel_system/         # Code source complet de l'application
    ├── core/             # Couches Clean Architecture (Entities, Use Cases, Repositories)
    ├── frontend/         # Interface utilisateur React
    └── hotel_system/     # Configuration de base Django
```

---

## 🛠️ Technologies Utilisées

| Couche | Stack |
|---|---|
| **Backend** | Python, Django, Django REST Framework, SimpleJWT |
| **Frontend** | React (Vite), TypeScript, Tailwind CSS, Axios |
| **Architecture** | Clean Architecture — Entities, Use Cases, Repositories, Interfaces |

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

- [Python 3.x](https://www.python.org/downloads/)
- [Node.js et npm](https://nodejs.org/) *(version LTS recommandée)*

---

## ⚙️ Installation et Configuration

Ouvrez un terminal à la **racine principale** du projet (là où se trouve ce `README`), puis suivez les étapes ci-dessous.

---

### 1. Backend — Django

**Étape 1 — Créer et activer l'environnement virtuel**

```bash
# Création (depuis la racine du projet)
python -m venv venv

# Activation sur Windows
venv\Scripts\activate

# Activation sur Mac / Linux
source venv/bin/activate
```

**Étape 2 — Installer les dépendances et configurer la base**

```bash
# Entrer dans le dossier du projet Django
cd hotel_system

# Installer les paquets
pip install -r requirements.txt

# Créer les tables de la base de données
python manage.py makemigrations
python manage.py migrate
```

**Étape 3 — Créer le compte Administrateur (Directeur)**

```bash
python manage.py createsuperuser
# Suivez les instructions pour définir vos identifiants
```

---

### 2. Frontend — React / Vite

Ouvrez un **deuxième terminal**, toujours depuis la racine du projet.

```bash
# Entrer dans le dossier frontend
cd hotel_system/frontend

# Installer les dépendances Node
npm install
```

---

## 🚀 Lancement de l'Application

Les deux serveurs doivent tourner **simultanément** pour que l'application fonctionne.

**Terminal 1 — Serveur Backend**  
*(environnement virtuel activé, depuis `hotel_system/`)*

```bash
python manage.py runserver
```

L'API sera disponible sur : `http://127.0.0.1:8000/`

**Terminal 2 — Serveur Frontend**  
*(depuis `hotel_system/frontend/`)*

```bash
npm run dev
```

Cliquez sur le lien local fourni par Vite (ex : `http://localhost:5173/`).

---

## 🔑 Accès et Rôles

| Rôle | Accès | Création du compte |
|---|---|---|
| **Directeur** *(Admin)* | Yield Management (tarifs & saisons), gestion des chambres, création des comptes personnel | Via `createsuperuser` |
| **Réceptionniste** | Réservations, gestion des clients, check-in / check-out, facturation | Créé par le Directeur depuis l'interface *Personnel* |

---

