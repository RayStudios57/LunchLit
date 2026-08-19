import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify caller is authenticated
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminUserId = claimsData.claims.sub as string;

    // Verify caller is admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: adminRole } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', adminUserId)
      .eq('role', 'admin')
      .single();

    if (!adminRole) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin only' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'targetUserId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent self-deletion
    if (targetUserId === adminUserId) {
      return new Response(
        JSON.stringify({ error: 'Cannot delete your own account from admin panel' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin ${adminUserId} deleting account: ${targetUserId}`);

    // Delete user data from all tables
    const tables = [
      'notification_preferences', 'notifications', 'brag_sheet_insights',
      'brag_sheet_academics', 'brag_sheet_entries', 'student_goals',
      'target_schools', 'tasks', 'class_schedules', 'chat_messages',
      'discussions', 'user_roles', 'role_upgrade_requests',
      'user_preferences', 'user_suggestions', 'profiles'
    ];

    for (const table of tables) {
      const { error: deleteError } = await adminClient
        .from(table)
        .delete()
        .eq('user_id', targetUserId);

      if (deleteError) {
        console.error(`Error deleting from ${table}:`, deleteError);
      } else {
        console.log(`Deleted user data from ${table}`);
      }
    }

    // Delete avatar from storage
    await adminClient.storage
      .from('avatars')
      .remove([`${targetUserId}/avatar.jpg`, `${targetUserId}/avatar.png`, `${targetUserId}/avatar.webp`]);

    // Delete the auth user
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(targetUserId);

    if (authDeleteError) {
      console.error('Error deleting auth user:', authDeleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to delete account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully deleted account: ${targetUserId}`);

    return new Response(
      JSON.stringify({ success: true }),
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
