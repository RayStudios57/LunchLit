import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const WEBHOOK_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate: require either service role key or valid user JWT
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if it's the service role key or anon key (called from client or database trigger)
    const isServiceRole = token === supabaseServiceKey;
    const isAnonKey = token === Deno.env.get("SUPABASE_ANON_KEY") || token === Deno.env.get("SUPABASE_PUBLISHABLE_KEY");

    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== "string" || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isServiceRole && !isAnonKey) {
      // Verify valid user JWT
      const supabase = createClient(supabaseUrl, token, {
        auth: { persistSession: false },
      });
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      // If user is sending to someone else's email, check if they are an admin
      if (user && user.email?.toLowerCase() !== email.toLowerCase()) {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey);
        const { data: isAdmin } = await adminClient.rpc("is_admin", { _user_id: user.id });
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const displayName = (typeof name === "string" ? name.slice(0, 100) : "Student").replace(/[<>"'&]/g, "");

    console.log("Sending welcome email to:", email);

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff;">
        <div style="text-align: center; padding: 48px 20px; background: linear-gradient(135deg, #10b981, #06b6d4); border-radius: 16px; margin-bottom: 32px;">
          <h1 style="color: white; font-size: 36px; margin: 0; letter-spacing: -0.5px;">🎒 Welcome to LunchLit!</h1>
          <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin-top: 12px;">Your school life, organized.</p>
        </div>
        
        <p style="font-size: 18px; color: #1f2937; line-height: 1.6;">
          Hey ${displayName}! 👋
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Welcome aboard! LunchLit is built to make your school day easier and more organized. Here's what you can do:
        </p>
        
        <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <ul style="font-size: 15px; color: #374151; line-height: 2; margin: 0; padding-left: 20px;">
            <li>🍽️ <strong>Check daily lunch menus</strong> — never wonder "what's for lunch?" again</li>
            <li>📚 <strong>Find open study halls</strong> — real-time availability at your school</li>
            <li>📝 <strong>Plan homework & tasks</strong> — with deadline reminders so you never miss a due date</li>
            <li>🏆 <strong>Build your Brag Sheet</strong> — track achievements for college apps</li>
            <li>🤖 <strong>AI Study Chat</strong> — get help with any subject instantly</li>
            <li>🎯 <strong>Earn badges</strong> — unlock achievements as you use the app</li>
            <li>💬 <strong>Join discussions</strong> — connect with your school community</li>
          </ul>
        </div>

        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Start by setting up your profile and adding your school. The more you use LunchLit, the more badges you'll earn! 🏅
        </p>
        
        <div style="text-align: center; margin: 36px 0;">
          <a href="https://lunchlit.lovable.app" 
             style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981, #06b6d4); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
            Get Started →
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        
        <p style="font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
          Made with ❤️ by Ramakrishna Krishna & Alex Quinones<br>
          <a href="https://lunchlit.lovable.app/about" style="color: #10b981; text-decoration: none;">Learn more about LunchLit</a>
        </p>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "LunchLit <onboarding@resend.dev>",
        to: [email],
        subject: "🎒 Welcome to LunchLit! Your school life, organized.",
        html: htmlContent,
      }),
    });

    const result = await emailResponse.json();
    console.log("Welcome email sent:", result);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error sending welcome email:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
