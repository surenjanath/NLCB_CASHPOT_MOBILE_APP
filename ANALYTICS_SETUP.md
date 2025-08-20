# 📊 Analytics Setup Guide - T&T Cashpot Data App

## 🎯 **What We've Built**

A complete **user analytics tracking system** that tracks:
- **App opens** - Every time someone opens your app
- **Unique users** - How many different people use your app
- **Platform usage** - iOS vs Android vs Web breakdown
- **Lottery actions** - What users do in your app
- **Usage patterns** - When and how often people use it

## 🚀 **Step-by-Step Setup**

### **Step 1: Set Up Supabase Tables**

1. **Go to your Supabase project dashboard**
2. **Open the SQL Editor**
3. **Copy and paste this SQL script:**

```sql
-- 🎯 T&T Cashpot App Analytics Setup
-- Run this in your Supabase SQL Editor

-- Create analytics table
CREATE TABLE IF NOT EXISTS app_analytics (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  app_version TEXT NOT NULL,
  platform TEXT NOT NULL,
  first_open TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_open TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  open_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on device_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_analytics_device_id ON app_analytics(device_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_app_analytics_updated_at ON app_analytics;
CREATE TRIGGER update_app_analytics_updated_at 
    BEFORE UPDATE ON app_analytics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create lottery actions tracking table
CREATE TABLE IF NOT EXISTS lottery_actions (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'check_result', 'search', 'view_history', 'sync_data', 'view_detail'
  action_data JSONB, -- Store additional data like draw numbers, search queries
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for lottery actions
CREATE INDEX IF NOT EXISTS idx_lottery_actions_device_id ON lottery_actions(device_id);
CREATE INDEX IF NOT EXISTS idx_lottery_actions_timestamp ON lottery_actions(timestamp);
```

4. **Click "Run" to execute the script**
5. **Verify tables are created** in the Table Editor

### **Step 2: Install Required Dependencies**

Your app already has these, but verify:
```bash
npm install @react-native-async-storage/async-storage expo-device
```

### **Step 3: Files Created**

✅ **`services/analyticsService.ts`** - Core analytics service
✅ **`components/AnalyticsDashboard.tsx`** - Beautiful analytics dashboard
✅ **`sql_analytics_setup.sql`** - Database setup script
✅ **Updated `app/_layout.tsx`** - Auto-tracks app opens
✅ **Updated `app/(tabs)/settings.tsx`** - Analytics dashboard access

## 🔧 **How It Works**

### **Automatic Tracking**
- **App opens** are tracked automatically when the app launches
- **Device IDs** are generated uniquely for each device
- **Platform detection** works for iOS, Android, and Web
- **Version tracking** shows which app version users have

### **Manual Tracking**
You can track specific actions in your code:

```typescript
import { analyticsService } from '@/services/analyticsService';

// Track when someone checks lottery results
await analyticsService.trackResultCheck('12345', '2024-01-15');

// Track search actions
await analyticsService.trackSearch('lucky numbers', 25);

// Track history views
await analyticsService.trackHistoryView(1, 100);

// Track data syncs
await analyticsService.trackDataSync('manual', 1500);
```

## 📱 **Accessing Analytics**

### **In Your App**
1. **Open the app**
2. **Go to Settings tab**
3. **Tap "App Analytics" section**
4. **Tap "View Analytics Dashboard"**
5. **See real-time usage statistics!**

### **In Supabase Dashboard**
1. **Go to your Supabase project**
2. **Click "Table Editor"**
3. **View `app_analytics` table** for user data
4. **View `lottery_actions` table** for user actions

## 📊 **What You'll See**

### **Main Stats**
- **Total App Opens** - How many times your app was launched
- **Unique Users** - How many different people use your app
- **Platform Breakdown** - iOS vs Android vs Web usage
- **Recent Activity** - Latest user actions

### **Insights**
- **Average opens per user** - Engagement level
- **Most active times** - When people use your app
- **Feature usage** - Which parts are most popular
- **Growth trends** - User base expansion

## 🎯 **Customization Options**

### **Track More Actions**
Add to your existing code:

```typescript
// In your lottery result components
await analyticsService.trackResultCheck(result.draw_num, result.date);

// In your search components
await analyticsService.trackSearch(searchQuery, results.length);

// In your history components
await analyticsService.trackHistoryView(currentPage, itemsPerPage);
```

### **Add Custom Metrics**
Extend the analytics service:

```typescript
// Add to analyticsService.ts
async trackCustomEvent(eventName: string, data: any) {
  await this.trackLotteryAction('custom_event', {
    event_name: eventName,
    ...data
  });
}
```

## 🚀 **Testing Your Analytics**

### **1. Launch the App**
- Open your app
- Check console for "✅ App open tracked successfully"

### **2. Check Supabase**
- Go to Table Editor
- Look at `app_analytics` table
- You should see your device entry

### **3. View Dashboard**
- Go to Settings → App Analytics
- Tap "View Analytics Dashboard"
- See your usage data!

## 🔍 **Troubleshooting**

### **Common Issues**

#### **"Failed to track app open"**
- Check Supabase connection
- Verify tables exist
- Check internet connection

#### **Dashboard shows "No data available"**
- Wait a few minutes for data to sync
- Check if analytics service is working
- Verify database permissions

#### **Tables not created**
- Run the SQL script again
- Check for syntax errors
- Verify you're in the right project

## 📈 **Next Steps**

### **Immediate (Today)**
1. ✅ Set up Supabase tables
2. ✅ Test app open tracking
3. ✅ View analytics dashboard

### **This Week**
1. 🔄 Add action tracking to key features
2. 🔄 Test on different devices
3. 🔄 Monitor data collection

### **Next Month**
1. 📊 Analyze usage patterns
2. 📊 Identify popular features
3. 📊 Plan feature improvements

## 🎉 **Benefits You'll Get**

### **Real Insights**
- **Know your real user base** - Not just downloads
- **Track engagement** - How often people use your app
- **Identify peak times** - When to push notifications
- **Platform insights** - Which devices people prefer

### **Business Value**
- **User retention** - See who keeps coming back
- **Feature popularity** - Know what users love
- **Growth tracking** - Watch your user base grow
- **Data-driven decisions** - Make informed improvements

---

**🎯 Your T&T Cashpot app now has professional-grade analytics that will give you real insights into user behavior! 📊✨**

**Start tracking today and watch your understanding of user engagement grow! 🚀**
