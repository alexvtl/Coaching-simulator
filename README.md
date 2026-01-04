# 🎤 Coaching Simulator

MVP minimaliste pour tester l'API OpenAI Realtime via WebRTC. Simulez des conversations de coaching vocal avec une IA ultra-réaliste.

## 🚀 Stack Technique

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (`@supabase/ssr`)
- **UI**: Tailwind CSS + Lucide React
- **AI**: OpenAI Realtime API via WebRTC
- **Modèle**: `gpt-4o-mini-realtime-preview`

## 📦 Installation

```bash
# Cloner et installer
cd coaching-simulator
npm install
```

## ⚙️ Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI (Server-side only - IMPORTANT: ne jamais exposer côté client)
OPENAI_API_KEY=sk-your-openai-api-key
```

### 2. Base de données Supabase

Exécutez le script SQL dans votre Supabase SQL Editor :

```bash
# Le fichier est disponible ici :
supabase/schema.sql
```

Ce script crée :
- Table `personas` (personnages IA avec voix et instructions)
- Table `scenarios` (scénarios de coaching)
- Table `sessions` (historique des sessions)
- Données de test (3 personas + 3 scénarios)

## 🏃 Lancement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 🎯 Utilisation

1. **Page d'accueil** : Choisissez un scénario parmi :
   - 😠 Client en Colère
   - 💰 Négociation Salariale
   - 📊 Pitch Investisseur

2. **Page de session** : 
   - Cliquez sur "Démarrer la simulation"
   - Autorisez l'accès au microphone
   - Parlez naturellement avec l'IA
   - Le cercle change de couleur quand l'IA parle
   - Terminez avec le bouton rouge

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   └── realtime-session/    # Route pour clé éphémère OpenAI
│   ├── session/[id]/            # Page de simulation vocale
│   ├── layout.tsx
│   ├── page.tsx                 # Liste des scénarios
│   └── globals.css
├── components/
│   └── VoiceSession.tsx         # Composant WebRTC principal
├── lib/
│   └── supabase/
│       ├── client.ts            # Client navigateur
│       └── server.ts            # Client serveur
└── types/
    └── index.ts                 # Types TypeScript
```

## 🔊 API OpenAI Realtime

Le flux WebRTC fonctionne ainsi :

1. Le frontend demande une clé éphémère via `/api/realtime-session`
2. L'API serveur appelle OpenAI avec `OPENAI_API_KEY` et retourne un `client_secret`
3. Le frontend utilise ce token pour établir une connexion WebRTC directe avec OpenAI
4. L'audio du micro est streamé vers OpenAI, les réponses audio sont jouées en temps réel

## 🎨 Voix Disponibles

- `alloy` - Neutre
- `ash` - Masculine douce
- `ballad` - Mélodique
- `coral` - Féminine chaleureuse
- `echo` - Masculine dynamique
- `sage` - Féminine calme
- `shimmer` - Féminine vive
- `verse` - Narrative

## 🐛 Dépannage

### Erreur "Microphone access denied"
→ Vérifiez les permissions du navigateur pour le microphone

### Erreur "Failed to get session token"
→ Vérifiez que `OPENAI_API_KEY` est définie dans `.env.local`

### Erreur "Persona not found"
→ Exécutez le script SQL pour créer les données de test

## 📄 License

MIT
