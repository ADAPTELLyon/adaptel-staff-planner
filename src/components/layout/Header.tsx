
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const [user, setUser] = useState<{ email: string; nom?: string; prenom?: string } | null>(null);
  
  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Utilisons une approche typée sécurisée pour éviter les erreurs TS2769
        try {
          // Récupération du profil utilisateur si l'utilisateur est authentifié
          const { data, error } = await supabase
            .from('utilisateurs')
            .select('nom, prenom, email')
            .eq('id', authUser.id)
            .maybeSingle();
          
          if (data) {
            setUser(data);
          } else if (authUser.email) {
            // Fallback en cas d'absence de profil utilisateur
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
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-white px-4 lg:px-8">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-[#840404]">Adaptel Lyon</h1>
      </div>
      
      <div className="flex items-center gap-2">
        {user && (
          <span className="text-sm font-medium">
            {user.prenom && user.nom 
              ? `${user.prenom} ${user.nom}`
              : user.email}
          </span>
        )}
      </div>
    </header>
  );
}
