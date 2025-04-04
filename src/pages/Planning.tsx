
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface Indicateur {
  nom: string;
  valeur: number;
  couleur: string;
}

interface PlanningEntry {
  id: string;
  candidatNom: string;
  secteur: string;
  jours: {
    statut?: string;
    creneaux?: string[];
    couleurFond?: string;
    couleurTexte?: string;
    client?: string;
  }[];
}

const Planning = () => {
  const [semaine, setSemaine] = useState("semaine-en-cours");
  const [secteur, setSecteur] = useState("tous");
  const [recherche, setRecherche] = useState("");
  
  // Données factices pour les indicateurs
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([
    { nom: "Disponibles", valeur: 18, couleur: "#B8E0F2" },
    { nom: "Planifiés", valeur: 7, couleur: "#C1EAC5" },
    { nom: "Non disponibles", valeur: 5, couleur: "#A6A6A6" },
    { nom: "Non renseignés", valeur: 3, couleur: "#D9D9D9" },
  ]);

  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  
  const [planningData, setPlanningData] = useState<PlanningEntry[]>([
    {
      id: "1",
      candidatNom: "Martin Dupont",
      secteur: "Cuisine",
      jours: [
        { statut: "Non dispo", couleurFond: "#A6A6A6", couleurTexte: "#FFFFFF" },
        { statut: "Dispo", couleurFond: "#B8E0F2", couleurTexte: "#000000", creneaux: ["Matin", "Soir"] },
        { statut: "Mission validée", couleurFond: "#C1EAC5", couleurTexte: "#000000", creneaux: ["Matin"], client: "Restaurant Le Gourmet" },
        { statut: "Dispo", couleurFond: "#B8E0F2", couleurTexte: "#000000", creneaux: ["Matin", "Soir"] },
        { statut: "Dispo", couleurFond: "#B8E0F2", couleurTexte: "#000000", creneaux: ["Matin", "Soir"] },
        { statut: "Non dispo", couleurFond: "#A6A6A6", couleurTexte: "#FFFFFF" },
        { statut: "Non dispo", couleurFond: "#A6A6A6", couleurTexte: "#FFFFFF" }
      ]
    },
    {
      id: "2",
      candidatNom: "Sophie Laurent",
      secteur: "Réception",
      jours: [
        { statut: "Mission validée", couleurFond: "#C1EAC5", couleurTexte: "#000000", creneaux: ["Matin"], client: "Hôtel Bellevue" },
        { statut: "Mission validée", couleurFond: "#C1EAC5", couleurTexte: "#000000", creneaux: ["Matin"], client: "Hôtel Bellevue" },
        { statut: "Mission validée", couleurFond: "#C1EAC5", couleurTexte: "#000000", creneaux: ["Matin"], client: "Hôtel Bellevue" },
        { statut: "Mission validée", couleurFond: "#C1EAC5", couleurTexte: "#000000", creneaux: ["Matin"], client: "Hôtel Bellevue" },
        { statut: "Mission validée", couleurFond: "#C1EAC5", couleurTexte: "#000000", creneaux: ["Matin"], client: "Hôtel Bellevue" },
        { statut: "Dispo", couleurFond: "#B8E0F2", couleurTexte: "#000000", creneaux: ["Matin", "Soir"] },
        { statut: "Dispo", couleurFond: "#B8E0F2", couleurTexte: "#000000", creneaux: ["Matin", "Soir"] }
      ]
    }
  ]);

  // Pour la barre de progression
  const calculerProgression = () => {
    const planifiesCount = indicateurs.find(i => i.nom === "Planifiés")?.valeur || 0;
    const disposCount = indicateurs.find(i => i.nom === "Disponibles")?.valeur || 0;
    
    if (disposCount > 0) {
      return (planifiesCount / disposCount) * 100;
    }
    return 0;
  };

  return (
    <div className="container mx-auto p-4">
      {/* Section des indicateurs et filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        {/* Indicateurs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {indicateurs.map((indicateur) => (
            <Card
              key={indicateur.nom}
              className="p-4 flex flex-col items-center justify-center"
              style={{ backgroundColor: indicateur.couleur }}
            >
              <div className="text-sm font-medium">{indicateur.nom}</div>
              <div className="text-2xl font-bold">{indicateur.valeur}</div>
            </Card>
          ))}
        </div>
        
        {/* Barre de progression */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Taux de planification</span>
            <span>{calculerProgression().toFixed(0)}%</span>
          </div>
          <Progress value={calculerProgression()} />
        </div>
        
        {/* Filtres et boutons */}
        <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-4 mb-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <select 
              className="border rounded px-3 py-2 text-sm"
              value={semaine}
              onChange={(e) => setSemaine(e.target.value)}
            >
              <option value="semaine-en-cours">Semaine en cours</option>
              <option value="semaine-prochaine">Semaine prochaine</option>
            </select>
            
            <select 
              className="border rounded px-3 py-2 text-sm"
              value={secteur}
              onChange={(e) => setSecteur(e.target.value)}
            >
              <option value="tous">Tous les secteurs</option>
              <option value="cuisine">Cuisine</option>
              <option value="salle">Salle</option>
              <option value="plonge">Plonge</option>
              <option value="reception">Réception</option>
              <option value="etages">Étages</option>
            </select>
          </div>
          
          {/* Interrupteurs */}
          <div className="flex flex-wrap items-center space-x-4">
            <Tabs defaultValue="on" className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="on">Semaine en cours</TabsTrigger>
                <TabsTrigger value="off">Toutes</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue="off" className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="on">Disponibles</TabsTrigger>
                <TabsTrigger value="off">Tous</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue="off" className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="on">Tout afficher</TabsTrigger>
                <TabsTrigger value="off">Filtrer</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Recherche et boutons d'action */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Input
            placeholder="Recherche rapide..."
            className="w-full md:w-1/3 mb-2 md:mb-0"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          
          <div className="flex space-x-2">
            <Button>Saisie disponibilités</Button>
            <Button variant="outline">Imprimer planning</Button>
          </div>
        </div>
      </div>
      
      {/* Tableau de planning */}
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left font-medium text-sm text-gray-600 border">Candidat / Secteur</th>
              {jours.map((jour) => (
                <th key={jour} className="py-2 px-3 text-left font-medium text-sm text-gray-600 border">
                  {jour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {planningData.map((entry) => (
              <tr key={entry.id}>
                <td className="border p-2">
                  <div className="flex flex-col">
                    <div className="font-medium">{entry.candidatNom}</div>
                    <div className="text-sm text-gray-500">{entry.secteur}</div>
                  </div>
                </td>
                {entry.jours.map((jour, index) => (
                  <td
                    key={index}
                    className="border p-2"
                    style={{
                      backgroundColor: jour.couleurFond || 'transparent',
                      color: jour.couleurTexte || 'inherit'
                    }}
                  >
                    {jour.statut && (
                      <div className="flex flex-col">
                        <div className="font-medium text-sm">{jour.statut}</div>
                        {jour.client && <div className="text-xs">{jour.client}</div>}
                        {jour.creneaux?.map((creneau, idx) => (
                          <div key={idx} className="text-xs">{creneau}</div>
                        ))}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Planning;
