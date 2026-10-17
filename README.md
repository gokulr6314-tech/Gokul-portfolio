# Gokul Ramesh - Professional Portfolio

A beautiful, high-performance, and responsive personal portfolio website designed for Gokul Ramesh. This site features a sleek, liquid-glass frosted design, high-contrast typography, interactive micro-animations, and a professional presentation.

## 🚀 Key Features

- **Liquid Glass Design**: Elegant neon/glassmorphic aesthetics utilizing smooth backdrops and dynamic ambient gradient shifts.
- **Micro-Animations**: Clean transitions powered by `motion` (`motion/react`) for cards, buttons, nav, and scrolling elements.
- **Responsive Navigation**: Adaptive header toggles gracefully from desktop layouts to high-contrast mobile menus.
- **Grayscale Portrait**: High-fidelity monochrome portrait coupled with contrast-rich display typography.
- **Universal Base Path**: Seamlessly deploys on GitHub Pages, Netlify, Vercel, or custom domains without editing config.
- **GitHub Pages Auto-Deployment**: Fully automated CI/CD pipeline with GitHub Actions.

---

## ⚡ Working with Antigravity / AI Agents

This repository is optimized for **Antigravity** (Google Antigravity / agentic coding environment):

- **Strict Type Safety**: All TypeScript definitions (`@types/react`, `@types/react-dom`, `vite-env.d.ts`) are fully resolved without implicit any or missing module errors.
- **Modular Components**: Each visual block (`Hero`, `About`, `Skills`, `Projects`, `Contact`, `Navbar`, `Footer`, `GlassCard`, `BackgroundEffect`) is decoupled inside `src/components/`.
- **Zero Breakage Guarantees**: Global styling and glass tokens are defined in `src/index.css`. Component modifications in Antigravity preserve existing palettes, typography, and backdrop blurs.
- **Unified Build & Lint**: Run `npm run lint` (`tsc --noEmit`) to verify types at any time.

---

## 💻 Local Development

Follow these steps to run the project locally on your machine:

### Prerequisite
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).

### 1. Clone or Open the Repository
```bash
git clone <your-repository-url>
cd <your-repository-folder>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Development Server
```bash
npm run dev
```
The server will boot up and run on [http://localhost:3000](http://localhost:3000).

### 4. Build for Production
```bash
npm run build
```
Type checks and compiles production assets into `/dist`.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🐙 How to Push the Code & Host on GitHub

If you previously had trouble pushing or hosting on GitHub, follow these exact steps:

### Step 1: Initialize Git & Commit (If Not Already Committed)
```bash
git init
git add .
git commit -m "Initial commit: Minimalist portfolio with liquid glass UI"
git branch -M main
```

### Step 2: Create a New Repository on GitHub
1. Log into your account at [GitHub](https://github.com/).
2. Click **New** repository.
3. Choose a name (e.g. `gokul-portfolio` or `portfolio`).
4. Keep it **Public** (required for free GitHub Pages) and leave "Add a README" **unchecked**.
5. Click **Create repository**.

### Step 3: Link & Push Your Code
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```
*(If you are prompted for credentials, use your GitHub Personal Access Token or SSH key).*

### Step 4: Enable Automatic GitHub Pages Deployment
1. Go to your repository on **GitHub**.
2. Click on **Settings** (top navigation tab).
3. On the left sidebar under the **Code and automation** section, click on **Pages**.
4. Inside **Build and deployment** -> **Source**, select **GitHub Actions** from the dropdown menu (instead of "Deploy from a branch").
5. The included workflow file (`.github/workflows/deploy.yml`) will automatically build and publish the website every time you push changes to `main`!

---

## 🛠️ Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions automated deployment script
├── public/                  # Static assets directory
│   ├── favicon.svg          # Portfolio sparkle favicon
│   ├── robots.txt           # Search crawler directives
│   └── .gitkeep             # Pre-configured directory keeper
├── src/
│   ├── assets/              # Source assets
│   │   └── images/
│   │       └── Gk.blazer.pic.jpeg   # Profile image
│   ├── components/          # Modular React components
│   │   ├── About.tsx        # Bio & key statistics panel
│   │   ├── BackgroundEffect.tsx # Dynamic cursor-reactive ambient glow
│   │   ├── Contact.tsx      # Contact channels & transmission logs
│   │   ├── Footer.tsx       # Humble base credits & return-to-top
│   │   ├── GlassCard.tsx    # Reusable liquid-glass card wrapper
│   │   ├── Hero.tsx         # Welcome hero with interactive lens switcher
│   │   ├── Navbar.tsx       # Sticky floating liquid glass header
│   │   ├── PillButton.tsx   # Reusable pill CTA component
│   │   ├── Projects.tsx     # Filterable creations catalogue
│   │   └── Skills.tsx       # Visual competencies & domain tags
│   ├── App.tsx              # Main layout composer
│   ├── index.css            # Global Tailwind CSS & liquid glass tokens
│   ├── main.tsx             # DOM initialization entry
│   ├── types.ts             # Shared TypeScript models
│   └── vite-env.d.ts        # Vite client declarations & asset types
├── index.html               # HTML5 template with SEO & social cards
├── netlify.toml             # Configuration for Netlify deployments
├── package.json             # Dependencies, metadata, and npm scripts
├── tsconfig.json            # Strict TypeScript configuration
└── vite.config.ts           # Vite bundler, alias, and base path settings
```

---

## 🎨 Customization Guide

- **Profile Photo**: Replace `/src/assets/images/Gk.blazer.pic.jpeg` with another photo keeping the same filename, or update the import path in `src/components/About.tsx`.
- **Bio & Details**: Modify personal background and focus domains directly in `src/components/About.tsx`, `src/components/Hero.tsx`, and `src/components/Contact.tsx`.
- **Projects**: Add, remove, or modify items in the `PROJECTS_DATA` array inside `src/components/Projects.tsx`.
- **Skills**: Adjust skills and proficiency tags inside `SKILL_CATEGORIES` in `src/components/Skills.tsx`.
- **Contact Details**: Update email address and social links in `src/components/Contact.tsx`.
