// ═══════════════════════════════════════════════════════════════
// Ya Qalbi — Supabase Edge Function: verify-auth
// Verifies login answers server-side against plain text stored
// in the partner_auth table. Answers are never exposed to client.
//
// Deploy: supabase functions deploy verify-auth
// ═══════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { step, answer } = await req.json();

    if (!step || !answer) {
      return Response.json(
        { valid: false, error: 'Missing step or answer' },
        { headers: corsHeaders, status: 400 }
      );
    }

    // Normalise: trim whitespace and lowercase
    const normalised = answer.trim().toLowerCase();

    // Use service role key (Supabase secret — never exposed to client)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if any row matches this step + normalised answer
    const { data, error } = await supabase
      .from('partner_auth')
      .select('id')
      .eq('step', step)
      .eq('answer', normalised)
      .maybeSingle();

    if (error) {
      return Response.json({ valid: false }, { headers: corsHeaders });
    }

    return Response.json(
      { valid: data !== null },
      { headers: corsHeaders }
    );

  } catch (e) {
    return Response.json(
      { valid: false, error: 'Server error' },
      { headers: corsHeaders, status: 500 }
    );
  }
});
