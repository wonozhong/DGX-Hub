import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://api.dragonixinteractive.com';
const supabaseAnonKey = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3Mjg5MzYyMCwiZXhwIjo0OTI4NTY3MjIwLCJyb2xlIjoiYW5vbiJ9.3qPt7Rx9Lfv7rrL8T5Pl6jqcSO9uLbK0o5sqb7_p2L4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
