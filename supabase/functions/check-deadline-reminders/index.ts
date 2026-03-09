import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = now.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Get incomplete tasks due today or tomorrow
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, user_id, title, due_date, due_time, priority")
      .eq("is_completed", false)
      .gte("due_date", todayStr)
      .lte("due_date", tomorrowStr);

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
      throw tasksError;
    }

    if (!tasks || tasks.length === 0) {
      console.log("No upcoming deadlines found");
      return new Response(JSON.stringify({ success: true, reminders: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check notification preferences for each user
    const userIds = [...new Set(tasks.map((t) => t.user_id))];
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("user_id, task_reminders")
      .in("user_id", userIds);

    const prefsMap = new Map(prefs?.map((p) => [p.user_id, p.task_reminders]) || []);

    // Check for existing reminders today to avoid duplicates
    const { data: existingNotifs } = await supabase
      .from("notifications")
      .select("data")
      .eq("type", "deadline_reminder")
      .gte("created_at", `${todayStr}T00:00:00Z`);

    const alreadyNotified = new Set(
      existingNotifs?.map((n) => (n.data as any)?.task_id).filter(Boolean) || []
    );

    const notifications = tasks
      .filter((task) => {
        // Skip if user has task_reminders disabled
        const wantsReminders = prefsMap.get(task.user_id);
        if (wantsReminders === false) return false;
        // Skip if already notified today
        if (alreadyNotified.has(task.id)) return false;
        return true;
      })
      .map((task) => {
        const isDueToday = task.due_date === todayStr;
        const timeStr = task.due_time ? ` at ${task.due_time}` : "";
        const urgency = isDueToday ? "⚠️" : "📋";
        const whenStr = isDueToday ? "today" : "tomorrow";
        const priorityEmoji = task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "🟢";

        return {
          user_id: task.user_id,
          title: `${urgency} Homework Due ${whenStr.charAt(0).toUpperCase() + whenStr.slice(1)}!`,
          message: `${priorityEmoji} "${task.title}" is due ${whenStr}${timeStr}. Don't forget to complete it!`,
          type: "deadline_reminder",
          data: { task_id: task.id, due_date: task.due_date, priority: task.priority },
        };
      });

    if (notifications.length > 0) {
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
        throw insertError;
      }
    }

    console.log(`Created ${notifications.length} deadline reminders`);

    return new Response(
      JSON.stringify({ success: true, reminders: notifications.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in check-deadline-reminders:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
