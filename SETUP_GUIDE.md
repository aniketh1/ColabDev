# 🚀 Setup Guide for One Editor

## Required API Keys & Services

### 1. **MongoDB Database** (MONGODB_URI)
**What it's for:** Stores user accounts, projects, and files

**How to get it:**
- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Create a free account
- Create a new cluster (free tier available)
- Click "Connect" → "Connect your application"
- Copy the connection string
- Replace `<password>` with your database password
- Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/oneeditor?retryWrites=true&w=majority`

**Add to .env.local:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/oneeditor
```

---

### 2. **NextAuth Secret** (NEXTAUTH_SECRET)
**What it's for:** Secures authentication sessions

**How to generate:**
Run this command in your terminal:
```bash
openssl rand -base64 32
```

Or use online generator: https://generate-secret.vercel.app/32

**Add to .env.local:**
```
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
```

---

### 3. **Resend API Key** (RESEND_API_KEY)
**What it's for:** Sends password reset and verification emails

**How to get it:**
- Go to [Resend](https://resend.com)
- Create a free account (100 emails/day free)
- Go to API Keys section
- Click "Create API Key"
- Copy the API key

**Add to .env.local:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

**Note:** Update the email sender in `src/config/resendemail.ts`:
- Change `from: 'One Editor<noreply@one-editor.amitprajapati.co.in>'`
- To your verified domain or use Resend's test domain

---

### 4. **Forgot Password Secret** (FORGOT_PASSWORD_SECRET_KEY)
**What it's for:** Secures password reset tokens

**How to generate:**
Same as NextAuth Secret - run:
```bash
openssl rand -base64 32
```

**Add to .env.local:**
```
FORGOT_PASSWORD_SECRET_KEY=your_generated_secret_here
```

---

### 5. **Base URL** (NEXT_PUBLIC_BASE_URL)
**What it's for:** Used for API calls and sharing links

**For local development:**
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**For production:** Replace with your deployed URL
```
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## 📦 Installation Steps

1. **Install Dependencies:**
```bash
npm install
```

2. **Create .env.local file** (already created) and fill in the values above

3. **Run Development Server:**
```bash
npm run dev
```

4. **Open Browser:**
Navigate to http://localhost:3000

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas account created and connection string added
- [ ] NEXTAUTH_SECRET generated and added
- [ ] Resend account created and API key added
- [ ] FORGOT_PASSWORD_SECRET_KEY generated and added
- [ ] All dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Can access http://localhost:3000

---

## 🔧 Optional Configurations

### Update Email Sender (Required for Resend to work)
Edit `src/config/resendemail.ts` line 7:
```typescript
from: 'Your App Name <onboarding@resend.dev>', // Use this for testing
```

### Production Deployment
When deploying (Vercel, Netlify, etc.):
1. Add all environment variables to your hosting platform
2. Update `NEXT_PUBLIC_BASE_URL` to your production URL
3. Update `NEXTAUTH_URL` to your production URL

---

## ❓ Troubleshooting

**MongoDB Connection Failed:**
- Check your IP address is whitelisted in MongoDB Atlas (Network Access)
- Verify username/password are correct
- Ensure connection string format is correct

**Email Not Sending:**
- Verify Resend API key is correct
- Check you haven't exceeded free tier limit (100/day)
- Update the `from` email address in resendemail.ts

**Authentication Not Working:**
- Ensure NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your current URL
- Clear browser cookies and try again

---

## 📚 Technologies Used
- **Next.js 15** - React framework
- **MongoDB** - Database
- **NextAuth** - Authentication
- **Resend** - Email service
- **CodeMirror** - Code editor
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI components
