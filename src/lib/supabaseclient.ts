import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oepcghxcurclerakdorz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcGNnaHhjdXJjbGVyYWtkb3J6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NTk0ODcsImV4cCI6MjA1OTMzNTQ4N30.BNzOBDWiMzvxG9X9-yw6xNPDTEkqaDrLJxQeo-t2i30';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
