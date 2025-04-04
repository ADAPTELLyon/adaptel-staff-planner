
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Share2, 
  Search, 
  CalendarDays, 
  AlertTriangle,
  ClipboardList,
  Check,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { 
  calculateIndicators, 
  fetchCommandesForWeek, 
  getCurrentWeekNumber, 
  getCurrentYear, 
  generateWeekDates,
  CommandeJour
} from "../services/commandesService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

// Interface for the Commande object with jours
interface CommandeWithJours {
  id: string;
  client_id: string | null;
  client_nom: string;
  secteur: string | null;
  statut: string;
  semaine: number;
  annee: number;
  jours: CommandeJour[];
}

// Interface for indicators
interface Indicateur {
  nom: string;
  valeur: number;
  couleur: string;
  icone: React.ElementType;
}

const Commandes = () => {
  // State variables
  const [semaine, setSemaine] = useState("semaine-en-cours");
  const [secteur, setSecteur] = useState("tous");
  const [client, setClient] = useState("tous");
  const [semaineEnCours, setSemaineEnCours] = useState(true);
  const [enRechercheUniquement, setEnRechercheUniquement] = useState(false);
  const [toutAfficher, setToutAfficher] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [commandes, setCommandes] = useState<CommandeWithJours[]>([]);
  const [loading, setLoading] = useState(true);
  const [progression, setProgression] = useState(0);
  const [clients, setClients] = useState<{id: string, nom: string}[]>([]);
  const [secteurs, setSecteurs] = useState<string[]>([]);
  const [weekNumber, setWeekNumber] = useState(getCurrentWeekNumber());
  const [year, setYear] = useState(getCurrentYear());
  const [jours, setJours] = useState<any[]>([]);
  const [indicateurs, setIndicateurs] = useState<Indicateur[]>([
    { nom: "En recherche", valeur: 0, couleur: "#ffe599", icone: Search },
    { nom: "Demandées", valeur: 0, couleur: "#cfe2f3", icone: ClipboardList },
    { nom: "Validées", valeur: 0, couleur: "#d9ead3", icone: Check },
    { nom: "Non pourvue", valeur: 0, couleur: "#dd7e6b", icone: AlertTriangle },
  ]);
  
  // Fetch clients for dropdown
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, nom");
        
      if (error) throw error;
      setClients(data || []);
      
      // Extract unique sectors
      const { data: clientsWithSectors } = await supabase
        .from("clients")
        .select("secteur");
        
      if (clientsWithSectors) {
        const uniqueSectors = Array.from(new Set(
          clientsWithSectors
            .map(client => client.secteur)
            .filter(sector => sector !== null)
        ));
        setSecteurs(uniqueSectors as string[]);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Erreur lors du chargement des clients");
    }
  };

  // Load commandes data
  const loadCommandes = async () => {
    setLoading(true);
    try {
      const commandesWithJours = await fetchCommandesForWeek(weekNumber, year);
      setCommandes(commandesWithJours);
      
      // Calculate indicators
      const calculatedIndicators = calculateIndicators(commandesWithJours);
      setIndicateurs([
        { ...indicateurs[0], valeur: calculatedIndicators[0].valeur, icone: Search },
        { ...indicateurs[1], valeur: calculatedIndicators[1].valeur, icone: ClipboardList },
        { ...indicateurs[2], valeur: calculatedIndicators[2].valeur, icone: Check },
        { ...indicateurs[3], valeur: calculatedIndicators[3].valeur, icone: AlertTriangle },
      ]);
      
      // Generate week dates and count "En recherche" status
      const weekDates = generateWeekDates(weekNumber, year);
      
      // Count "En recherche" statuses for each day
      commandesWithJours.forEach(commande => {
        if (commande.jours) {
          commande.jours.forEach(jour => {
            if (jour.statut === "En recherche") {
              const jourIndex = jour.jour_semaine - 1; // 1-indexed to 0-indexed
              if (jourIndex >= 0 && jourIndex < 7) {
                weekDates[jourIndex].enRecherche++;
              }
            }
          });
        }
      });
      
      setJours(weekDates);
    } catch (error) {
      console.error("Error loading commandes:", error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchClients();
  }, []);
  
  // Load commandes when week/year changes
  useEffect(() => {
    loadCommandes();
  }, [weekNumber, year]);
  
  // Calculate progress
  useEffect(() => {
    const valideesCount = indicateurs.find(i => i.nom === "Validées")?.valeur || 0;
    const demandeesCount = indicateurs.find(i => i.nom === "Demandées")?.valeur || 0;
    
    if (demandeesCount > 0) {
      setProgression((valideesCount / demandeesCount) * 100);
    } else {
      setProgression(0);
    }
  }, [indicateurs]);
  
  // Filter commandes
  const commandesFiltrees = commandes.filter(commande => {
    // Text search filter
    const matchesSearch = recherche === "" || 
      commande.client_nom.toLowerCase().includes(recherche.toLowerCase()) ||
      commande.secteur?.toLowerCase().includes(recherche.toLowerCase()) || 
      false;
    
    // Sector filter
    const matchesSector = secteur === "tous" || commande.secteur === secteur;
    
    // Client filter
    const matchesClient = client === "tous" || commande.client_id === client;
    
    // "En recherche" filter
    const matchesRecherche = !enRechercheUniquement || 
      (commande.jours && commande.jours.some(jour => jour.statut === "En recherche"));
    
    return matchesSearch && matchesSector && matchesClient && matchesRecherche;
  });

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
                  onChange={(e) => {
                    setSemaine(e.target.value);
                    if (e.target.value === "semaine-en-cours") {
                      setWeekNumber(getCurrentWeekNumber());
                      setYear(getCurrentYear());
                    } else if (e.target.value === "semaine-prochaine") {
                      const nextWeek = getCurrentWeekNumber() + 1;
                      setWeekNumber(nextWeek > 52 ? 1 : nextWeek);
                      setYear(nextWeek > 52 ? getCurrentYear() + 1 : getCurrentYear());
                    }
                  }}
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
                  {secteurs.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
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
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="semaine-switch" 
                  checked={semaineEnCours}
                  onCheckedChange={(checked) => {
                    setSemaineEnCours(checked);
                    if (checked) {
                      setSemaine("semaine-en-cours");
                      setWeekNumber(getCurrentWeekNumber());
                      setYear(getCurrentYear());
                    }
                  }}
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
                <Plus className="h-4 w-4 mr-1" />
                Nouvelle commande
              </Button>
              <Button variant="outline" className="gap-1">
                <CalendarDays className="h-4 w-4" />
                Saisie disponibilités
              </Button>
              <Button variant="outline" className="gap-1">
                <AlertTriangle className="h-4 w-4" />
                Saisie incident
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tableau de commandes */}
      <div className="bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Chargement des commandes...</span>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm font-medium">
              Semaine {weekNumber} – {jours.length > 0 && `${jours[0].numero} au ${jours[6].numero} ${jours[0].mois}`}
            </div>
            
            <Table className="border-collapse">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-1/5 font-medium text-sm text-gray-600 border py-3">Client / Secteur</TableHead>
                  {jours.map((jour, idx) => (
                    <TableHead key={idx} className="w-1/9 font-medium text-sm text-gray-600 border py-3 text-center">
                      <div>{jour.jourNom} {jour.numero} {jour.mois}</div>
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
                {commandesFiltrees.length > 0 ? (
                  commandesFiltrees.map((commande) => (
                    <TableRow key={commande.id} className="hover:bg-gray-50">
                      <TableCell className="border p-3 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="font-medium">{commande.client_nom}</div>
                          {commande.secteur && (
                            <Badge className="w-fit bg-gray-100 text-gray-700 hover:bg-gray-200">{commande.secteur}</Badge>
                          )}
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
                      
                      {Array.from({ length: 7 }).map((_, jourIdx) => {
                        // Find the corresponding jour in the commande.jours array
                        const jour = commande.jours?.find(j => j.jour_semaine === jourIdx + 1);
                        
                        return (
                          <TableCell
                            key={jourIdx}
                            className="border p-3 align-top min-w-[120px] h-24 relative"
                          >
                            {jour && jour.statut && (
                              <div className="rounded-md p-3 h-full" style={{ backgroundColor: jour.couleur_fond + '15' }}>
                                <div className="rounded-md px-2 py-1 text-xs mb-1 inline-block" style={{ backgroundColor: jour.couleur_fond, color: jour.couleur_texte }}>
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
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                      Aucune commande pour cette semaine.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </div>
  );
};

export default Commandes;
