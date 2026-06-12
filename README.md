# Content Matrix

Brain dump your expertise, get back custom content pillars mapped to a sales funnel (TOFU / MOFU / BOFU), and generate a full 4-week content calendar with AI-written post ideas in your voice.

---

## How to deploy this on Vercel (step by step)

### 1. Create a GitHub repo
- Go to [github.com](https://github.com) and click **New repository**
- Name it something like `content-matrix`
- Leave it empty (no README, no .gitignore — this project already has those)
- Click **Create repository**

### 2. Upload these files
- On the new repo page, click **uploading an existing file**
- Drag the entire contents of this folder (not the folder itself — the files and subfolders inside it) into the upload area
- Make sure the folder structure stays intact: `api/`, `src/`, `index.html`, `package.json`, etc.
- Commit the files

### 3. Get an Anthropic API key
- Go to [console.anthropic.com](https://console.anthropic.com)
- Sign up or log in
- Go to **API Keys** and create a new key
- Copy it somewhere safe — you'll need it in step 5

### 4. Import the project into Vercel
- Go to [vercel.com](https://vercel.com) and sign in (you can use your GitHub account)
- Click **Add New → Project**
- Select the `content-matrix` repo you just created
- Vercel will auto-detect it as a Vite project — leave the defaults as-is
- Don't click Deploy yet — go to step 5 first

### 5. Add your API key
- Still on the import screen (or in **Project Settings → Environment Variables** after deploying)
- Add a new environment variable:
  - **Name:** `ANTHROPIC_API_KEY`
  - **Value:** the key you copied from the Anthropic console
- Save

### 6. Deploy
- Click **Deploy**
- Vercel will build the project and give you a live URL like `content-matrix-yourname.vercel.app`
- That's your shareable link — anyone can open it and use the tool

---

## Notes

- Every time someone uses the AI features (pillar generation, post ideas), it makes a call to the Anthropic API using your key — this has a small per-use cost on your Anthropic account. Check [console.anthropic.com](https://console.anthropic.com) for usage and billing.
- If you want a custom domain (like `tools.infulldetail.com`), go to **Project Settings → Domains** in Vercel and follow the prompts to connect it.
- To make changes later: edit the files in this project, push the changes to GitHub, and Vercel will automatically redeploy.

---

## Local development (optional)

If you want to test changes on your computer before deploying:

```bash
npm install
npm run dev
```

You'll also need a `.env.local` file with:
```
ANTHROPIC_API_KEY=your_key_here
```
