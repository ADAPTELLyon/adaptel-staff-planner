
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Search, Plus, FileText, Bell, AlertTriangle, ClipboardList, Check, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CommandeForm from "@/components/commandes/CommandeForm";
import { 
  Commande, 
  CommandeJour, 
  fetchCommandesForWeek, 
  calculateIndicators, 
  SECTEURS
} from "@/services/commandesService";

import {
  getCurrentWeekNumber,
  getCurrentYear,
  generateWeekDates
} from "@/utils/dateUtils";

const Commandes = () => {
  const [commandes, setCommandes] = useState<any[]>([]);
  const [filteredCommandes, setFilteredCommandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [progression, setProgression] = useState(0);
  
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeekNumber());
  const [currentYear, setCurrentYear] = useState(getCurrentYear());
  const [recherche, setRecherche] = useState("");
  const [secteur, setSecteur] = useState("tous");
  const [client, setClient] = useState("tous");
  const [clients, setClients] = useState<{id: string, nom: string}[]>([]);
  
  // Filters
  const [semaineEnCours, setSemaineEnCours] = useState(true);
  const [enRecherche, setEnRecherche] = useState(false);
  const [toutAfficher, setToutAfficher] = useState(true);
  
  // Week dates
  const [weekDates, setWeekDates] = useState<any[]>([]);
  
  // New commande form dialog
  const [newCommandeDialogOpen, setNewCommandeDialogOpen] = useState(false);
  
  // Mission edit dialog
  const [missionEditOpen, setMissionEditOpen] = useState(false);
  const [currentMission, setCurrentMission] = useState<any>(null);

  // Fetch commandes
  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const data = await fetchCommandesForWeek(currentWeek, currentYear);
      setCommandes(data);
      setFilteredCommandes(data);
      
      // Calculate indicators
      const indicatorsData = calculateIndicators(data);
      setIndicators(indicatorsData);
      
      // Calculate progression
      const planifiees = indicatorsData.find(i => i.nom === "Validées")?.valeur || 0;
      const total = indicatorsData.find(i => i.nom === "En recherche")?.valeur || 0;
      setProgression(total > 0 ? (planifiees / total) * 100 : 0);
      
      // Generate week dates
      const dates = generateWeekDates(currentWeek, currentYear);
      
      // Count "En recherche" items for each day
      data.forEach(commande => {
        commande.jours.forEach((jour: CommandeJour) => {
          if (jour.statut === "En recherche") {
            const jourIndex = jour.jour_semaine - 1;
            if (jourIndex >= 0 && jourIndex < dates.length) {
              dates[jourIndex].enRecherche++;
            }
          }
        });
      });
      
      setWeekDates(dates);
    } catch (error) {
      console.error("Error fetching commandes:", error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients for filter
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...commandes];
    
    // Filter by search term
    if (recherche) {
      filtered = filtered.filter(commande => 
        commande.client_nom.toLowerCase().includes(recherche.toLowerCase()) ||
        commande.secteur?.toLowerCase().includes(recherche.toLowerCase())
      );
    }
    
    // Filter by secteur
    if (secteur !== "tous") {
      filtered = filtered.filter(commande => commande.secteur === secteur);
    }
    
    // Filter by client
    if (client !== "tous") {
      filtered = filtered.filter(commande => commande.client_id === client);
    }
    
    // Filter by enRecherche (only show commandes with days in "En recherche" status)
    if (enRecherche) {
      filtered = filtered.filter(commande => 
        commande.jours.some((jour: CommandeJour) => jour.statut === "En recherche")
      );
    }
    
    // Set filtered result
    setFilteredCommandes(filtered);
  };

  // Load initial data
  useEffect(() => {
    fetchCommandes();
    fetchClients();
  }, [currentWeek, currentYear]);

  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [recherche, secteur, client, enRecherche, commandes]);

  // Get day class based on statut
  const getDayClass = (jour: CommandeJour | undefined) => {
    if (!jour) return "bg-gray-100";
    
    switch (jour.statut) {
      case "En recherche":
        return "bg-[#ffe599]";
      case "Validé":
        return "bg-[#d9ead3]";
      case "Non pourvue":
        return "bg-[#dd7e6b]";
      default:
        return "bg-gray-100";
    }
  };
  
  // Handle mission edit
  const handleMissionEdit = (commande: any, jour: CommandeJour) => {
    setCurrentMission({ commande, jour });
    setMissionEditOpen(true);
  };

  // Handle mission status update
  const handleUpdateMission = async (data: any) => {
    try {
      const { error } = await supabase
        .from('commande_jours')
        .update({
          statut: data.statut,
          candidat: data.candidat,
          creneaux: data.creneaux
        })
        .eq('id', data.id);
        
      if (error) throw error;
      
      toast.success("Mission mise à jour avec succès");
      setMissionEditOpen(false);
      fetchCommandes();
    } catch (error: any) {
      console.error('Error updating mission:', error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Indicators and filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
        {/* Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {indicators.map((indicator) => (
            <Card
              key={indicator.nom}
              className="flex items-center p-3"
              style={{ backgroundColor: indicator.couleur + '40' }}
            >
              <div className="mr-3">
                {indicator.icone === "Search" && <Search className="h-6 w-6 text-gray-600" />}
                {indicator.icone === "ClipboardList" && <ClipboardList className="h-6 w-6 text-gray-600" />}
                {indicator.icone === "Check" && <Check className="h-6 w-6 text-gray-600" />}
                {indicator.icone === "AlertTriangle" && <AlertTriangle className="h-6 w-6 text-gray-600" />}
              </div>
              <div>
                <div className="text-sm font-medium">{indicator.nom}</div>
                <div className="text-2xl font-bold">{indicator.valeur}</div>
              </div>
            </Card>
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1">
            <span>Taux de planification</span>
            <span>{progression.toFixed(0)}%</span>
          </div>
          <Progress value={progression} className="h-2" />
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
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
          
          <div>
            <Label htmlFor="client-select" className="mb-1 block text-xs">Client</Label>
            <Select 
              value={client}
              onValueChange={setClient}
            >
              <SelectTrigger id="client-select">
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les clients</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nom}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="week-select" className="mb-1 block text-xs">Semaine</Label>
            <Select 
              value={currentWeek.toString()}
              onValueChange={(value) => setCurrentWeek(parseInt(value))}
            >
              <SelectTrigger id="week-select">
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
        </div>
        
        {/* Switches */}
        <div className="flex flex-wrap items-center gap-6 mb-6">
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
              checked={enRecherche}
              onCheckedChange={setEnRecherche}
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
        
        {/* Search and buttons */}
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
              className="bg-[#840404] hover:bg-[#6b0303]"
              onClick={() => setNewCommandeDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle commande
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Saisie disponibilités
            </Button>
            <Button variant="outline">
              <Bell className="mr-2 h-4 w-4" />
              Saisie incident
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content / Table */}
      <div className="bg-white rounded-lg shadow overflow-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-sm font-medium text-gray-600 w-1/5 text-center align-middle">
                Semaine {currentWeek}
              </th>
              {weekDates.map((day, index) => (
                <th key={index} className="p-3 text-center text-sm font-medium text-gray-600">
                  <div className="text-center">{day.jourNom} {day.numero} {day.mois}</div>
                  <div className="h-6 mt-1 flex justify-center">
                    {day.enRecherche > 0 && (
                      <Badge className="bg-[#ffe599] text-black font-normal">
                        {day.enRecherche}
                      </Badge>
                    )}
                    {/* Always reserve space even if no badge */}
                    {day.enRecherche === 0 && <div className="h-5"></div>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">Chargement des commandes...</td>
              </tr>
            ) : filteredCommandes.length > 0 ? (
              filteredCommandes.map((commande) => (
                <tr key={commande.id}>
                  <td className="p-3 align-top">
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <div className="font-medium">{commande.client_nom}</div>
                        {commande.secteur && (
                          <Badge variant="outline" className="mt-1 w-fit">
                            {commande.secteur}
                          </Badge>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Semaine {commande.semaine}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="mt-2 p-2 h-auto w-fit"
                        title="Éditer cette commande"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="ml-1">Éditer</span>
                      </Button>
                    </div>
                  </td>
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const jour = commande.jours.find((j: CommandeJour) => j.jour_semaine === dayIndex + 1);
                    return (
                      <td 
                        key={dayIndex} 
                        className="p-2 align-top relative h-24"
                      >
                        {jour && (
                          <div 
                            className={`${getDayClass(jour)} p-2 absolute top-2 right-2 bottom-2 left-2 rounded cursor-pointer`}
                            onClick={() => handleMissionEdit(commande, jour)}
                          >
                            <div className="relative h-full flex flex-col">
                              {/* Status at the top */}
                              <div className="text-sm font-medium mb-2">
                                {jour.statut}
                              </div>
                              
                              {/* Times */}
                              <div className="space-y-2 text-xs flex-grow">
                                {jour.creneaux && jour.creneaux.length > 0 && (
                                  <div className="grid grid-cols-2 gap-1">
                                    {jour.creneaux[0]?.split('-').map((time, idx) => (
                                      <div key={idx} className="font-mono">{time.trim()}</div>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Second timeframe or empty space */}
                                <div className="grid grid-cols-2 gap-1 h-4">
                                  {jour.creneaux && jour.creneaux.length > 1 && jour.creneaux[1]?.split('-').map((time, idx) => (
                                    <div key={idx} className="font-mono">{time.trim()}</div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Candidate name if assigned */}
                              {jour.candidat && (
                                <div className="text-sm mt-2 font-medium line-clamp-2">
                                  {jour.candidat}
                                </div>
                              )}
                              
                              {/* Edit button */}
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="absolute top-0 right-0 h-6 w-6 p-0 bg-white shadow-sm"
                                title="Planifier un candidat"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMissionEdit(commande, jour);
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-4 text-center">Aucune commande trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* New Commande Dialog */}
      <Dialog open={newCommandeDialogOpen} onOpenChange={setNewCommandeDialogOpen}>
        <DialogContent className="max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Nouvelle commande</DialogTitle>
          </DialogHeader>
          <CommandeForm onClose={() => {
            setNewCommandeDialogOpen(false);
            fetchCommandes(); // Refresh commandes after adding a new one
          }} />
        </DialogContent>
      </Dialog>
      
      {/* Mission Edit Dialog */}
      {currentMission && (
        <Dialog open={missionEditOpen} onOpenChange={setMissionEditOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier la mission</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="mission-status">Statut</Label>
                <Select 
                  defaultValue={currentMission.jour.statut || "En recherche"}
                  onValueChange={(value) => {
                    setCurrentMission({
                      ...currentMission,
                      jour: {
                        ...currentMission.jour,
                        statut: value
                      }
                    });
                  }}
                >
                  <SelectTrigger id="mission-status">
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="En recherche">En recherche</SelectItem>
                    <SelectItem value="Validé">Validé</SelectItem>
                    <SelectItem value="Non pourvue">Non pourvue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="candidat">Candidat</Label>
                <Input 
                  id="candidat"
                  value={currentMission.jour.candidat || ""}
                  onChange={(e) => {
                    setCurrentMission({
                      ...currentMission,
                      jour: {
                        ...currentMission.jour,
                        candidat: e.target.value
                      }
                    });
                  }}
                  placeholder="Nom du candidat"
                />
              </div>
              
              <div>
                <Label>Créneau matin</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Début</Label>
                    <Input 
                      type="time" 
                      defaultValue={currentMission.jour.creneaux && currentMission.jour.creneaux[0] ? 
                        currentMission.jour.creneaux[0].split('-')[0].trim() : 
                        "09:00"}
                      onChange={(e) => {
                        const creneaux = [...(currentMission.jour.creneaux || [])];
                        if (!creneaux[0]) creneaux[0] = "09:00-17:00";
                        const [_, fin] = creneaux[0].split('-');
                        creneaux[0] = `${e.target.value}-${fin}`;
                        
                        setCurrentMission({
                          ...currentMission,
                          jour: {
                            ...currentMission.jour,
                            creneaux
                          }
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fin</Label>
                    <Input 
                      type="time" 
                      defaultValue={currentMission.jour.creneaux && currentMission.jour.creneaux[0] ? 
                        currentMission.jour.creneaux[0].split('-')[1].trim() : 
                        "17:00"}
                      onChange={(e) => {
                        const creneaux = [...(currentMission.jour.creneaux || [])];
                        if (!creneaux[0]) creneaux[0] = "09:00-17:00";
                        const [debut, _] = creneaux[0].split('-');
                        creneaux[0] = `${debut}-${e.target.value}`;
                        
                        setCurrentMission({
                          ...currentMission,
                          jour: {
                            ...currentMission.jour,
                            creneaux
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Créneau soir</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Début</Label>
                    <Input 
                      type="time" 
                      defaultValue={currentMission.jour.creneaux && currentMission.jour.creneaux[1] ? 
                        currentMission.jour.creneaux[1].split('-')[0].trim() : 
                        ""}
                      onChange={(e) => {
                        const creneaux = [...(currentMission.jour.creneaux || [])];
                        if (!creneaux[1]) creneaux[1] = `${e.target.value}-23:00`;
                        else {
                          const [_, fin] = creneaux[1].split('-');
                          creneaux[1] = `${e.target.value}-${fin}`;
                        }
                        
                        setCurrentMission({
                          ...currentMission,
                          jour: {
                            ...currentMission.jour,
                            creneaux
                          }
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fin</Label>
                    <Input 
                      type="time" 
                      defaultValue={currentMission.jour.creneaux && currentMission.jour.creneaux[1] ? 
                        currentMission.jour.creneaux[1].split('-')[1].trim() : 
                        ""} 
                      onChange={(e) => {
                        const creneaux = [...(currentMission.jour.creneaux || [])];
                        if (!creneaux[1]) creneaux[1] = `18:00-${e.target.value}`;
                        else {
                          const [debut, _] = creneaux[1].split('-');
                          creneaux[1] = `${debut}-${e.target.value}`;
                        }
                        
                        setCurrentMission({
                          ...currentMission,
                          jour: {
                            ...currentMission.jour,
                            creneaux
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setMissionEditOpen(false)}>
                  Annuler
                </Button>
                <Button className="bg-[#840404] hover:bg-[#6b0303]" onClick={() => {
                  handleUpdateMission({
                    id: currentMission.jour.id,
                    statut: currentMission.jour.statut,
                    candidat: currentMission.jour.candidat,
                    creneaux: currentMission.jour.creneaux
                  });
                }}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Commandes;
