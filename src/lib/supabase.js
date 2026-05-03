import { createClient } from '@supabase/supabase-js';

let _client = null;

function getSupabase() {
  if (_client) return _client;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase public env vars are not configured');
  }
  _client = createClient(supabaseUrl, supabasePublishableKey);
  return _client;
}

// Proxy so existing supabase.from(...) call-sites work unchanged
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      return getSupabase()[prop];
    },
  }
);