import { createClient } from '@supabase/supabase-js';

let _client = null;

function getSupabaseAdmin() {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required on the server'
    );
  }

  _client = createClient(supabaseUrl, supabaseServiceKey);
  return _client;
}

// Proxy so existing `supabaseAdmin.from(...)` call-sites work unchanged
export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      return getSupabaseAdmin()[prop];
    },
  }
);
