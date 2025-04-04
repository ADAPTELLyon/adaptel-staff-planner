
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Share2, 
  Search, 
  PenSquare, 
  CalendarDays, 
  AlertTriangle,
  ClipboardList,
  Check
} from "lucide-react";
import { useEffect, useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Types pour les indicateurs
interface Indicateur {
  nom: string;
  valeur: number;
  couleur: string;
  icone: React.ElementType;
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
  
  // Données factices pour les indicateurs avec icônes
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([
    { nom: "En recherche", valeur: 5, couleur: "#ffe599", icone: Search },
    { nom: "Demandées", valeur: 12, couleur: "#cfe2f3", icone: ClipboardList },
    { nom: "Validées", valeur: 7, couleur: "#d9ead3", icone: Check },
    { nom: "Non pourvue", valeur: 0, couleur: "#dd7e6b", icone: AlertTriangle },
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
    
    return { jour, numero, mois, enRecherche: Math.floor(Math.random() * 3) };
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
        { statut: "En recherche", couleurFond: "#ffe599", couleurTexte: "#000000" },
        {},
        { statut: "En recherche", couleurFond: "#ffe599", couleurTexte: "#000000", creneaux: ["09:00-15:00"] },
        {},
        { statut: "Validé", couleurFond: "#d9ead3", couleurTexte: "#000000", candidat: "Martin Dupont", creneaux: ["09:00-15:00"] },
        { statut: "Validé", couleurFond: "#d9ead3", couleurTexte: "#000000", candidat: "Martin Dupont", creneaux: ["09:00-15:00"] },
        {}
      ]
    },
    {
      id: "2",
      clientNom: "Hôtel Bellevue",
      secteur: "Réception",
      statut: "VALIDE",
      jours: [
        { statut: "Validé", couleurFond: "#d9ead3", couleurTexte: "#000000", candidat: "Sophie Laurent", creneaux: ["07:00-15:00"] },
        { statut: "Validé", couleurFond: "#d9ead3", couleurTexte: "#000000", candidat: "Sophie Laurent", creneaux: ["07:00-15:00"] },
        { statut: "Validé", couleurFond: "#d9ead3", couleurTexte: "#000000", candidat: "Sophie Laurent", creneaux: ["07:00-15:00"] },
        { statut: "Validé", couleurFond: "#d9ead3", couleurTexte: "#000000", candidat: "Sophie Laurent", creneaux: ["07:00-15:00"] },
        { statut: "Validé", couleurFond: "#d9ead3", couleurTexte: "#000000", candidat: "Sophie Laurent", creneaux: ["07:00-15:00"] },
        {},
        {}
      ]
    },
    {
      id: "3",
      clientNom: "Boulangerie Artisanale",
      secteur: "Boulangerie",
      statut: "NON_POURVUE",
      jours: [
        {},
        { statut: "Non pourvue", couleurFond: "#dd7e6b", couleurTexte: "#ffffff", creneaux: ["04:00-12:00"] },
        { statut: "Non pourvue", couleurFond: "#dd7e6b", couleurTexte: "#ffffff", creneaux: ["04:00-12:00"] },
        { statut: "Non pourvue", couleurFond: "#dd7e6b", couleurTexte: "#ffffff", creneaux: ["04:00-12:00"] },
        {},
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
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Section des indicateurs et filtres */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
        {/* Indicateurs */}
        <div className="flex flex-wrap justify-start gap-4 mb-6">
          {indicateurs.map((indicateur) => {
            const Icon = indicateur.icone;
            return (
              <Card
                key={indicateur.nom}
                className="p-3 flex items-center gap-3 w-[160px] shadow-sm"
                style={{ backgroundColor: `${indicateur.couleur}30` }}
              >
                <div className="p-2 rounded-full" style={{ backgroundColor: indicateur.couleur }}>
                  <Icon className="h-4 w-4 text-gray-700" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-600">{indicateur.nom}</div>
                  <div className="text-xl font-bold">{indicateur.valeur}</div>
                </div>
              </Card>
            );
          })}
        </div>
        
        {/* Barre de progression */}
        <div className="mb-6 max-w-xl">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-600">Progression</span>
            <span className="font-medium">{progression.toFixed(0)}%</span>
          </div>
          <Progress value={progression} className="h-2.5" />
        </div>
        
        {/* Filtres et interrupteurs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="semaine-select" className="mb-1 block text-xs">Semaine</Label>
                <select 
                  id="semaine-select"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={semaine}
                  onChange={(e) => setSemaine(e.target.value)}
                >
                  <option value="semaine-en-cours">Semaine en cours</option>
                  <option value="semaine-prochaine">Semaine prochaine</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="secteur-select" className="mb-1 block text-xs">Secteur</Label>
                <select 
                  id="secteur-select"
                  className="w-full border rounded-md px-3 py-2 text-sm"
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
              
              <div>
                <Label htmlFor="client-select" className="mb-1 block text-xs">Client</Label>
                <select 
                  id="client-select"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                >
                  <option value="tous">Tous les clients</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="semaine-switch" 
                  checked={semaineEnCours}
                  onCheckedChange={setSemaineEnCours}
                  className="data-[state=checked]:bg-[#840404]"
                />
                <Label htmlFor="semaine-switch" className="text-sm">Semaine en cours</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="recherche-switch" 
                  checked={enRechercheUniquement}
                  onCheckedChange={setEnRechercheUniquement}
                  className="data-[state=checked]:bg-[#840404]"
                />
                <Label htmlFor="recherche-switch" className="text-sm">En recherche</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="tout-afficher-switch" 
                  checked={toutAfficher}
                  onCheckedChange={setToutAfficher}
                  className="data-[state=checked]:bg-[#840404]"
                />
                <Label htmlFor="tout-afficher-switch" className="text-sm">Tout afficher</Label>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 flex flex-col md:flex-row justify-between gap-4">
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
              <Button className="bg-[#840404] hover:bg-[#6e0303]">
                <Plus className="h-4 w-4" />
                Nouvelle commande
              </Button>
              <Button variant="outline" className="gap-2">
                <CalendarDays className="h-4 w-4" />
                Saisie disponibilités
              </Button>
              <Button variant="outline" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                Saisie incident
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tableau de commandes */}
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <div className="mb-4 text-sm font-medium">
          Semaine {numeroSemaine} – {new Date(premierJourSemaine).getDate()} au {new Date(premierJourSemaine.getTime() + 6 * 24 * 60 * 60 * 1000).getDate()} {new Date(premierJourSemaine).toLocaleDateString('fr-FR', { month: 'long' })}
        </div>
        
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-1/5 font-medium text-sm text-gray-600 border py-3">Client / Secteur</TableHead>
              {jours.map((jour, idx) => (
                <TableHead key={idx} className="w-1/9 font-medium text-sm text-gray-600 border py-3 text-center">
                  <div>{jour.jour} {jour.numero} {jour.mois}</div>
                  {jour.enRecherche > 0 && (
                    <Badge className="mt-1 bg-[#ffe599] text-gray-700 hover:bg-[#ffe599]">
                      {jour.enRecherche} en recherche
                    </Badge>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {commandes.map((commande) => (
              <TableRow key={commande.id} className="hover:bg-gray-50">
                <TableCell className="border p-3 align-top">
                  <div className="flex flex-col gap-2">
                    <div className="font-medium">{commande.clientNom}</div>
                    <Badge className="w-fit bg-gray-100 text-gray-700 hover:bg-gray-200">{commande.secteur}</Badge>
                    <div className="flex space-x-1 mt-2">
                      <button className="p-1 rounded-md hover:bg-gray-100" title="Modifier">
                        <Edit size={16} className="text-gray-500" />
                      </button>
                      <button className="p-1 rounded-md hover:bg-gray-100" title="Partager">
                        <Share2 size={16} className="text-gray-500" />
                      </button>
                      <div className="ml-2 w-3 h-3 rounded-full bg-gray-300 self-center" title="Non envoyé"></div>
                    </div>
                  </div>
                </TableCell>
                
                {commande.jours.map((jour, index) => (
                  <TableCell
                    key={index}
                    className="border p-3 align-top min-w-[120px] h-24 relative"
                  >
                    {jour.statut && (
                      <div className="rounded-md p-3 h-full" style={{ backgroundColor: jour.couleurFond + '15' }}>
                        <div className="rounded-md px-2 py-1 text-xs mb-1 inline-block" style={{ backgroundColor: jour.couleurFond, color: jour.couleurTexte }}>
                          {jour.statut}
                        </div>
                        {jour.candidat && <div className="text-sm font-medium">{jour.candidat}</div>}
                        {jour.creneaux?.map((creneau, idx) => (
                          <div key={idx} className="text-xs text-gray-600">{creneau}</div>
                        ))}
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 bg-white rounded-full p-0.5 shadow-sm">
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Commandes;
