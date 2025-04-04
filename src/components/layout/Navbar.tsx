
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { name: "Tableau de bord", path: "/dashboard" },
    { name: "Commandes", path: "/commandes" },
    { name: "Planning", path: "/planning" },
    { name: "Clients", path: "/clients" },
    { name: "Candidats", path: "/candidats" },
    { name: "Paramétrages", path: "/parametrages" },
  ];

  return (
    <nav className="flex items-center ml-8">
      <ul className="flex space-x-6">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              to={item.path}
              className={cn(
                "px-2 py-1 text-sm font-medium transition-colors hover:text-[#840404]",
                location.pathname === item.path
                  ? "text-[#840404] border-b-2 border-[#840404]"
                  : "text-gray-600"
              )}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
