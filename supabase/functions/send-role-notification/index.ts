import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RoleNotificationRequest {
  type: 'role_changed' | 'request_submitted' | 'request_reviewed';
  userEmail: string;
  userName?: string;
  roleName: string;
  action?: 'added' | 'removed';
  status?: 'approved' | 'rejected';
  adminNotes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const payload: RoleNotificationRequest = await req.json();
    const { type, userEmail, userName, roleName, action, status, adminNotes } = payload;

    let subject = '';
    let htmlContent = '';
    const displayName = userName || 'User';

    switch (type) {
      case 'role_changed':
        subject = `Your role has been ${action === 'added' ? 'updated' : 'changed'}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a1a1a;">Role ${action === 'added' ? 'Assigned' : 'Removed'}</h2>
            <p>Hello ${displayName},</p>
            <p>Your account role has been ${action === 'added' ? 'updated' : 'changed'} by an administrator.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Role:</strong> ${roleName}</p>
              <p style="margin: 0;"><strong>Action:</strong> ${action === 'added' ? 'Added' : 'Removed'}</p>
            </div>
            <p>If you have any questions about this change, please contact your administrator.</p>
            <p style="color: #666; font-size: 14px;">— The LunchLit Team</p>
          </div>
        `;
        break;

      case 'request_reviewed':
        subject = `Your role upgrade request has been ${status}`;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: ${status === 'approved' ? '#16a34a' : '#dc2626'};">
              Request ${status === 'approved' ? 'Approved' : 'Rejected'}
            </h2>
            <p>Hello ${displayName},</p>
            <p>Your role upgrade request for <strong>${roleName}</strong> has been ${status}.</p>
            ${adminNotes ? `
              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Admin Notes:</strong></p>
                <p style="margin: 5px 0 0;">${adminNotes}</p>
              </div>
            ` : ''}
            ${status === 'approved' ? 
              '<p>Your new permissions are now active. You may need to refresh your browser to see the changes.</p>' :
              '<p>If you believe this was a mistake or would like to resubmit, please contact your administrator.</p>'
            }
            <p style="color: #666; font-size: 14px;">— The LunchLit Team</p>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "LunchLit <notifications@resend.dev>",
        to: [userEmail],
        subject,
        html: htmlContent,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const data = await res.json();
    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error sending role notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
};

serve(handler);
