
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { getCurrentWeekNumber, getCurrentYear, generateWeekDates, formatDateToISOString, generateWeekOptions } from "@/utils/dateUtils";
import { SECTEURS } from "@/services/commandesService";

interface CommandeFormProps {
  onClose: () => void;
}

interface CommandeFormData {
  secteur: string;
  client_id: string;
  client_nom: string;
  semaine: number;
  annee: number;
  motif: string;
  raison_remplacement?: string;
  personne_remplacee?: string;
  raison_accroissement?: string;
  commentaire?: string;
  jours: {
    jour_semaine: number;
    jour_date: string;
    statut: string;
    creneaux: string[];
    couleur_fond: string;
    couleur_texte: string;
    personnes: number;
  }[];
}

const CommandeForm: React.FC<CommandeFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<CommandeFormData>({
    secteur: "",
    client_id: "",
    client_nom: "",
    semaine: getCurrentWeekNumber(),
    annee: getCurrentYear(),
    motif: "Extra usage constant",
    commentaire: "",
    jours: [],
  });
  
  const [clients, setClients] = useState<{ id: string; nom: string; secteur: string }[]>([]);
  const [filteredClients, setFilteredClients] = useState<{ id: string; nom: string }[]>([]);
  const [weekDates, setWeekDates] = useState<any[]>([]);
  const [weekOptions, setWeekOptions] = useState<{ value: string; label: string }[]>([]);
  const [activatedDays, setActivatedDays] = useState<{[key: number]: boolean}>({});
  const [dayCreneaux, setDayCreneaux] = useState<{
    [day: number]: {
      matin: boolean;
      soir: boolean;
      nuit: boolean;
      matinHeures: { debut: string; fin: string; personnes: number };
      soirHeures: { debut: string; fin: string; personnes: number };
      nuitHeures: { debut: string; fin: string; personnes: number };
    }
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize week dates
  useEffect(() => {
    const dates = generateWeekDates(formData.semaine, formData.annee);
    setWeekDates(dates);
    
    // Initialize week options
    const options = generateWeekOptions(formData.annee);
    setWeekOptions(options);
    
    // Initialize day creneaux structure
    const initialDayCreneaux: {[key: number]: any} = {};
    dates.forEach(date => {
      initialDayCreneaux[date.jour] = {
        matin: false,
        soir: false,
        nuit: false,
        matinHeures: { debut: "08:00", fin: "14:00", personnes: 1 },
        soirHeures: { debut: "18:00", fin: "23:00", personnes: 1 },
        nuitHeures: { debut: "22:00", fin: "06:00", personnes: 1 },
      };
    });
    setDayCreneaux(initialDayCreneaux);
  }, [formData.semaine, formData.annee]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, nom, secteur");

        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        toast({
          title: "Erreur!",
          description: "Impossible de charger la liste des clients.",
        });
      }
    };

    fetchClients();
  }, []);

  // Filter clients when sector changes
  useEffect(() => {
    if (formData.secteur) {
      const filtered = clients.filter(client => client.secteur === formData.secteur);
      setFilteredClients(filtered);
      
      // Reset client selection if current selection doesn't match the sector
      if (formData.client_id) {
        const clientExists = filtered.some(client => client.id === formData.client_id);
        if (!clientExists) {
          setFormData(prev => ({
            ...prev,
            client_id: "",
            client_nom: ""
          }));
        }
      }
    } else {
      setFilteredClients([]);
    }
  }, [formData.secteur, clients]);

  // Handle sector selection
  const handleSectorChange = (sector: string) => {
    setFormData({
      ...formData,
      secteur: sector,
      client_id: "",
      client_nom: ""
    });
  };

  // Handle client selection
  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    setFormData({
      ...formData,
      client_id: clientId,
      client_nom: selectedClient ? selectedClient.nom : ""
    });
  };

  // Handle week selection
  const handleWeekChange = (weekNum: string) => {
    setFormData({
      ...formData,
      semaine: parseInt(weekNum)
    });
  };

  // Toggle day activation
  const toggleDay = (dayNumber: number) => {
    setActivatedDays(prev => ({
      ...prev,
      [dayNumber]: !prev[dayNumber]
    }));
  };

  // Toggle specific creneau for a day
  const toggleCreneau = (dayNumber: number, creneauType: 'matin' | 'soir' | 'nuit') => {
    setDayCreneaux(prev => ({
      ...prev,
      [dayNumber]: {
        ...prev[dayNumber],
        [creneauType]: !prev[dayNumber][creneauType]
      }
    }));
  };

  // Update hours for a creneau
  const updateCreneauHours = (
    dayNumber: number, 
    creneauType: 'matinHeures' | 'soirHeures' | 'nuitHeures',
    field: 'debut' | 'fin' | 'personnes',
    value: string | number
  ) => {
    setDayCreneaux(prev => ({
      ...prev,
      [dayNumber]: {
        ...prev[dayNumber],
        [creneauType]: {
          ...prev[dayNumber][creneauType],
          [field]: value
        }
      }
    }));
  };

  // Activate all days
  const activateAllDays = () => {
    const newActivatedDays: {[key: number]: boolean} = {};
    weekDates.forEach(date => {
      newActivatedDays[date.jour] = true;
    });
    setActivatedDays(newActivatedDays);
  };

  // Deactivate all days
  const deactivateAllDays = () => {
    setActivatedDays({});
  };

  // Replicate hours to all activated days
  const replicateHours = () => {
    // Find the first activated day to use as template
    const firstActivatedDayNumber = Object.keys(activatedDays)
      .find(key => activatedDays[parseInt(key)]) || "1";
    
    const firstDay = parseInt(firstActivatedDayNumber);
    const template = dayCreneaux[firstDay];
    
    if (!template) return;
    
    const newDayCreneaux = {...dayCreneaux};
    
    Object.keys(activatedDays).forEach(key => {
      const day = parseInt(key);
      if (activatedDays[day] && day !== firstDay) {
        newDayCreneaux[day] = {...template};
      }
    });
    
    setDayCreneaux(newDayCreneaux);
  };

  // Prepare commande data for submission
  const prepareCommandeData = () => {
    const joursData = [];
    
    // For each activated day
    for (const [dayNumberStr, isActive] of Object.entries(activatedDays)) {
      if (!isActive) continue;
      
      const dayNumber = parseInt(dayNumberStr);
      const day = weekDates.find(d => d.jour === dayNumber);
      
      if (!day) continue;
      
      const dayCreneau = dayCreneaux[dayNumber];
      const creneauxList = [];
      
      // Add active creneaux
      if (dayCreneau.matin) {
        creneauxList.push(`${dayCreneau.matinHeures.debut}-${dayCreneau.matinHeures.fin}`);
      }
      
      if (dayCreneau.soir) {
        creneauxList.push(`${dayCreneau.soirHeures.debut}-${dayCreneau.soirHeures.fin}`);
      }
      
      if (dayCreneau.nuit) {
        creneauxList.push(`${dayCreneau.nuitHeures.debut}-${dayCreneau.nuitHeures.fin}`);
      }
      
      // If no creneaux are selected, skip this day
      if (creneauxList.length === 0) continue;
      
      joursData.push({
        jour_semaine: dayNumber,
        jour_date: formatDateToISOString(day.date),
        statut: "En recherche",
        creneaux: creneauxList,
        couleur_fond: "#ffe599",
        couleur_texte: "#000000",
        personnes: Math.max(
          dayCreneau.matin ? dayCreneau.matinHeures.personnes : 0,
          dayCreneau.soir ? dayCreneau.soirHeures.personnes : 0,
          dayCreneau.nuit ? dayCreneau.nuitHeures.personnes : 0
        )
      });
    }
    
    return {
      ...formData,
      jours: joursData,
      statut: "En recherche"
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.secteur) {
      toast({
        title: "Erreur!",
        description: "Veuillez sélectionner un secteur.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.client_id) {
      toast({
        title: "Erreur!",
        description: "Veuillez sélectionner un client.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.motif) {
      toast({
        title: "Erreur!",
        description: "Veuillez sélectionner un motif.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if any days are activated
    if (Object.values(activatedDays).filter(Boolean).length === 0) {
      toast({
        title: "Erreur!",
        description: "Veuillez activer au moins une journée.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if activated days have at least one creneau
    let hasCreneaux = false;
    for (const [dayNumberStr, isActive] of Object.entries(activatedDays)) {
      if (!isActive) continue;
      
      const dayNumber = parseInt(dayNumberStr);
      const dayCreneau = dayCreneaux[dayNumber];
      
      if (dayCreneau.matin || dayCreneau.soir || dayCreneau.nuit) {
        hasCreneaux = true;
        break;
      }
    }
    
    if (!hasCreneaux) {
      toast({
        title: "Erreur!",
        description: "Veuillez sélectionner au moins un créneau pour les journées activées.",
        variant: "destructive"
      });
      return;
    }
    
    // Start submission
    setIsSubmitting(true);
    const commandeData = prepareCommandeData();
    
    try {
      // Create commande
      const { data: commande, error: commandeError } = await supabase
        .from("commandes")
        .insert([{
          client_nom: commandeData.client_nom,
          client_id: commandeData.client_id,
          secteur: commandeData.secteur,
          statut: commandeData.statut,
          semaine: commandeData.semaine,
          annee: commandeData.annee
        }])
        .select();
      
      if (commandeError) throw commandeError;
      if (!commande || commande.length === 0) throw new Error("Échec de la création de la commande");
      
      // Create commande_jours for each jour
      const commandeId = commande[0].id;
      const jourPromises = commandeData.jours.map(async (jour) => {
        const { error: jourError } = await supabase
          .from("commande_jours")
          .insert([{
            commande_id: commandeId,
            jour_semaine: jour.jour_semaine,
            jour_date: jour.jour_date,
            statut: jour.statut,
            creneaux: jour.creneaux,
            couleur_fond: jour.couleur_fond,
            couleur_texte: jour.couleur_texte
          }]);
          
        if (jourError) throw jourError;
      });
      
      await Promise.all(jourPromises);
      
      toast({
        title: "Succès!",
        description: "Commande créée avec succès."
      });
      
      // Close the dialog and refresh the page
      onClose();
    } catch (error: any) {
      console.error("Error creating commande:", error);
      toast({
        title: "Erreur!",
        description: error.message || "Une erreur est survenue lors de la création de la commande.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if nuit creneau is available (only for Reception)
  const isNuitAvailable = formData.secteur === "Réception";
  
  // Check if only matin is available (for Etages)
  const onlyMatinAvailable = formData.secteur === "Étages";

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
      {/* Left Column - General Information */}
      <div className="space-y-4 p-2">
        <h3 className="text-lg font-medium">Informations générales</h3>
        
        {/* Secteur */}
        <div>
          <Label htmlFor="secteur" className="text-sm font-medium">
            Secteur <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.secteur}
            onValueChange={handleSectorChange}
          >
            <SelectTrigger id="secteur" className="w-full">
              <SelectValue placeholder="Sélectionner un secteur" />
            </SelectTrigger>
            <SelectContent>
              {SECTEURS.map((secteur) => (
                <SelectItem key={secteur} value={secteur}>{secteur}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Client */}
        <div>
          <Label htmlFor="client" className="text-sm font-medium">
            Client <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.client_id}
            onValueChange={handleClientChange}
            disabled={!formData.secteur}
          >
            <SelectTrigger id="client" className="w-full">
              <SelectValue placeholder={formData.secteur ? "Sélectionner un client" : "Veuillez d'abord choisir un secteur"} />
            </SelectTrigger>
            <SelectContent>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>{client.nom}</SelectItem>
                ))
              ) : (
                <SelectItem value="no-clients" disabled>Aucun client disponible pour ce secteur</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        {/* Semaine */}
        <div>
          <Label htmlFor="semaine" className="text-sm font-medium">
            Semaine <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.semaine.toString()}
            onValueChange={handleWeekChange}
          >
            <SelectTrigger id="semaine" className="w-full">
              <SelectValue placeholder="Sélectionner une semaine" />
            </SelectTrigger>
            <SelectContent>
              {weekOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Motif */}
        <div>
          <Label className="text-sm font-medium">
            Motif <span className="text-red-500">*</span>
          </Label>
          <RadioGroup 
            value={formData.motif}
            onValueChange={(value) => setFormData({...formData, motif: value})}
            className="space-y-2 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Extra usage constant" id="motif-extra" />
              <Label htmlFor="motif-extra">Extra usage constant</Label>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Remplacement d'une personne absente" id="motif-remplacement" />
                <Label htmlFor="motif-remplacement">Remplacement d'une personne absente</Label>
              </div>
              
              {formData.motif === "Remplacement d'une personne absente" && (
                <div className="pl-6 space-y-2">
                  <div>
                    <Label htmlFor="personne-remplacee" className="text-sm">Nom & prénom de la personne à remplacer</Label>
                    <Input
                      id="personne-remplacee"
                      value={formData.personne_remplacee || ""}
                      onChange={(e) => setFormData({...formData, personne_remplacee: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="raison-remplacement" className="text-sm">Raison du remplacement</Label>
                    <Textarea
                      id="raison-remplacement"
                      value={formData.raison_remplacement || ""}
                      onChange={(e) => setFormData({...formData, raison_remplacement: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Accroissement d'activité" id="motif-accroissement" />
                <Label htmlFor="motif-accroissement">Accroissement d'activité</Label>
              </div>
              
              {formData.motif === "Accroissement d'activité" && (
                <div className="pl-6">
                  <Label htmlFor="raison-accroissement" className="text-sm">Raison de l'accroissement</Label>
                  <Textarea
                    id="raison-accroissement"
                    value={formData.raison_accroissement || ""}
                    onChange={(e) => setFormData({...formData, raison_accroissement: e.target.value})}
                  />
                </div>
              )}
            </div>
          </RadioGroup>
        </div>
        
        {/* Commentaire */}
        <div>
          <Label htmlFor="commentaire" className="text-sm font-medium flex items-center gap-1">
            Commentaire <Info className="h-4 w-4" title="Si rempli, une icône info sera affichée dans la ligne du planning" />
          </Label>
          <Textarea
            id="commentaire"
            value={formData.commentaire || ""}
            onChange={(e) => setFormData({...formData, commentaire: e.target.value})}
            placeholder="Informations complémentaires..."
          />
        </div>
      </div>
      
      {/* Right Column - Days Management */}
      <div className="space-y-4 p-2 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
        <h3 className="text-lg font-medium">Journées</h3>
        
        {/* Days of the week */}
        <div className="space-y-4">
          {weekDates.map((day) => (
            <div key={day.jour} className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">
                  {day.jourNom} {day.numero} {day.mois}
                </div>
                <div className="flex items-center">
                  <Switch
                    checked={!!activatedDays[day.jour]}
                    onCheckedChange={() => toggleDay(day.jour)}
                  />
                  <Label className="ml-2 text-sm">
                    {activatedDays[day.jour] ? "Activé" : "Désactivé"}
                  </Label>
                </div>
              </div>
              
              {activatedDays[day.jour] && (
                <div className="space-y-3 pl-2 pt-1">
                  {/* Créneau options */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`matin-${day.jour}`}
                        className="mr-1"
                        checked={dayCreneaux[day.jour]?.matin || false}
                        onChange={() => toggleCreneau(day.jour, 'matin')}
                      />
                      <Label htmlFor={`matin-${day.jour}`} className="text-sm">
                        Matin/Midi
                      </Label>
                    </div>
                    
                    {!onlyMatinAvailable && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`soir-${day.jour}`}
                          className="mr-1"
                          checked={dayCreneaux[day.jour]?.soir || false}
                          onChange={() => toggleCreneau(day.jour, 'soir')}
                        />
                        <Label htmlFor={`soir-${day.jour}`} className="text-sm">
                          Soir
                        </Label>
                      </div>
                    )}
                    
                    {isNuitAvailable && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`nuit-${day.jour}`}
                          className="mr-1"
                          checked={dayCreneaux[day.jour]?.nuit || false}
                          onChange={() => toggleCreneau(day.jour, 'nuit')}
                        />
                        <Label htmlFor={`nuit-${day.jour}`} className="text-sm">
                          Nuit
                        </Label>
                      </div>
                    )}
                  </div>
                  
                  {/* Créneau details */}
                  {dayCreneaux[day.jour]?.matin && (
                    <div className="grid grid-cols-3 gap-2 pl-4 border-l-2 border-green-200 p-2">
                      <div>
                        <Label htmlFor={`matin-debut-${day.jour}`} className="text-xs">Début</Label>
                        <Input
                          type="time"
                          id={`matin-debut-${day.jour}`}
                          value={dayCreneaux[day.jour].matinHeures.debut}
                          onChange={(e) => updateCreneauHours(day.jour, 'matinHeures', 'debut', e.target.value)}
                          className="text-sm p-1 h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`matin-fin-${day.jour}`} className="text-xs">Fin</Label>
                        <Input
                          type="time"
                          id={`matin-fin-${day.jour}`}
                          value={dayCreneaux[day.jour].matinHeures.fin}
                          onChange={(e) => updateCreneauHours(day.jour, 'matinHeures', 'fin', e.target.value)}
                          className="text-sm p-1 h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`matin-personnes-${day.jour}`} className="text-xs">Personnes</Label>
                        <Input
                          type="number"
                          id={`matin-personnes-${day.jour}`}
                          min="1"
                          value={dayCreneaux[day.jour].matinHeures.personnes}
                          onChange={(e) => updateCreneauHours(day.jour, 'matinHeures', 'personnes', parseInt(e.target.value))}
                          className="text-sm p-1 h-8"
                        />
                      </div>
                    </div>
                  )}
                  
                  {dayCreneaux[day.jour]?.soir && !onlyMatinAvailable && (
                    <div className="grid grid-cols-3 gap-2 pl-4 border-l-2 border-blue-200 p-2">
                      <div>
                        <Label htmlFor={`soir-debut-${day.jour}`} className="text-xs">Début</Label>
                        <Input
                          type="time"
                          id={`soir-debut-${day.jour}`}
                          value={dayCreneaux[day.jour].soirHeures.debut}
                          onChange={(e) => updateCreneauHours(day.jour, 'soirHeures', 'debut', e.target.value)}
                          className="text-sm p-1 h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`soir-fin-${day.jour}`} className="text-xs">Fin</Label>
                        <Input
                          type="time"
                          id={`soir-fin-${day.jour}`}
                          value={dayCreneaux[day.jour].soirHeures.fin}
                          onChange={(e) => updateCreneauHours(day.jour, 'soirHeures', 'fin', e.target.value)}
                          className="text-sm p-1 h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`soir-personnes-${day.jour}`} className="text-xs">Personnes</Label>
                        <Input
                          type="number"
                          id={`soir-personnes-${day.jour}`}
                          min="1"
                          value={dayCreneaux[day.jour].soirHeures.personnes}
                          onChange={(e) => updateCreneauHours(day.jour, 'soirHeures', 'personnes', parseInt(e.target.value))}
                          className="text-sm p-1 h-8"
                        />
                      </div>
                    </div>
                  )}
                  
                  {dayCreneaux[day.jour]?.nuit && isNuitAvailable && (
                    <div className="grid grid-cols-3 gap-2 pl-4 border-l-2 border-purple-200 p-2">
                      <div>
                        <Label htmlFor={`nuit-debut-${day.jour}`} className="text-xs">Début</Label>
                        <Input
                          type="time"
                          id={`nuit-debut-${day.jour}`}
                          value={dayCreneaux[day.jour].nuitHeures.debut}
                          onChange={(e) => updateCreneauHours(day.jour, 'nuitHeures', 'debut', e.target.value)}
                          className="text-sm p-1 h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`nuit-fin-${day.jour}`} className="text-xs">Fin</Label>
                        <Input
                          type="time"
                          id={`nuit-fin-${day.jour}`}
                          value={dayCreneaux[day.jour].nuitHeures.fin}
                          onChange={(e) => updateCreneauHours(day.jour, 'nuitHeures', 'fin', e.target.value)}
                          className="text-sm p-1 h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`nuit-personnes-${day.jour}`} className="text-xs">Personnes</Label>
                        <Input
                          type="number"
                          id={`nuit-personnes-${day.jour}`}
                          min="1"
                          value={dayCreneaux[day.jour].nuitHeures.personnes}
                          onChange={(e) => updateCreneauHours(day.jour, 'nuitHeures', 'personnes', parseInt(e.target.value))}
                          className="text-sm p-1 h-8"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Quick buttons */}
        <div className="flex flex-wrap gap-2 justify-between">
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={activateAllDays}
          >
            Activer toutes les journées
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={deactivateAllDays}
          >
            Désactiver toutes les journées
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={replicateHours}
            disabled={Object.keys(activatedDays).filter(k => activatedDays[parseInt(k)]).length <= 1}
          >
            Répliquer les horaires
          </Button>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" className="bg-[#840404] hover:bg-[#6b0303]" disabled={isSubmitting}>
          {isSubmitting ? "Création en cours..." : "Créer la commande"}
        </Button>
      </div>
    </form>
  );
};

export default CommandeForm;
