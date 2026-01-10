import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gmhzojyxtkxaewkhtlmj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtaHpvanl4dGt4YWV3a2h0bG1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwNDI4MTQsImV4cCI6MjA4MzYxODgxNH0.IDbElt7OQ3dGGbsth12IpVvJEHVSgw4s6lXRyO3U6Zs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
