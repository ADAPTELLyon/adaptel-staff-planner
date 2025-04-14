
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const [user, setUser] = useState<{ email: string; nom?: string; prenom?: string } | null>(null);
  
  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        try {
          // Using any to bypass strict typing issues temporarily
          const { data, error } = await supabase
            .from('candidats')
            .select('nom, prenom, email')
            .eq('id', authUser.id)
            .single();
          
          if (data) {
            // Utilisation d'une conversion explicite avec as unknown as
            setUser(data as unknown as { email: string; nom?: string; prenom?: string });
          } else if (authUser.email) {
            setUser({ email: authUser.email });
          }
          
          if (error) {
            console.error('Erreur lors de la récupération du profil:', error);
          }
        } catch (error) {
          console.error('Erreur inattendue:', error);
        }
      }
    };
    
    getUserProfile();
  }, []);

  return (
    <div className="flex items-center gap-4">
      {user && (
        <span className="text-sm font-medium">
          {user.prenom && user.nom 
            ? `${user.prenom} ${user.nom}`
            : user.email}
        </span>
      )}
    </div>
  );
}
