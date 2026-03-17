# 🔍 Debugging Guide for Vercel Internal Server Error

## What I Just Added

I've added **extensive logging** to the login route. Every step now logs to the console.

## How to See the Real Error

### Step 1: Deploy with Logging
```bash
git add .
git commit -m "Add detailed logging for debugging"
git push
```

### Step 2: Access Vercel Logs

#### Option A: Vercel Dashboard (Easiest)
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Click on the latest deployment
4. Click on **"Functions"** tab
5. Click on **"Logs"** or **"Real-time"**
6. Try to login on your site
7. Watch the logs appear in real-time

#### Option B: Vercel CLI
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# View logs in real-time
vercel logs --follow
```

Then try to login and watch the logs.

## What to Look For

The logs will show EXACTLY where it fails:

### Example 1: Environment Variable Missing
```
=== LOGIN REQUEST STARTED ===
Environment check: { hasDbUrl: false, hasJwtSecret: true, nodeEnv: 'production' }
```
**Solution:** DATABASE_URL is not set in Vercel

### Example 2: Database Connection Error
```
=== LOGIN REQUEST STARTED ===
Environment check: { hasDbUrl: true, hasJwtSecret: true, nodeEnv: 'production' }
Request body parsed successfully
Email received: present
Password received: present
Trimmed email: admin@example.com
Starting database lookup...
DATABASE ERROR: {
  message: "Can't reach database server...",
  ...
}
```
**Solution:** Database connection issue (check connection string)

### Example 3: Prisma Client Not Generated
```
=== UNEXPECTED ERROR ===
Error details: {
  message: "@prisma/client did not initialize yet...",
  ...
}
```
**Solution:** Prisma client not generated during build

### Example 4: Bcrypt Error
```
Starting password verification...
BCRYPT ERROR: {
  message: "...",
  ...
}
```
**Solution:** Bcrypt compatibility issue

## Common Issues & Solutions

### Issue 1: Environment Variables Not Set
**Symptom:** `hasDbUrl: false` or `hasJwtSecret: false`

**Solution:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add `DATABASE_URL` and `NEXTAUTH_SECRET`
3. Redeploy

### Issue 2: Wrong DATABASE_URL Format
**Symptom:** `DATABASE ERROR` with connection refused or SSL error

**Solution:**
Make sure DATABASE_URL is:
```
postgresql://neondb_owner:npg_JU79DjcCbpSW@ep-lucky-boat-ahvybth7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```
**NO** `channel_binding=require`

### Issue 3: Prisma Client Not Found
**Symptom:** Error about `@prisma/client` not found

**Solution:**
Check `package.json` build script:
```json
"build": "prisma generate && next build --webpack"
```

### Issue 4: Database Not Accessible
**Symptom:** Connection timeout or refused

**Solution:**
- Check if database accepts external connections
- Verify database is running
- Check if Neon database is active (not paused)

### Issue 5: Wrong Prisma Schema Path
**Symptom:** Can't find schema.prisma

**Solution:**
Make sure `prisma/schema.prisma` exists and has correct generator path:
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../app/generated/prisma"
}
```

## Next Steps

1. **Deploy the code with logging**
2. **Check Vercel logs** (Dashboard or CLI)
3. **Try to login** on your Vercel site
4. **Share the logs with me** - Copy/paste what you see in the logs

The logs will tell us EXACTLY what's failing!

## Quick Test

You can also test the API directly:

```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  -v
```

This will show you:
- HTTP status code
- Response body
- Headers

Then check Vercel logs to see the detailed error.

---

**Once you see the logs, we'll know exactly what's wrong!** 🔍
