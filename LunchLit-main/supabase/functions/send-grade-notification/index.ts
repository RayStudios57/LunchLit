import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GradeNotificationRequest {
  email: string;
  fromGrade: string;
  toGrade: string | null;
  isGraduation: boolean;
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
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
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
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { email, fromGrade, toGrade, isGraduation }: GradeNotificationRequest = await req.json();

    console.log("Sending grade notification email to:", email);

    let subject: string;
    let htmlContent: string;

    if (isGraduation) {
      subject = "🎓 Congratulations, Graduate! - LunchLit";
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 16px; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 32px; margin: 0;">🎓 Congratulations!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin-top: 12px;">You've officially graduated!</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            You've completed your journey from <strong>${fromGrade}</strong> and are now a high school graduate!
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Your Brag Sheet is ready and waiting for you. Use it to showcase your achievements on college applications!
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${Deno.env.get("SITE_URL") || "https://lunchlit.lovable.app"}/graduation" 
               style="display: inline-block; padding: 14px 32px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              View Your Graduation Summary
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Best wishes for your future endeavors!<br>
            The LunchLit Team
          </p>
        </div>
      `;
    } else {
      subject = `🎉 Welcome to ${toGrade}! - LunchLit`;
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 40px 20px; background: linear-gradient(135deg, #10b981, #06b6d4); border-radius: 16px; margin-bottom: 24px;">
            <h1 style="color: white; font-size: 28px; margin: 0;">🎉 New School Year!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin-top: 12px;">You're now in ${toGrade}</p>
          </div>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Congratulations on moving up from <strong>${fromGrade}</strong> to <strong>${toGrade}</strong>!
          </p>
          
          <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            This is a great time to:
          </p>
          <ul style="font-size: 16px; color: #374151; line-height: 1.8;">
            <li>Update your class schedule</li>
            <li>Add new achievements to your Brag Sheet</li>
            <li>Set goals for the new school year</li>
          </ul>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${Deno.env.get("SITE_URL") || "https://lunchlit.lovable.app"}" 
               style="display: inline-block; padding: 14px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Open LunchLit
            </a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            Have a great school year!<br>
            The LunchLit Team
          </p>
        </div>
      `;
    }

    // Use Resend API directly with fetch
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "LunchLit <onboarding@resend.dev>",
        to: [email],
        subject,
        html: htmlContent,
      }),
    });

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending grade notification email:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
