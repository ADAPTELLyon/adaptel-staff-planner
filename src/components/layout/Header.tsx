import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser && authUser.email) {
        setUserEmail(authUser.email);
      }
    };
    
    getUserEmail();
  }, []);

  return (
    <div className="flex items-center gap-4">
      {userEmail && (
        <span className="text-sm font-medium">
          {userEmail}
        </span>
      )}
    </div>
  );
}
