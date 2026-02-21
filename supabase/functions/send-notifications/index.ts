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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role client for data operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, data } = await req.json();
    console.log(`Processing notification type: ${type}`, data);

    let notifications: { user_id: string; title: string; message: string; type: string; data: any }[] = [];

    if (type === 'new_menu_items') {
      // Get all users with a profile (interested in meal updates)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, school_id');

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }

      // Filter users from the same school if school_id is provided
      const relevantProfiles = data.school_id
        ? profiles?.filter(p => p.school_id === data.school_id || !p.school_id)
        : profiles;

      notifications = (relevantProfiles || []).map(profile => ({
        user_id: profile.user_id,
        title: '🍽️ New Menu Available!',
        message: data.message || 'New lunch menu items have been added for this week.',
        type: 'menu_update',
        data: { school_id: data.school_id, date: data.date },
      }));
    } else if (type === 'study_hall_open') {
      // Get all users with a profile
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, school_id');

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
        throw profileError;
      }

      const relevantProfiles = data.school_id
        ? profiles?.filter(p => p.school_id === data.school_id || !p.school_id)
        : profiles;

      notifications = (relevantProfiles || []).map(profile => ({
        user_id: profile.user_id,
        title: '📚 Study Hall Now Open!',
        message: data.message || `${data.name || 'A study hall'} is now available.`,
        type: 'study_hall',
        data: { study_hall_id: data.id, name: data.name },
      }));
    } else if (type === 'grade_progression') {
      // Single user notification for grade progression
      notifications = [{
        user_id: data.user_id,
        title: '🎓 Grade Level Updated!',
        message: data.message || `Congratulations! You've been promoted to ${data.new_grade}.`,
        type: 'grade_update',
        data: { new_grade: data.new_grade },
      }];
    }

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error('Error inserting notifications:', insertError);
        throw insertError;
      }

      console.log(`Successfully created ${notifications.length} notifications`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsCreated: notifications.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-notifications function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});