export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      allowed_email_domains: {
        Row: {
          auto_assign_role: Database["public"]["Enums"]["app_role"]
          created_at: string
          created_by: string | null
          description: string | null
          domain: string
          id: string
          school_id: string | null
        }
        Insert: {
          auto_assign_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain: string
          id?: string
          school_id?: string | null
        }
        Update: {
          auto_assign_role?: Database["public"]["Enums"]["app_role"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          domain?: string
          id?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "allowed_email_domains_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      brag_sheet_academics: {
        Row: {
          colleges_applying: string[] | null
          courses: Json | null
          created_at: string
          gpa_unweighted: number | null
          gpa_weighted: number | null
          id: string
          test_scores: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          colleges_applying?: string[] | null
          courses?: Json | null
          created_at?: string
          gpa_unweighted?: number | null
          gpa_weighted?: number | null
          id?: string
          test_scores?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          colleges_applying?: string[] | null
          courses?: Json | null
          created_at?: string
          gpa_unweighted?: number | null
          gpa_weighted?: number | null
          id?: string
          test_scores?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brag_sheet_entries: {
        Row: {
          category: Database["public"]["Enums"]["brag_category"]
          colleges_applying_to: string[] | null
          courses_taken: Json | null
          created_at: string
          description: string | null
          end_date: string | null
          gpa_unweighted: number | null
          gpa_weighted: number | null
          grade_level: string
          grades_participated: string[] | null
          hours_spent: number | null
          id: string
          images: string[] | null
          impact: string | null
          is_auto_suggested: boolean | null
          is_ongoing: boolean | null
          position_role: string | null
          school_year: string
          start_date: string | null
          suggested_from_task_id: string | null
          test_scores: Json | null
          title: string
          updated_at: string
          user_id: string
          verification_notes: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at: string | null
          verified_by: string | null
          year_received: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["brag_category"]
          colleges_applying_to?: string[] | null
          courses_taken?: Json | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          gpa_unweighted?: number | null
          gpa_weighted?: number | null
          grade_level: string
          grades_participated?: string[] | null
          hours_spent?: number | null
          id?: string
          images?: string[] | null
          impact?: string | null
          is_auto_suggested?: boolean | null
          is_ongoing?: boolean | null
          position_role?: string | null
          school_year: string
          start_date?: string | null
          suggested_from_task_id?: string | null
          test_scores?: Json | null
          title: string
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          year_received?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["brag_category"]
          colleges_applying_to?: string[] | null
          courses_taken?: Json | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          gpa_unweighted?: number | null
          gpa_weighted?: number | null
          grade_level?: string
          grades_participated?: string[] | null
          hours_spent?: number | null
          id?: string
          images?: string[] | null
          impact?: string | null
          is_auto_suggested?: boolean | null
          is_ongoing?: boolean | null
          position_role?: string | null
          school_year?: string
          start_date?: string | null
          suggested_from_task_id?: string | null
          test_scores?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          verified_at?: string | null
          verified_by?: string | null
          year_received?: string | null
        }
        Relationships: []
      }
      brag_sheet_insights: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          question_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          question_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          question_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      class_schedules: {
        Row: {
          class_name: string
          color: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_club: boolean | null
          room_number: string | null
          show_every_day: boolean | null
          start_time: string
          teacher_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          class_name: string
          color?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_club?: boolean | null
          room_number?: string | null
          show_every_day?: boolean | null
          start_time: string
          teacher_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          class_name?: string
          color?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_club?: boolean | null
          room_number?: string | null
          show_every_day?: boolean | null
          start_time?: string
          teacher_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_social_links: {
        Row: {
          created_at: string
          display_order: number | null
          icon: string
          id: string
          platform: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon: string
          id?: string
          platform: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon?: string
          id?: string
          platform?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      custom_roles: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          permissions: Json | null
          priority: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          permissions?: Json | null
          priority?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          permissions?: Json | null
          priority?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      discussion_categories: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          school_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          school_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_categories_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          parent_id: string | null
          school_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          parent_id?: string | null
          school_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          parent_id?: string | null
          school_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_dietary_tags: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          school_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          school_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_dietary_tags_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_schedules: {
        Row: {
          created_at: string
          id: string
          meal_date: string
          meal_type: string
          menu_items: Json
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_date: string
          meal_type?: string
          menu_items?: Json
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_date?: string
          meal_type?: string
          menu_items?: Json
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_schedules_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_uploads: {
        Row: {
          created_at: string
          id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          school_email: string
          school_id: string | null
          school_name: string
          status: string | null
          updated_at: string
          upload_data: Json
        }
        Insert: {
          created_at?: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_email: string
          school_id?: string | null
          school_name: string
          status?: string | null
          updated_at?: string
          upload_data: Json
        }
        Update: {
          created_at?: string
          id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          school_email?: string
          school_id?: string | null
          school_name?: string
          status?: string | null
          updated_at?: string
          upload_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "menu_uploads_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          discussion_replies: boolean
          grade_progression: boolean
          id: string
          new_menu_items: boolean
          study_hall_availability: boolean
          task_reminders: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discussion_replies?: boolean
          grade_progression?: boolean
          id?: string
          new_menu_items?: boolean
          study_hall_availability?: boolean
          task_reminders?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discussion_replies?: boolean
          grade_progression?: boolean
          id?: string
          new_menu_items?: boolean
          study_hall_availability?: boolean
          task_reminders?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          calendar_sync_enabled: boolean | null
          created_at: string
          display_role_color: string | null
          display_role_icon: string | null
          display_role_priority: number | null
          full_name: string | null
          grade_level: string | null
          id: string
          is_graduated: boolean | null
          last_grade_progression: string | null
          school_id: string | null
          school_name: string | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          calendar_sync_enabled?: boolean | null
          created_at?: string
          display_role_color?: string | null
          display_role_icon?: string | null
          display_role_priority?: number | null
          full_name?: string | null
          grade_level?: string | null
          id?: string
          is_graduated?: boolean | null
          last_grade_progression?: string | null
          school_id?: string | null
          school_name?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          calendar_sync_enabled?: boolean | null
          created_at?: string
          display_role_color?: string | null
          display_role_icon?: string | null
          display_role_priority?: number | null
          full_name?: string | null
          grade_level?: string | null
          id?: string
          is_graduated?: boolean | null
          last_grade_progression?: string | null
          school_id?: string | null
          school_name?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      role_audit_logs: {
        Row: {
          action_type: string
          created_at: string
          custom_role_id: string | null
          details: Json | null
          id: string
          performed_by: string
          target_role_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          custom_role_id?: string | null
          details?: Json | null
          id?: string
          performed_by: string
          target_role_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          custom_role_id?: string | null
          details?: Json | null
          id?: string
          performed_by?: string
          target_role_id?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      role_upgrade_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          reason: string
          requested_role: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason: string
          requested_role: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          reason?: string
          requested_role?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_goals: {
        Row: {
          created_at: string
          description: string | null
          goal_type: string
          id: string
          notes: string | null
          priority: string | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal_type?: string
          id?: string
          notes?: string | null
          priority?: string | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          goal_type?: string
          id?: string
          notes?: string | null
          priority?: string | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_halls: {
        Row: {
          capacity: number
          created_at: string
          current_occupancy: number
          id: string
          is_available: boolean
          location: string
          name: string
          periods: string[]
          school_id: string | null
          teacher: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          current_occupancy?: number
          id?: string
          is_available?: boolean
          location: string
          name: string
          periods?: string[]
          school_id?: string | null
          teacher?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          current_occupancy?: number
          id?: string
          is_available?: boolean
          location?: string
          name?: string
          periods?: string[]
          school_id?: string | null
          teacher?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_halls_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      target_schools: {
        Row: {
          admission_type: string | null
          application_deadline: string | null
          created_at: string
          id: string
          is_match: boolean | null
          is_reach: boolean | null
          is_safety: boolean | null
          location: string | null
          notes: string | null
          school_name: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admission_type?: string | null
          application_deadline?: string | null
          created_at?: string
          id?: string
          is_match?: boolean | null
          is_reach?: boolean | null
          is_safety?: boolean | null
          location?: string | null
          notes?: string | null
          school_name: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admission_type?: string | null
          application_deadline?: string | null
          created_at?: string
          id?: string
          is_match?: boolean | null
          is_reach?: boolean | null
          is_safety?: boolean | null
          location?: string | null
          notes?: string | null
          school_name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          due_time: string | null
          id: string
          is_completed: boolean | null
          priority: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          calendar_sync_enabled: boolean | null
          color_mode: string | null
          created_at: string
          id: string
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          calendar_sync_enabled?: boolean | null
          color_mode?: string | null
          created_at?: string
          id?: string
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          calendar_sync_enabled?: boolean | null
          color_mode?: string | null
          created_at?: string
          id?: string
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          custom_role_id: string | null
          email_domain: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          school_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_role_id?: string | null
          email_domain?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          custom_role_id?: string | null
          email_domain?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          school_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_custom_role_id_fkey"
            columns: ["custom_role_id"]
            isOneToOne: false
            referencedRelation: "custom_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_suggestions: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          status: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_role_for_email_domain: {
        Args: { _email: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_school_id: { Args: { _user_id: string }; Returns: string }
      get_verifier_school_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_verifier: { Args: { _user_id: string }; Returns: boolean }
      toggle_discussion_pin: {
        Args: { _discussion_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "teacher" | "counselor" | "student"
      brag_category:
        | "volunteering"
        | "job"
        | "award"
        | "internship"
        | "leadership"
        | "club"
        | "extracurricular"
        | "academic"
        | "other"
      verification_status: "pending" | "verified" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "teacher", "counselor", "student"],
      brag_category: [
        "volunteering",
        "job",
        "award",
        "internship",
        "leadership",
        "club",
        "extracurricular",
        "academic",
        "other",
      ],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
