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
      sedes: {
        Row: {
          id: string
          nombre: string
          hora_entrada: string
          hora_salida: string
          activo: boolean | null
          creado_en: string | null
        }
        Insert: {
          id?: string
          nombre: string
          hora_entrada?: string
          hora_salida?: string
          activo?: boolean | null
          creado_en?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          hora_entrada?: string
          hora_salida?: string
          activo?: boolean | null
          creado_en?: string | null
        }
      }
      reservas: {
        Row: {
          id: string
          sede_id: string | null
          cliente_nombre: string
          cliente_correo: string
          cliente_telefono: string
          fecha_entrada: string
          fecha_salida: string
          estado: string | null
          monto_total: number
          adelanto_pagado: number | null
          creado_en: string | null
        }
        Insert: {
          id?: string
          sede_id?: string | null
          cliente_nombre: string
          cliente_correo: string
          cliente_telefono: string
          fecha_entrada: string
          fecha_salida: string
          estado?: string | null
          monto_total: number
          adelanto_pagado?: number | null
          creado_en?: string | null
        }
        Update: {
          id?: string
          sede_id?: string | null
          cliente_nombre?: string
          cliente_correo?: string
          cliente_telefono?: string
          fecha_entrada?: string
          fecha_salida?: string
          estado?: string | null
          monto_total?: number
          adelanto_pagado?: number | null
          creado_en?: string | null
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
