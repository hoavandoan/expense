import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
// import 'react-native-url-polyfill/dist/polyfill';

const supabaseUrl = 'https://qooftjstyieyemkjqaau.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvb2Z0anN0eWlleWVta2pxYWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MTA0MDEsImV4cCI6MjA4MzI4NjQwMX0.5tJAe35BVmhRXja4M7nDM2eRh9W5qkUBEHALh0a2aGA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
