# Deployment Guide

## Vercel Deployment

### Step 1: Prepare Your Repository

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: RealPaper Trading Simulator"
```

2. Create a GitHub repository and push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/realpaper-trading.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/) and sign in

2. Click "New Project"

3. Import your GitHub repository

4. Configure your project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build` or `yarn build`
   - **Output Directory**: `.next`

5. Add Environment Variables:

Click "Environment Variables" and add the following:

```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secret-key-generate-new-one
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_INSTANTDB_APP_ID=your-instantdb-app-id
TWELVE_DATA_API_KEY=your-twelve-data-api-key
OPENAI_API_KEY=your-openai-api-key
```

**Important**: 
- Generate a new `NEXTAUTH_SECRET` using:
  ```bash
  openssl rand -base64 32
  ```
- Update `NEXTAUTH_URL` to match your Vercel deployment URL

6. Click "Deploy"

### Step 3: Update Google OAuth Settings

After deployment, update your Google OAuth authorized redirect URIs:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Edit your OAuth 2.0 Client ID
5. Add to "Authorized redirect URIs":
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
6. Save

### Step 4: Test Your Deployment

1. Visit your Vercel URL: `https://your-app-name.vercel.app`
2. Test Google sign-in
3. Test trading functionality
4. Test all features

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Check your environment variables are correctly set
2. Ensure all dependencies are in `package.json`
3. Check the Vercel build logs for specific errors

### Authentication Issues

If Google auth doesn't work:

1. Verify `NEXTAUTH_URL` matches your deployment URL
2. Check Google OAuth redirect URIs
3. Ensure `NEXTAUTH_SECRET` is set

### API Errors

If API calls fail:

1. Verify all API keys are correctly set in Vercel
2. Check API rate limits (Twelve Data, OpenAI)
3. Review Vercel function logs

### InstantDB Connection

If InstantDB doesn't connect:

1. Verify `NEXT_PUBLIC_INSTANTDB_APP_ID` is correct
2. Ensure the variable name starts with `NEXT_PUBLIC_`
3. Check InstantDB dashboard for connection status

## Custom Domain (Optional)

To add a custom domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and Google OAuth redirect URIs

## Monitoring

- **Analytics**: Enable Vercel Analytics in Project Settings
- **Logs**: View function logs in the Vercel dashboard
- **Performance**: Check Core Web Vitals

## Updates

To update your deployment:

```bash
git add .
git commit -m "Update description"
git push origin main
```

Vercel will automatically redeploy.

## Security Checklist

- ✅ All API keys are in environment variables (not in code)
- ✅ `NEXTAUTH_SECRET` is strong and unique
- ✅ Google OAuth redirect URIs are correctly configured
- ✅ `.env.local` is in `.gitignore`
- ✅ API rate limits are monitored

## Support

For issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Contact instructor if assignment-specific issues arise

