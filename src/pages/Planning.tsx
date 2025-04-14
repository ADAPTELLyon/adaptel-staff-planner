
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DisponibiliteForm from "@/components/planning/DisponibiliteForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SECTEURS, generateWeekDates, getCurrentWeekNumber, getCurrentYear } from "@/services/commandesService";

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
  const [semaine, setSemaine] = useState(getCurrentWeekNumber().toString());
  const [annee] = useState(getCurrentYear());
  const [secteur, setSecteur] = useState("tous");
  const [candidatFilter, setCandidatFilter] = useState("tous");
  const [recherche, setRecherche] = useState("");
  const [semaineEnCours, setSemaineEnCours] = useState(true);
  const [disponiblesUniquement, setDisponiblesUniquement] = useState(false);
  const [toutAfficher, setToutAfficher] = useState(false);
  const [dispoFormDialogOpen, setDispoFormDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [candidats, setCandidats] = useState<{id: string, nom: string, prenom: string}[]>([]);
  
  // Données factices pour les indicateurs
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([
    { nom: "Disponibles", valeur: 18, couleur: "#B8E0F2" },
    { nom: "Planifiés", valeur: 7, couleur: "#C1EAC5" },
    { nom: "Non disponibles", valeur: 5, couleur: "#A6A6A6" },
    { nom: "Non renseignés", valeur: 3, couleur: "#D9D9D9" },
  ]);

  // Week dates
  const [weekDates, setWeekDates] = useState<any[]>([]);
  
  // For data
  const [planningData, setPlanningData] = useState<PlanningEntry[]>([]);

  // For the barre de progression
  const [progression, setProgression] = useState(0);
  
  // Fetch candidats
  const fetchCandidats = async () => {
    try {
      const { data, error } = await supabase
        .from('candidats')
        .select('id, nom, prenom')
        .eq('actif', true);
      
      if (error) throw error;
      setCandidats(data || []);
    } catch (error) {
      console.error('Error fetching candidats:', error);
      toast.error("Erreur lors du chargement des candidats");
    }
  };

  // For now, load sample data (this would be connected to Supabase in a real implementation)
  const loadPlanningData = async () => {
    setLoading(true);
    try {
      // Generate week dates
      const weekNum = parseInt(semaine);
      const dates = generateWeekDates(weekNum, annee);
      setWeekDates(dates);
      
      // In a real implementation, fetch planning data from Supabase
      // For now, using sample data
      setPlanningData([
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
    } catch (error) {
      console.error('Error loading planning data:', error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadPlanningData();
    fetchCandidats();
  }, [semaine, secteur]);
  
  useEffect(() => {
    const planifiesCount = indicateurs.find(i => i.nom === "Planifiés")?.valeur || 0;
    const disposCount = indicateurs.find(i => i.nom === "Disponibles")?.valeur || 0;
    
    if (disposCount > 0) {
      setProgression((planifiesCount / disposCount) * 100);
    } else {
      setProgression(0);
    }
  }, [indicateurs]);
  
  // Apply filters
  const filteredPlanningData = planningData.filter(entry => {
    // Filter by secteur
    if (secteur !== "tous" && entry.secteur !== secteur) return false;
    
    // Filter by candidat
    if (candidatFilter !== "tous" && entry.id !== candidatFilter) return false;
    
    // Filter by search term
    if (recherche && !entry.candidatNom.toLowerCase().includes(recherche.toLowerCase())) return false;
    
    // Filter by disponibles only
    if (disponiblesUniquement && !entry.jours.some(j => j.statut === "Dispo")) return false;
    
    return true;
  });

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
              <Select 
                value={semaine}
                onValueChange={setSemaine}
              >
                <SelectTrigger id="semaine-select">
                  <SelectValue placeholder="Sélectionner une semaine" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const weekNum = getCurrentWeekNumber() + i - 2;
                    return (
                      <SelectItem key={weekNum} value={weekNum.toString()}>
                        Semaine {weekNum}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Label htmlFor="secteur-select" className="mb-1 block text-xs">Secteur</Label>
              <Select 
                value={secteur}
                onValueChange={setSecteur}
              >
                <SelectTrigger id="secteur-select">
                  <SelectValue placeholder="Tous les secteurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les secteurs</SelectItem>
                  {SECTEURS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-40">
              <Label htmlFor="candidat-select" className="mb-1 block text-xs">Candidat</Label>
              <Select 
                value={candidatFilter}
                onValueChange={setCandidatFilter}
              >
                <SelectTrigger id="candidat-select">
                  <SelectValue placeholder="Tous les candidats" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les candidats</SelectItem>
                  {candidats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {`${c.prenom} ${c.nom}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button 
              onClick={() => setDispoFormDialogOpen(true)}
            >
              Saisie disponibilités
            </Button>
            <Button variant="outline">Imprimer planning</Button>
          </div>
        </div>
      </div>
      
      {/* Tableau de planning */}
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        <div className="mb-2 text-sm font-medium">
          Semaine {semaine} – {weekDates[0]?.numero} au {weekDates[6]?.numero} {weekDates[0]?.mois}
        </div>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3 text-left font-medium text-sm text-gray-600 border w-1/8">Candidat / Secteur</th>
              {weekDates.map((jour) => (
                <th key={jour.jour} className="py-2 px-3 text-left font-medium text-sm text-gray-600 border w-1/8">
                  {jour.jourNom} {jour.numero} {jour.mois}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-3 text-center">Chargement du planning...</td>
              </tr>
            ) : filteredPlanningData.length > 0 ? (
              filteredPlanningData.map((entry) => (
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
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-3 text-center">Aucune donnée disponible</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Disponibilité Form Dialog */}
      <Dialog open={dispoFormDialogOpen} onOpenChange={setDispoFormDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Saisie des disponibilités</DialogTitle>
          </DialogHeader>
          <DisponibiliteForm onClose={() => {
            setDispoFormDialogOpen(false);
            loadPlanningData(); // Refresh data after updating disponibilities
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planning;
