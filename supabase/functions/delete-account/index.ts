import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's auth to verify identity
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      console.error('Failed to get user:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Deleting account for user: ${user.id}`);

    // Create admin client to delete the auth user
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Delete user data from all tables (cascading would be better, but doing manually for safety)
    const tables = ['tasks', 'class_schedules', 'chat_messages', 'discussions', 'user_preferences', 'profiles'];
    
    for (const table of tables) {
      const { error: deleteError } = await adminClient
        .from(table)
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error(`Error deleting from ${table}:`, deleteError);
        // Continue with other tables even if one fails
      } else {
        console.log(`Deleted user data from ${table}`);
      }
    }

    // Delete avatar from storage
    const { error: storageError } = await adminClient.storage
      .from('avatars')
      .remove([`${user.id}/avatar.jpg`, `${user.id}/avatar.png`, `${user.id}/avatar.webp`, `${user.id}/avatar.gif`]);
    
    if (storageError) {
      console.error('Error deleting avatar:', storageError);
    }

    // Delete the auth user using admin API
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(user.id);
    
    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully deleted account for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});