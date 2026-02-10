# Deployment Guide - Sportsbook Academy Integration

## Option 1: Deploy to Render (Recommended - Free & Permanent)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up for free (use GitHub, GitLab, or email)

### Step 2: Create New Web Service
1. Click "New +" button → "Web Service"
2. Choose "Public Git repository" or "Deploy from GitHub"

### Step 3: Configure the Service
**If using direct file upload:**
1. Click "Create Web Service"
2. Fill in:
   - Name: `sportsbook-academy`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

**Environment Variables:**
Add these in the "Environment" section:
```
WALLET_API_URL=https://wallet.442hattrick.com
AGENT_USERNAME=SportsbookAcademy
AGENT_PASSWORD=DbtbcCBaKx
AGENT_ID=187884602
SITE_ID=20501
SPORTSBOOK_URL=https://sports.sportsbook.ac
JWT_SECRET=sportsbook_academy_secret_key_2026
CURRENCY_CODE=USD
INITIAL_BALANCE=100.00
PORT=3000
NODE_ENV=production
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://sportsbook-academy.onrender.com`

---

## Option 2: Deploy to Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up for free

### Step 2: Deploy
1. Click "New Project"
2. Choose "Deploy from GitHub" or "Empty Project"
3. If empty project:
   - Click "Add a Service" → "GitHub Repo"
   - Or upload files directly

### Step 3: Configure
Add environment variables (same as Render above)

### Step 4: Access
You'll get a URL like: `https://sportsbook-academy-production.up.railway.app`

---

## Option 3: Deploy to Fly.io

### Step 1: Install Flyctl (CLI)
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login
```bash
fly auth signup  # or fly auth login
```

### Step 3: Launch App
```bash
cd sportsbook-academy
fly launch
```

Follow the prompts:
- App name: `sportsbook-academy`
- Region: Choose closest to you
- Database: No
- Deploy now: Yes

### Step 4: Set Environment Variables
```bash
fly secrets set WALLET_API_URL=https://wallet.442hattrick.com
fly secrets set AGENT_USERNAME=SportsbookAcademy
fly secrets set AGENT_PASSWORD=DbtbcCBaKx
fly secrets set SPORTSBOOK_URL=https://sports.sportsbook.ac
# ... (set all other variables)
```

---

## After Deployment

### Test the Interface
1. Open your deployed URL in a browser
2. You should see the Sportsbook Academy interface
3. Try the "Complete Login Flow" with a test username

### Whitelist the Server IP
1. Find your deployed app's IP address
2. Contact FIRST team to whitelist it
3. Once whitelisted, all API calls will work!

### Troubleshooting

**If you get 403 errors:**
- Your server IP isn't whitelisted yet
- Contact FIRST IM team: coretechiM@btigroup.io

**If the app crashes:**
- Check environment variables are set correctly
- View logs in your hosting dashboard

**If API calls fail:**
- Verify WALLET_API_URL is correct
- Check credentials are accurate

---

## Free Tier Limits

**Render:**
- 750 hours/month free
- Sleeps after 15 min of inactivity
- Wakes up automatically on request

**Railway:**
- $5 credit/month free
- No sleep
- Better for development

**Fly.io:**
- 3 shared-cpu VMs free
- 160GB bandwidth/month
- Good global performance

---

## Need Help?

Contact Greg in Teams for assistance with deployment!
