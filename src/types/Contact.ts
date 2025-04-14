export interface Contact {
  id: string;
  client_id: string;
  created_at: string;
  updated_at: string;
  nom: string;
  prenom: string;
  fonction: string | null;
  telephone: string | null;
  email: string | null;
} 