
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

// Types pour les indicateurs
interface Indicateur {
  nom: string;
  valeur: number;
  couleur: string;
}

// Types pour les commandes
interface Commande {
  id: string;
  clientNom: string;
  secteur: string;
  statut: string;
  jours: {
    candidat?: string;
    creneaux?: string[];
    statut?: string;
    couleurFond?: string;
    couleurTexte?: string;
  }[];
}

const Commandes = () => {
  const [semaine, setSemaine] = useState("semaine-en-cours");
  const [secteur, setSecteur] = useState("tous");
  const [client, setClient] = useState("tous");
  const [semaineEnCours, setSemaineEnCours] = useState(true);
  const [enRechercheUniquement, setEnRechercheUniquement] = useState(false);
  const [toutAfficher, setToutAfficher] = useState(false);
  const [recherche, setRecherche] = useState("");
  
  // Données factices pour les indicateurs
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([
    { nom: "En recherche", valeur: 5, couleur: "#FFE4B2" },
    { nom: "Demandées", valeur: 12, couleur: "#B8E0F2" },
    { nom: "Validées", valeur: 7, couleur: "#C1EAC5" },
    { nom: "Non pourvue", valeur: 0, couleur: "#FFB3B3" },
  ]);
  
  // Pour la barre de progression
  const [progression, setProgression] = useState(0);
  
  // Jours de la semaine
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  
  // Données factices pour les commandes
  const [commandes, setCommandes] = useState<Commande[]>([
    {
      id: "1",
      clientNom: "Restaurant Le Gourmet",
      secteur: "Cuisine",
      statut: "EN_RECHERCHE",
      jours: [
        { statut: "En recherche", couleurFond: "#FFE4B2", couleurTexte: "#000000" },
        {},
        { statut: "En recherche", couleurFond: "#FFE4B2", couleurTexte: "#000000", creneaux: ["09:00-15:00"] },
        {},
        { statut: "Validé", couleurFond: "#C1EAC5", couleurTexte: "#000000", candidat: "Martin D.", creneaux: ["09:00-15:00"] },
        { statut: "Validé", couleurFond: "#C1EAC5", couleurTexte: "#000000", candidat: "Martin D.", creneaux: ["09:00-15:00"] },
        {}
      ]
    },
    {
      id: "2",
      clientNom: "Hôtel Bellevue",
      secteur: "Réception",
      statut: "VALIDE",
      jours: [
        { statut: "Validé", couleurFond: "#C1EAC5", couleurTexte: "#000000", candidat: "Sophie L.", creneaux: ["07:00-15:00"] },
        { statut: "Validé", couleurFond: "#C1EAC5", couleurTexte: "#000000", candidat: "Sophie L.", creneaux: ["07:00-15:00"] },
        { statut: "Validé", couleurFond: "#C1EAC5", couleurTexte: "#000000", candidat: "Sophie L.", creneaux: ["07:00-15:00"] },
        { statut: "Validé", couleurFond: "#C1EAC5", couleurTexte: "#000000", candidat: "Sophie L.", creneaux: ["07:00-15:00"] },
        { statut: "Validé", couleurFond: "#C1EAC5", couleurTexte: "#000000", candidat: "Sophie L.", creneaux: ["07:00-15:00"] },
        {},
        {}
      ]
    }
  ]);
  
  useEffect(() => {
    // Calcul de la progression pour la barre de progression
    const valideesCount = indicateurs.find(i => i.nom === "Validées")?.valeur || 0;
    const demandeesCount = indicateurs.find(i => i.nom === "Demandées")?.valeur || 0;
    
    if (demandeesCount > 0) {
      setProgression((valideesCount / demandeesCount) * 100);
    } else {
      setProgression(0);
    }
  }, [indicateurs]);

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
            <span>Progression</span>
            <span>{progression.toFixed(0)}%</span>
          </div>
          <Progress value={progression} />
        </div>
        
        {/* Filtres et boutons */}
        <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 md:space-x-4 mb-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            {/* Filtres de sélection */}
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
            
            <select 
              className="border rounded px-3 py-2 text-sm"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            >
              <option value="tous">Tous les clients</option>
            </select>
          </div>
          
          {/* Interrupteurs */}
          <div className="flex flex-wrap items-center space-x-4">
            <Tabs defaultValue={semaineEnCours ? "on" : "off"} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="on" onClick={() => setSemaineEnCours(true)}>Semaine en cours</TabsTrigger>
                <TabsTrigger value="off" onClick={() => setSemaineEnCours(false)}>Toutes</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue={enRechercheUniquement ? "on" : "off"} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="on" onClick={() => setEnRechercheUniquement(true)}>En recherche</TabsTrigger>
                <TabsTrigger value="off" onClick={() => setEnRechercheUniquement(false)}>Tous</TabsTrigger>
              </TabsList>
            </Tabs>
            <Tabs defaultValue={toutAfficher ? "on" : "off"} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="on" onClick={() => setToutAfficher(true)}>Tout afficher</TabsTrigger>
                <TabsTrigger value="off" onClick={() => setToutAfficher(false)}>Filtrer</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Boutons d'action et recherche */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Input
            placeholder="Recherche rapide..."
            className="w-full md:w-1/3 mb-2 md:mb-0"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          
          <div className="flex space-x-2">
            <Button>Nouvelle commande</Button>
            <Button variant="outline">Saisie disponibilités</Button>
            <Button variant="outline">Saisie incident</Button>
          </div>
        </div>
      </div>
      
      {/* Tableau de commandes */}
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left font-medium text-sm text-gray-600 border">Client / Secteur</th>
              {jours.map((jour) => (
                <th key={jour} className="py-2 px-3 text-left font-medium text-sm text-gray-600 border">
                  {jour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commandes.map((commande) => (
              <tr key={commande.id}>
                <td className="border p-2">
                  <div className="flex flex-col">
                    <div className="font-medium">{commande.clientNom}</div>
                    <div className="text-sm text-gray-500">{commande.secteur}</div>
                    <div className="flex space-x-1 mt-1">
                      <button className="text-gray-500 hover:text-gray-700">
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </td>
                {commande.jours.map((jour, index) => (
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
                        <div className="font-medium">{jour.statut}</div>
                        {jour.candidat && <div className="text-sm">{jour.candidat}</div>}
                        {jour.creneaux?.map((creneau, idx) => (
                          <div key={idx} className="text-xs">{creneau}</div>
                        ))}
                        <button className="text-gray-600 hover:text-gray-900 mt-1">
                          <Plus size={16} />
                        </button>
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

export default Commandes;
