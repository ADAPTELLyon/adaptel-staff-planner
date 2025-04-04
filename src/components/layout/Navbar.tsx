
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Calendar, 
  Users, 
  UserCircle, 
  Settings 
} from "lucide-react";

export function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { name: "Tableau de bord", path: "/dashboard", icon: LayoutDashboard },
    { name: "Commandes", path: "/commandes", icon: ClipboardList },
    { name: "Planning", path: "/planning", icon: Calendar },
    { name: "Clients", path: "/clients", icon: Users },
    { name: "Candidats", path: "/candidats", icon: UserCircle },
    { name: "Paramétrages", path: "/parametrages", icon: Settings },
  ];

  return (
    <nav className="flex items-center">
      <ul className="flex space-x-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 text-sm font-medium transition-colors hover:text-[#840404]",
                  location.pathname === item.path
                    ? "text-[#840404] border-b-2 border-[#840404]"
                    : "text-gray-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
