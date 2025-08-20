import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase configuration
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.error('');
  console.error('📝 Please create a .env file in your project root with:');
  console.error('   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('');
  console.error('🔗 Get these from: https://supabase.com/dashboard/project/[YOUR_PROJECT]/settings/api');
}

// Create Supabase client with error handling
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder_key'
);

// Table name constant
export const LOTTO_TABLE = 'lotto_results';

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
};

// Helper function to test Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!isSupabaseConfigured()) {
      console.error('❌ Supabase not configured');
      return false;
    }

    const { data, error } = await supabase
      .from(LOTTO_TABLE)
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
    return false;
  }
};