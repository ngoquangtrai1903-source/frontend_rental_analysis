export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  gold: {
    Tables: {
      rental_room: {
        Row: {
          source: string
          list_id: string
          posted_date: string | null
          price_vnd: number | null
          size_m2: number | null
          price_per_m2_vnd: number | null
          furnishing_status: string | null
          rooms: string | null
          category_name: string | null
          latitude: number | null
          longitude: number | null
          ward_name: string | null
          dist_to_cbd: number | null
          dist_to_beach: number | null
          nearest_beach_code: string | null
          dist_to_airport: number | null
          dist_to_nearest_uni: number | null
          nearest_uni_code: string | null
          flooded_2022: boolean | null
          flooded_2025: boolean | null
          flood_risk_label: number | null
          has_balcony: number | null
          free_hours: number | null
          has_camera_security: number | null
          has_elevator: number | null
          has_mezzanine: number | null
          private_bathroom: number | null
          wifi: number | null
          has_parking: number | null
          has_window: number | null
        }
        Insert: {
          source: string
          list_id: string
          posted_date?: string | null
          price_vnd?: number | null
          size_m2?: number | null
          price_per_m2_vnd?: number | null
          furnishing_status?: string | null
          rooms?: string | null
          category_name?: string | null
          latitude?: number | null
          longitude?: number | null
          ward_name?: string | null
          dist_to_cbd?: number | null
          dist_to_beach?: number | null
          nearest_beach_code?: string | null
          dist_to_airport?: number | null
          dist_to_nearest_uni?: number | null
          nearest_uni_code?: string | null
          flooded_2022?: boolean | null
          flooded_2025?: boolean | null
          flood_risk_label?: number | null
          has_balcony?: number | null
          free_hours?: number | null
          has_camera_security?: number | null
          has_elevator?: number | null
          has_mezzanine?: number | null
          private_bathroom?: number | null
          wifi?: number | null
          has_parking?: number | null
          has_window?: number | null
        }
        Update: Partial<Database['gold']['Tables']['rental_room']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
