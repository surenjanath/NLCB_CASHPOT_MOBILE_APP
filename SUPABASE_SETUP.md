# 🚀 Supabase Setup Guide

## 📋 **Step 1: Get Your Supabase Credentials**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 📝 **Step 2: Create Environment File**

1. In your project root, create a file called `.env`
2. Add your credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 🗄️ **Step 3: Run the SQL**

1. Go to your Supabase dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `sql_in_supabase.sql`
4. Click **Run**

## ✅ **Step 4: Test Your App**

1. Restart your development server:
   ```bash
   npx expo start
   ```

2. Your app should now:
   - ✅ Connect to Supabase
   - ✅ Load sample lottery data
   - ✅ Show all enhanced features

## 🔧 **Troubleshooting**

### **"Missing Supabase environment variables"**
- Check that your `.env` file exists in the project root
- Verify the variable names start with `EXPO_PUBLIC_`
- Restart your development server after creating `.env`

### **"Network request failed"**
- Check your Supabase URL is correct
- Verify your anon key is valid
- Ensure your database table exists

### **"Table doesn't exist"**
- Run the SQL from `sql_in_supabase.sql` in Supabase

## 📱 **Your Enhanced App Features**

Once configured, you'll have:
- 🎰 Real lottery data from Supabase
- 🔄 Automatic syncing
- 📱 Offline support with caching
- 🎨 Beautiful UI with error handling
- ⚡ Fast performance with proper indexing

---

**Need help?** Check the console logs for detailed error messages! 🐛
