# Deploy to GitHub and Vercel

## 1) Local test
```bash
npm install
npm run lint
npm run build
```

## 2) Push to GitHub
```bash
git init
git add .
git commit -m "Fix Next.js deploy issues"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 3) Import to Vercel
- Sign in to Vercel
- Click **Add New → Project**
- Import the GitHub repo
- Framework preset should auto-detect as **Next.js**
- Build command: `next build`
- Output setting: leave default for Next.js
- Deploy

## Notes
- Do not upload `node_modules` or `.next`
- If you use env vars later, add them in Vercel Project Settings → Environment Variables
