# Gokul Ramesh - Professional Portfolio

A beautiful, high-performance, and responsive personal portfolio website designed for Gokul Ramesh. This site features a sleek, liquid-glass frosted design, high-contrast typography, interactive micro-animations, and a professional monochrome presentation.

## 🚀 Key Features

- **Liquid Glass Design**: Elegant neon/glassmorphic aesthetics utilizing smooth backdrops and dynamic ambient gradient shifts.
- **Micro-Animations**: Clean transitions powered by `motion` (`motion/react`) for cards, buttons, nav, and scrolling elements.
- **Responsive Navigation**: Adaptive header toggles gracefully from desktop layouts to high-contrast mobile menus.
- **Black and White Aesthetics**: Beautiful grayscale monochrome portrait coupled with a contrast-rich display typography.
- **GitHub Pages Auto-Deployment**: Fully automated CI/CD pipeline with GitHub Actions.

---

## 💻 Local Development

Follow these steps to run the project locally on your machine:

### Prerequisite
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd <your-repository-folder>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local development server
```bash
npm run dev
```
The server will boot up and run on [http://localhost:3000](http://localhost:3000).

### 4. Build for production (locally)
```bash
npm run build
```
The compiled output will be generated inside the `/dist` directory.

---

## 🐙 Deploying to GitHub Pages

This project is fully automated to build and deploy to **GitHub Pages** using GitHub Actions once pushed to your repository.

### Step 1: Configure your Repository Name in the Code
Open `vite.config.ts` and replace the placeholder `<repo-name>` with your actual GitHub repository name:

```typescript
// Replace '<repo-name>' with your repository name.
// For example, if your repository is 'gokul-portfolio', set 'base' to:
base: process.env.NODE_ENV === 'production' ? '/gokul-portfolio/' : '/',
```
*Note: If you are using a custom domain (e.g., `gokulramesh.com`), change this to `'/'` instead.*

### Step 2: Push Your Code to GitHub
Initialize your git repository (if not already done), add your GitHub remote, and push to the `main` or `master` branch:

```bash
git init
git add .
git commit -m "Initial portfolio setup with GitHub Actions"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 3: Enable Pages in GitHub Settings
1. Go to your repository on **GitHub**.
2. Click on **Settings** (the gear cog icon at the top menu).
3. On the left sidebar under the **Code and automation** section, click on **Pages**.
4. Inside **Build and deployment** -> **Source**, select **GitHub Actions** from the dropdown menu (instead of "Deploy from a branch").
5. Push to your `main` branch to trigger the action!

*(The setup in `.github/workflows/deploy.yml` takes care of installing dependencies, compiling your code via Vite, and automatically hosting the output!)*

---

## 🛠️ Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions automated deployment script
├── public/                 # Static assets directory (e.g., robots.txt, icons)
│   └── .gitkeep            # Pre-configured directory keeper
├── src/
│   ├── assets/             # Source assets (styles, logo, portraits)
│   │   └── images/
│   │       └── Gk.blazer.pic.jpeg   # Profile image
│   ├── components/         # Modular React views & components
│   │   ├── About.tsx       # Bio & key statistics panel
│   │   ├── Contact.tsx     # Message & channels conjoin
│   │   ├── Footer.tsx      # Simple humble base credits
│   │   ├── Hero.tsx        # Immersive display welcome screen
│   │   ├── Navbar.tsx      # Sticky floating liquid glass header bar
│   │   ├── Projects.tsx    # Scrollable creations catalogue
│   │   └── Skills.tsx      # Alchemy visual capabilities badges
│   ├── App.tsx             # Core parent layout conjoiner
│   ├── index.css           # Global Tailwind CSS definitions & custom glass rules
│   ├── main.tsx            # DOM initialization entry
│   └── types.ts            # Common shared models and schemas
├── index.html              # Core single-page template container
├── package.json            # Dependencies and terminal runscripts
├── tsconfig.json           # Typechecked strictness configuration
└── vite.config.ts          # Vite bundler, plugin, and path options
```

---

## 🔗 Customization
- **Profile Photo**: To update your photo, replace the file at `/src/assets/images/Gk.blazer.pic.jpeg` with another photo of yours keeping the exact same filename, or change the `avatarImg` declaration path inside `src/components/About.tsx`.
- **Bio & Stats**: Tailor the content directly in `src/components/About.tsx`, `src/components/Hero.tsx`, and `src/components/Contact.tsx`.
