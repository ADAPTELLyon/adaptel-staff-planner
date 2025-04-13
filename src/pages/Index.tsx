
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers la page Commandes, qui est la page principale
    navigate("/commandes");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500">Redirection vers la page Commandes...</p>
    </div>
  );
};

export default Index;
