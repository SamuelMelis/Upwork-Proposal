import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ffbwvpwjuexelrgqsevw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmYnd2cHdqdWV4ZWxyZ3FzZXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODQ1MzQsImV4cCI6MjA3OTM2MDUzNH0.bJLfjD0yJSNwX93Qvs6IqZYVA4blKw56Dm34M0KucY0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
