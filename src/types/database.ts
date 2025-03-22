
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      boardgames: {
        Row: {
          id: string
          title: string
          description: string
          complexity_rating: number
          video_url: string | null
          bgg_url: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          complexity_rating: number
          video_url?: string | null
          bgg_url?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          complexity_rating?: number
          video_url?: string | null
          bgg_url?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          boardgames: string[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          boardgames: string[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          boardgames?: string[]
          created_at?: string
        }
      }
      participations: {
        Row: {
          id: string
          user_id: string | null
          attendee_name: string | null
          event_id: string
          attending: boolean
          rankings: Json | null
          excluded: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          attendee_name?: string | null
          event_id: string
          attending: boolean
          rankings?: Json | null
          excluded?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          attendee_name?: string | null
          event_id?: string
          attending?: boolean
          rankings?: Json | null
          excluded?: string[] | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          is_admin: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          is_admin?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
