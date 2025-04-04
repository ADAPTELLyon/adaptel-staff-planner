
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
    <nav className="flex items-center justify-center border-b bg-white h-12">
      <div className="container flex justify-center">
        <ul className="flex space-x-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-colors hover:text-foreground/80",
                  location.pathname === item.path
                    ? "border-b-2 border-[#840404] text-[#840404]"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
