
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [semaineEnCours, setSemaineEnCours] = useState(true);
  const [disponiblesUniquement, setDisponiblesUniquement] = useState(false);
  const [toutAfficher, setToutAfficher] = useState(false);
  
  // Données factices pour les indicateurs
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([
    { nom: "Disponibles", valeur: 18, couleur: "#B8E0F2" },
    { nom: "Planifiés", valeur: 7, couleur: "#C1EAC5" },
    { nom: "Non disponibles", valeur: 5, couleur: "#A6A6A6" },
    { nom: "Non renseignés", valeur: 3, couleur: "#D9D9D9" },
  ]);

  // Jours de la semaine
  const jourSemaineActuelle = new Date();
  const premierJourSemaine = new Date(jourSemaineActuelle);
  premierJourSemaine.setDate(jourSemaineActuelle.getDate() - jourSemaineActuelle.getDay() + 1);
  
  const jours = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(premierJourSemaine);
    date.setDate(premierJourSemaine.getDate() + i);
    
    const jour = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"][date.getDay()];
    const numero = date.getDate();
    const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"][date.getMonth()];
    
    return `${jour} ${numero} ${mois}`;
  });
  
  const numeroSemaine = (() => {
    const d = new Date(premierJourSemaine);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  })();
  
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
  const [progression, setProgression] = useState(0);
  
  useEffect(() => {
    const planifiesCount = indicateurs.find(i => i.nom === "Planifiés")?.valeur || 0;
    const disposCount = indicateurs.find(i => i.nom === "Disponibles")?.valeur || 0;
    
    if (disposCount > 0) {
      setProgression((planifiesCount / disposCount) * 100);
    } else {
      setProgression(0);
    }
  }, [indicateurs]);

  return (
    <div className="container mx-auto p-4">
      {/* Section des indicateurs et filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        {/* Indicateurs */}
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {indicateurs.map((indicateur) => (
            <Card
              key={indicateur.nom}
              className="p-3 flex flex-col items-center justify-center min-w-[160px] max-w-[200px]"
              style={{ backgroundColor: indicateur.couleur }}
            >
              <div className="text-sm font-medium">{indicateur.nom}</div>
              <div className="text-2xl font-bold">{indicateur.valeur}</div>
            </Card>
          ))}
        </div>
        
        {/* Barre de progression */}
        <div className="mb-6 max-w-xl mx-auto">
          <div className="flex justify-between text-xs mb-1">
            <span>Taux de planification</span>
            <span>{progression.toFixed(0)}%</span>
          </div>
          <Progress value={progression} className="h-2" />
        </div>
        
        {/* Filtres et interrupteurs */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-6">
          {/* Filtres de sélection */}
          <div className="flex flex-wrap gap-4">
            <div className="w-40">
              <Label htmlFor="semaine-select" className="mb-1 block text-xs">Semaine</Label>
              <select 
                id="semaine-select"
                className="w-full border rounded px-3 py-2 text-sm"
                value={semaine}
                onChange={(e) => setSemaine(e.target.value)}
              >
                <option value="semaine-en-cours">Semaine en cours</option>
                <option value="semaine-prochaine">Semaine prochaine</option>
              </select>
            </div>
            
            <div className="w-40">
              <Label htmlFor="secteur-select" className="mb-1 block text-xs">Secteur</Label>
              <select 
                id="secteur-select"
                className="w-full border rounded px-3 py-2 text-sm"
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
          </div>
          
          {/* Interrupteurs */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="semaine-switch" 
                checked={semaineEnCours}
                onCheckedChange={setSemaineEnCours}
              />
              <Label htmlFor="semaine-switch" className="text-sm">Semaine en cours</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="disponibles-switch" 
                checked={disponiblesUniquement}
                onCheckedChange={setDisponiblesUniquement}
              />
              <Label htmlFor="disponibles-switch" className="text-sm">Disponibles</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="tout-afficher-switch" 
                checked={toutAfficher}
                onCheckedChange={setToutAfficher}
              />
              <Label htmlFor="tout-afficher-switch" className="text-sm">Tout afficher</Label>
            </div>
          </div>
        </div>
        
        {/* Recherche et boutons d'action */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Recherche rapide..."
              className="pl-10"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button>Saisie disponibilités</Button>
            <Button variant="outline">Imprimer planning</Button>
          </div>
        </div>
      </div>
      
      {/* Tableau de planning */}
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <div className="mb-2 text-sm font-medium">
          Semaine {numeroSemaine} – {new Date(premierJourSemaine).getDate()} au {new Date(premierJourSemaine.getTime() + 6 * 24 * 60 * 60 * 1000).getDate()} {new Date(premierJourSemaine).toLocaleDateString('fr-FR', { month: 'long' })}
        </div>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left font-medium text-sm text-gray-600 border w-1/8">Candidat / Secteur</th>
              {jours.map((jour) => (
                <th key={jour} className="py-2 px-3 text-left font-medium text-sm text-gray-600 border w-1/8">
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
                    <div className="text-sm px-2 py-0.5 bg-gray-100 rounded-full inline-block w-fit">{entry.secteur}</div>
                  </div>
                </td>
                {entry.jours.map((jour, index) => (
                  <td
                    key={index}
                    className="border p-2 relative"
                  >
                    {jour.statut && (
                      <div className="rounded p-2" style={{ backgroundColor: jour.couleurFond + '40' }}>
                        <div className="font-medium text-sm">{jour.statut}</div>
                        {jour.client && <div className="text-xs">{jour.client}</div>}
                        {jour.creneaux?.map((creneau, idx) => (
                          <div key={idx} className="text-xs">{creneau}</div>
                        ))}
                        <button className="absolute top-1 right-1 text-gray-600 hover:text-gray-900 bg-white rounded-full p-0.5 shadow-sm">
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

export default Planning;
