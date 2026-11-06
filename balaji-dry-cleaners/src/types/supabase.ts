/**
 * Supabase Database type definitions.
 * ─────────────────────────────────────────────
 * Matches Supabase CLI generated types structure (including Relationships).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      inquiries: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          name: string;
          phone: string;
          message: string | null;
          source: string;
          status: "new" | "contacted" | "closed";
          utm_source: string | null;
          utm_campaign: string | null;
          ip_hash: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name: string;
          phone: string;
          message?: string | null;
          source?: string;
          status?: "new" | "contacted" | "closed";
          utm_source?: string | null;
          utm_campaign?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          name?: string;
          phone?: string;
          message?: string | null;
          source?: string;
          status?: "new" | "contacted" | "closed";
          utm_source?: string | null;
          utm_campaign?: string | null;
          ip_hash?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          booking_code: string;
          name: string;
          phone: string;
          service: string;
          pickup_slot: "subah" | "dopahar" | "shaam";
          pickup_date: string;
          address: string;
          status: "pending" | "confirmed" | "picked_up" | "delivered" | "cancelled";
          notes: string | null;
          utm_source: string | null;
          utm_campaign: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          booking_code?: string;
          name: string;
          phone: string;
          service: string;
          pickup_slot: "subah" | "dopahar" | "shaam";
          pickup_date: string;
          address: string;
          status?: "pending" | "confirmed" | "picked_up" | "delivered" | "cancelled";
          notes?: string | null;
          utm_source?: string | null;
          utm_campaign?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          booking_code?: string;
          name?: string;
          phone?: string;
          service?: string;
          pickup_slot?: "subah" | "dopahar" | "shaam";
          pickup_date?: string;
          address?: string;
          status?: "pending" | "confirmed" | "picked_up" | "delivered" | "cancelled";
          notes?: string | null;
          utm_source?: string | null;
          utm_campaign?: string | null;
        };
        Relationships: [];
      };
      page_views: {
        Row: {
          id: string;
          created_at: string;
          path: string;
          referrer: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          device: string | null;
          ip_hash: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          path: string;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          device?: string | null;
          ip_hash?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          path?: string;
          referrer?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          device?: string | null;
          ip_hash?: string | null;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          id: string;
          created_at: string;
          ip_hash: string;
          route_key: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          ip_hash: string;
          route_key: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          ip_hash?: string;
          route_key?: string;
        };
        Relationships: [];
      };
      notification_logs: {
        Row: {
          id: string;
          created_at: string;
          type: string;
          target: string;
          status: "sent" | "failed" | "skipped";
          error: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          type: string;
          target: string;
          status: "sent" | "failed" | "skipped";
          error?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          type?: string;
          target?: string;
          status?: "sent" | "failed" | "skipped";
          error?: string | null;
          metadata?: Json | null;
        };
        Relationships: [];
      };
      booking_status_history: {
        Row: {
          id: string;
          created_at: string;
          booking_id: string;
          from_status: string | null;
          to_status: string;
          note: string | null;
          changed_by: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          booking_id: string;
          from_status?: string | null;
          to_status: string;
          note?: string | null;
          changed_by?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          booking_id?: string;
          from_status?: string | null;
          to_status?: string;
          note?: string | null;
          changed_by?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string;
          icon: string;
          inquiry: string | null;
          display_order: number;
          is_active: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description: string;
          icon?: string;
          inquiry?: string | null;
          display_order?: number;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string;
          icon?: string;
          inquiry?: string | null;
          display_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      works: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          title: string;
          category: string;
          description: string;
          before_image: string | null;
          after_image: string;
          tags: string[] | null;
          tag_text: string | null;
          customer_note: string | null;
          is_featured: boolean;
          is_active: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          category?: string;
          description: string;
          before_image?: string | null;
          after_image: string;
          tags?: string[] | null;
          tag_text?: string | null;
          customer_note?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          display_order?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          category?: string;
          description?: string;
          before_image?: string | null;
          after_image?: string;
          tags?: string[] | null;
          tag_text?: string | null;
          customer_note?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          display_order?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
