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
      candidats: {
        Row: {
          actif: boolean | null
          commentaire: string | null
          created_at: string
          email: string | null
          id: string
          nom: string
          prenom: string
          prioritaire: boolean | null
          secteurs: string[] | null
          telephone: string | null
          updated_at: string
          vehicule: boolean | null
        }
        Insert: {
          actif?: boolean | null
          commentaire?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom: string
          prenom: string
          prioritaire?: boolean | null
          secteurs?: string[] | null
          telephone?: string | null
          updated_at?: string
          vehicule?: boolean | null
        }
        Update: {
          actif?: boolean | null
          commentaire?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
          prioritaire?: boolean | null
          secteurs?: string[] | null
          telephone?: string | null
          updated_at?: string
          vehicule?: boolean | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          actif: boolean
          nom: string
          secteur: string
          service: string | null
          groupe_client: string | null
          adresse: string | null
          ville: string | null
          telephone: string | null
          email: string | null
          contacts: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          actif?: boolean
          nom: string
          secteur: string
          service?: string | null
          groupe_client?: string | null
          adresse?: string | null
          ville?: string | null
          telephone?: string | null
          email?: string | null
          contacts?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          actif?: boolean
          nom?: string
          secteur?: string
          service?: string | null
          groupe_client?: string | null
          adresse?: string | null
          ville?: string | null
          telephone?: string | null
          email?: string | null
          contacts?: string[] | null
        }
        Relationships: []
      }
      contacts_clients: {
        Row: {
          id: string
          nom: string
          prenom: string
          fonction: string | null
          email: string | null
          telephone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          prenom: string
          fonction?: string | null
          email?: string | null
          telephone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          prenom?: string
          fonction?: string | null
          email?: string | null
          telephone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      commande_jours: {
        Row: {
          candidat: string | null
          commande_id: string | null
          couleur_fond: string | null
          couleur_texte: string | null
          created_at: string
          creneaux: string[] | null
          id: string
          jour_date: string
          jour_semaine: number
          statut: string | null
          updated_at: string
        }
        Insert: {
          candidat?: string | null
          commande_id?: string | null
          couleur_fond?: string | null
          couleur_texte?: string | null
          created_at?: string
          creneaux?: string[] | null
          id?: string
          jour_date: string
          jour_semaine: number
          statut?: string | null
          updated_at?: string
        }
        Update: {
          candidat?: string | null
          commande_id?: string | null
          couleur_fond?: string | null
          couleur_texte?: string | null
          created_at?: string
          creneaux?: string[] | null
          id?: string
          jour_date?: string
          jour_semaine?: number
          statut?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commande_jours_commande_id_fkey"
            columns: ["commande_id"]
            isOneToOne: false
            referencedRelation: "commandes"
            referencedColumns: ["id"]
          },
        ]
      }
      commandes: {
        Row: {
          annee: number
          client_id: string | null
          client_nom: string
          created_at: string
          id: string
          secteur: string | null
          semaine: number
          statut: string
          updated_at: string
        }
        Insert: {
          annee: number
          client_id?: string | null
          client_nom: string
          created_at?: string
          id?: string
          secteur?: string | null
          semaine: number
          statut: string
          updated_at?: string
        }
        Update: {
          annee?: number
          client_id?: string | null
          client_nom?: string
          created_at?: string
          id?: string
          secteur?: string | null
          semaine?: number
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commandes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          id: number
          nom: string
          secteur: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          nom: string
          secteur: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          nom?: string
          secteur?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          client_id: string
          nom: string
          prenom: string
          fonction: string | null
          telephone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          nom: string
          prenom: string
          fonction?: string | null
          telephone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          nom?: string
          prenom?: string
          fonction?: string | null
          telephone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      parametrages: {
        Row: {
          id: string;
          categorie: string;
          valeur: string;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          categorie: string;
          valeur: string;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          categorie?: string;
          valeur?: string;
          created_at?: string;
          updated_at?: string;
        }
        Relationships: []
      }
      clients_modifications: {
        Row: {
          id: string;
          client_id: string;
          champ_modifie: string;
          ancienne_valeur: string | null;
          nouvelle_valeur: string | null;
          modifie_par: string;
          modifie_le: string;
        }
        Insert: {
          id?: string;
          client_id: string;
          champ_modifie: string;
          ancienne_valeur?: string | null;
          nouvelle_valeur?: string | null;
          modifie_par: string;
          modifie_le?: string;
        }
        Update: {
          id?: string;
          client_id?: string;
          champ_modifie?: string;
          ancienne_valeur?: string | null;
          nouvelle_valeur?: string | null;
          modifie_par?: string;
          modifie_le?: string;
        }
        Relationships: [
          {
            foreignKeyName: "clients_modifications_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export interface CommandeAvecJours {
  id: string;
  client_id: string | null;
  client_nom: string;
  secteur: string | null;
  statut: string;
  semaine: number;
  annee: number;
  created_at: string;
  updated_at: string;
  jours: {
    id: string;
    commande_id: string | null;
    jour_semaine: number;
    jour_date: string;
    statut: string | null;
    candidat: string | null;
    creneaux: string[] | null;
    couleur_fond: string | null;
    couleur_texte: string | null;
    created_at: string;
    updated_at: string;
  }[];
}

export type Client = Tables<'clients'>
export type ClientInsert = TablesInsert<'clients'>
export type ClientUpdate = TablesUpdate<'clients'>

export type Contact = Tables<'contacts_clients'>
export type ContactInsert = TablesInsert<'contacts_clients'>
export type ContactUpdate = TablesUpdate<'contacts_clients'>

export interface Service {
  id: number;
  created_at: string;
  nom: string;
  description: string | null;
}

export interface Parametrage {
  id: string;
  categorie: string;
  valeur: string;
  created_at: string;
  updated_at: string;
}

export interface ClientModification {
  id: string;
  client_id: string;
  champ_modifie: string;
  ancienne_valeur: string | null;
  nouvelle_valeur: string | null;
  modifie_par: string;
  modifie_le: string;
}
    