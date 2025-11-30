# 🔐 Admin Authentication Setup

## Current Password

**Local Development:**
- Password: `swivo2025admin`
- Set in: `.env.local`

**Production (Vercel):**
- You need to add this environment variable in Vercel dashboard

---

## 🚀 Setting Up Production Password

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/lenards-projects-bd33782d/swivomagic-advertorials
2. Click "Settings" tab
3. Click "Environment Variables"

### Step 2: Add Password Variable
1. Click "Add New"
2. **Key:** `ADMIN_PASSWORD`
3. **Value:** Choose a strong password (e.g., `YourSecurePassword123!`)
4. **Environments:** Check all (Production, Preview, Development)
5. Click "Save"

### Step 3: Redeploy
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"

---

## 🔑 How to Login

### Local:
1. Visit: http://localhost:3000/admin
2. You'll be redirected to login page
3. Enter password: `swivo2025admin`
4. Click "Login"

### Production:
1. Visit: https://your-site.vercel.app/admin
2. Enter the password you set in Vercel
3. Click "Login"

---

## 🛡️ Security Features

✅ **Session-based authentication** - Stays logged in for 7 days
✅ **HTTP-only cookies** - Protected from XSS attacks
✅ **Auto-redirect** - Unauthenticated users sent to login
✅ **Logout button** - Clear session anytime
✅ **Middleware protection** - All admin routes secured

---

## 🔄 Changing the Password

### Local Development:
Edit `.env.local`:
```bash
ADMIN_PASSWORD=your_new_password
```
Then restart the dev server.

### Production:
1. Go to Vercel → Settings → Environment Variables
2. Find `ADMIN_PASSWORD`
3. Click "Edit"
4. Enter new password
5. Save and redeploy

---

## 🚨 Important Notes

⚠️ **Never commit `.env.local` to Git** - It's already in `.gitignore`
⚠️ **Use a strong password in production** - Not the default one!
⚠️ **Share password securely** - Use a password manager
⚠️ **Change password regularly** - Every 3-6 months

---

## 🎯 Protected Routes

These pages now require authentication:
- `/admin` - Dashboard
- `/admin/new` - Create article
- `/admin/edit/[slug]` - Edit article

Public pages (no login needed):
- `/` - Homepage
- `/article/[slug]` - Article pages
- All other public pages

---

## 🔧 Troubleshooting

**Can't login?**
- Check password is correct
- Clear browser cookies
- Check environment variable is set
- Restart dev server (local)
- Redeploy (production)

**Logged out unexpectedly?**
- Session expired (7 days)
- Cookies were cleared
- Just login again

**Forgot password?**
- Check `.env.local` (local)
- Check Vercel environment variables (production)
- You have full access to change it

---

## 🚀 Next Steps (Optional Upgrades)

Want more advanced auth later?
1. **Multiple users** - Add user accounts with NextAuth.js
2. **Google OAuth** - "Sign in with Google"
3. **Role-based access** - Admin vs Editor permissions
4. **Activity logs** - Track who edited what

Let me know if you want to implement any of these!
