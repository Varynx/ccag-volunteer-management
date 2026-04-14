import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'url copy, you can copy fron supabase(first thing you see)';
const supabaseKey = 'go to project settings, and copy the api public key(anon public), maybe the other one works,will look into it';

export const supabase = createClient(supabaseUrl, supabaseKey);