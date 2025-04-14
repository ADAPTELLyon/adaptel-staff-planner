import { Contact } from "@/integrations/supabase/types";

export interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  actif: boolean;
  nom: string;
  secteur: string;
  service: string | null;
  groupe_client: string | null;
  adresse: string | null;
  ville: string | null;
  telephone: string | null;
  email: string | null;
  contacts: string[] | null;
} 