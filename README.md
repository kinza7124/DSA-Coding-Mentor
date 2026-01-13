
# 🚀 DSA Mentor Pro - AI Masterclass

This is a premium AI-powered tutor for Data Structures and Algorithms, built with React, Vite, and Google Gemini API.

## 🛠️ Deployment Instructions

### 1. Local Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 2. Deploy to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Initialize and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: DSA Mentor Pro Ready"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

### 3. Deploy to Vercel/Netlify
1. Connect your GitHub repository to Vercel or Netlify.
2. In the **Environment Variables** settings:
   - Add a variable named `API_KEY`.
   - Set the value to your Google Gemini API Key.
3. Use the following build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

## 🧠 Tech Stack
- **Frontend:** React 19 + Tailwind CSS
- **Intelligence:** Google Gemini 3 (Pro for Reasoning, Flash for Tools)
- **Bundler:** Vite
- **Icons:** FontAwesome
