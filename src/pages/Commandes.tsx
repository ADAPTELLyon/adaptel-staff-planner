
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Share2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

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
            <span>Progression</span>
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
            
            <div className="w-40">
              <Label htmlFor="client-select" className="mb-1 block text-xs">Client</Label>
              <select 
                id="client-select"
                className="w-full border rounded px-3 py-2 text-sm"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              >
                <option value="tous">Tous les clients</option>
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
                id="recherche-switch" 
                checked={enRechercheUniquement}
                onCheckedChange={setEnRechercheUniquement}
              />
              <Label htmlFor="recherche-switch" className="text-sm">En recherche</Label>
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
        
        {/* Boutons d'action et recherche */}
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
            <Button>
              <Plus className="mr-1" size={16} />
              Nouvelle commande
            </Button>
            <Button variant="outline">Saisie disponibilités</Button>
            <Button variant="outline">Saisie incident</Button>
          </div>
        </div>
      </div>
      
      {/* Tableau de commandes */}
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <div className="mb-2 text-sm font-medium">
          Semaine {numeroSemaine} – {new Date(premierJourSemaine).getDate()} au {new Date(premierJourSemaine.getTime() + 6 * 24 * 60 * 60 * 1000).getDate()} {new Date(premierJourSemaine).toLocaleDateString('fr-FR', { month: 'long' })}
        </div>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left font-medium text-sm text-gray-600 border w-1/8">Client / Secteur</th>
              {jours.map((jour) => (
                <th key={jour} className="py-2 px-3 text-left font-medium text-sm text-gray-600 border w-1/8">
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
                    <div className="text-sm px-2 py-0.5 bg-gray-100 rounded-full inline-block w-fit">{commande.secteur}</div>
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
                    className="border p-2 relative"
                  >
                    {jour.statut && (
                      <div className="rounded p-2" style={{ backgroundColor: jour.couleurFond + '40' }}>
                        <div className="font-medium text-sm">{jour.statut}</div>
                        {jour.candidat && <div className="text-sm">{jour.candidat}</div>}
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

export default Commandes;
