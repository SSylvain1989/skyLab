# skyLab

Menu bar app macOS pour suivre tes Pull Requests GitHub et tes builds EAS/Expo en un coup d'oeil.

## Stack

- **Tauri v2** (Rust) - app native, menu bar, tray icon
- **React 19** + **TypeScript**
- **Tailwind CSS v4** - styling utilitaire
- **Vite 7** - bundler

## Fonctionnalites

### Pull Requests

- Review requests en attente et PRs ouvertes, groupees par section
- Badge d'anciennete (fresh / aging / stale)
- Statut CI (passed / failed / running)
- Delta diff (`+135 -250`) par PR
- Lien Notion detecte automatiquement dans les commentaires
- Recherche instantanee (titre, repo, auteur)
- Copie du lien de PR en un clic

### EAS Builds

- Derniers builds groupes par profil (preview, staging, development...)
- Dernier build iOS + Android par profil
- Badge de statut (success, erreur, en cours, en queue, annule)
- QR code pour flasher les builds internal distribution
- Telechargement direct de l'artifact
- Lien vers la page build expo.dev

### General

- Polling configurable (1-60 min)
- Dark mode / Light mode
- Popup au clic sur l'icone tray, se ferme quand elle perd le focus
- Pas dans le Dock (Accessory mode)

## Prerequis

- [Rust](https://rustup.rs/)
- [Node.js](https://nodejs.org/) >= 18
- Xcode Command Line Tools (`xcode-select --install`)

## Installation

```bash
npm install
```

## Developpement

```bash
npm run tauri dev
```

## Build

```bash
npm run tauri build
```

Le `.dmg` / `.app` est genere dans `src-tauri/target/release/bundle/`.

## Configuration

Au premier lancement, l'app demande :

| Champ | Description |
|-------|-------------|
| **GitHub Username** | Ton username GitHub |
| **Personal Access Token** | Token avec scope `repo` ([creer ici](https://github.com/settings/tokens)) |
| **Polling interval** | Frequence de rafraichissement (minutes) |

### EAS Builds (optionnel)

| Champ | Description |
|-------|-------------|
| **Expo Access Token** | Token d'acces Expo ([creer ici](https://expo.dev/accounts/[account]/settings/access-tokens)) |
| **Project slug** | Format `account/project` (ex: `actual/espace-interimaire-actual`) |

Quand les champs Expo sont remplis, un onglet **Builds** apparait dans le header.

## Structure

```
src/
  App.tsx                          # Composant principal, routing tabs
  index.css                        # Theme (dark/light), scrollbar custom
  components/
    Header.tsx                     # Header avec tabs PRs/Builds
    SearchBar.tsx                  # Barre de recherche PRs
    PRCard.tsx                     # Carte PR (avatar, badges, diff, Notion)
    PRSection.tsx                  # Section groupee de PRs
    AgeBadge.tsx                   # Badge anciennete
    CIBadge.tsx                    # Badge statut CI
    BuildCard.tsx                  # Carte build EAS
    BuildProfileSection.tsx        # Section par profil build
    BuildsView.tsx                 # Vue liste builds
    BuildStatusBadge.tsx           # Badge statut build
    QRCodeModal.tsx                # Modal QR code
    SettingsView.tsx               # Ecran parametres
    EmptyState.tsx                 # Etat vide
  hooks/
    useGitHubPRs.ts                # Polling PRs GitHub
    useEASBuilds.ts                # Polling builds EAS
    useSettings.ts                 # Gestion settings persistants
  services/
    github.ts                      # API REST GitHub
    eas.ts                         # API GraphQL EAS/Expo
    storage.ts                     # Persistance via Tauri Store
  types/
    github.ts                      # Types GitHub + Settings
    eas.ts                         # Types EAS
  utils/
    time.ts                        # Utilitaire timeAgo
```
