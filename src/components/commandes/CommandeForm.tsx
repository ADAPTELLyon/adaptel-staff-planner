
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { SECTEURS } from "@/services/commandesService";
import { generateWeekOptions, getCurrentWeekNumber } from "@/utils/dateUtils";

// Define the CommandeForm component props
interface CommandeFormProps {
  onClose: () => void;
}

interface Client {
  id: string;
  nom: string;
  secteur: string;
}

interface JourInfo {
  actif: boolean;
  jour_semaine: number;
  creneaux: {
    matin: boolean;
    soir: boolean;
    nuit: boolean; // Only for Reception
    matin_debut: string;
    matin_fin: string;
    soir_debut: string;
    soir_fin: string;
    nuit_debut: string;
    nuit_fin: string;
    matin_personnes: number;
    soir_personnes: number;
    nuit_personnes: number;
  };
}

const CommandeForm: React.FC<CommandeFormProps> = ({ onClose }) => {
  // Form state
  const [secteur, setSecteur] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [semaine, setSemaine] = useState<string>(getCurrentWeekNumber().toString());
  const [motif, setMotif] = useState<string>("");
  const [personneRemplacee, setPersonneRemplacee] = useState<string>("");
  const [raisonRemplacement, setRaisonRemplacement] = useState<string>("");
  const [raisonAccroissement, setRaisonAccroissement] = useState<string>("");
  const [commentaire, setCommentaire] = useState<string>("");
  
  // Clients list filtered by selected sector
  const [clients, setClients] = useState<Client[]>([]);
  
  // Week options
  const [weekOptions, setWeekOptions] = useState<{ value: string; label: string }[]>([]);
  
  // Jours - init one object for each day of the week
  const [jours, setJours] = useState<JourInfo[]>([
    ...Array(7).fill(null).map((_, idx) => ({
      actif: false,
      jour_semaine: idx + 1, // 1 = Monday, 7 = Sunday
      creneaux: {
        matin: false,
        soir: false,
        nuit: false,
        matin_debut: "09:00",
        matin_fin: "15:00",
        soir_debut: "18:00",
        soir_fin: "23:00",
        nuit_debut: "23:00",
        nuit_fin: "07:00",
        matin_personnes: 1,
        soir_personnes: 1,
        nuit_personnes: 1,
      }
    }))
  ]);
  
  // Fetch clients filtered by sector
  useEffect(() => {
    const fetchClients = async () => {
      if (!secteur) return;
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, nom, secteur')
          .eq('secteur', secteur);
        
        if (error) throw error;
        
        setClients(data || []);
        if (data && data.length > 0) {
          setClientId(data[0].id);
        } else {
          setClientId("");
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error("Erreur lors du chargement des clients");
      }
    };
    
    fetchClients();
  }, [secteur]);
  
  // Load week options
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const options = generateWeekOptions(currentYear);
    setWeekOptions(options);
  }, []);
  
  // Toggle all days active/inactive
  const toggleAllDays = (active: boolean) => {
    setJours(jours.map(jour => ({
      ...jour,
      actif: active
    })));
  };
  
  // Toggle a specific day
  const toggleDay = (dayIndex: number) => {
    setJours(jours.map((jour, idx) => 
      idx === dayIndex ? { ...jour, actif: !jour.actif } : jour
    ));
  };
  
  // Toggle a specific creneau for a day
  const toggleCreneau = (dayIndex: number, creneau: 'matin' | 'soir' | 'nuit') => {
    setJours(jours.map((jour, idx) => 
      idx === dayIndex ? {
        ...jour,
        creneaux: {
          ...jour.creneaux,
          [creneau]: !jour.creneaux[creneau]
        }
      } : jour
    ));
  };
  
  // Update creneau time or persons
  const updateCreneau = (
    dayIndex: number, 
    creneau: 'matin' | 'soir' | 'nuit',
    field: 'debut' | 'fin' | 'personnes',
    value: string | number
  ) => {
    setJours(jours.map((jour, idx) => 
      idx === dayIndex ? {
        ...jour,
        creneaux: {
          ...jour.creneaux,
          [`${creneau}_${field}`]: value
        }
      } : jour
    ));
  };
  
  // Replicate the first active day's creneaux to all other active days
  const replicateCreneaux = () => {
    // Find the first active day
    const firstActiveDay = jours.find(jour => jour.actif);
    if (!firstActiveDay) {
      toast.error("Aucun jour n'est activé");
      return;
    }
    
    // Apply its creneaux to all other active days
    setJours(jours.map(jour => 
      jour.actif ? {
        ...jour,
        creneaux: { ...firstActiveDay.creneaux }
      } : jour
    ));
    
    toast.success("Horaires répliqués sur tous les jours actifs");
  };
  
  // Submit the form
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validation
    if (!secteur) {
      toast.error("Veuillez sélectionner un secteur");
      return;
    }
    
    if (!clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }
    
    if (!semaine) {
      toast.error("Veuillez sélectionner une semaine");
      return;
    }
    
    if (!motif) {
      toast.error("Veuillez sélectionner un motif");
      return;
    }
    
    // Check if any day is active
    const anyDayActive = jours.some(jour => jour.actif);
    if (!anyDayActive) {
      toast.error("Veuillez activer au moins un jour");
      return;
    }
    
    // Check if any active day has at least one creneau
    const anyCreneauActive = jours.some(jour => 
      jour.actif && (jour.creneaux.matin || jour.creneaux.soir || jour.creneaux.nuit)
    );
    if (!anyCreneauActive) {
      toast.error("Veuillez sélectionner au moins un créneau pour les jours actifs");
      return;
    }
    
    try {
      // Generate a unique ID for the commande
      const commandeId = uuidv4();
      
      // Create the base commande
      const { error: commandeError } = await supabase
        .from('commandes')
        .insert({
          id: commandeId,
          client_id: clientId,
          semaine: parseInt(semaine),
          secteur: secteur,
          motif: motif,
          personne_remplacee: motif === "Remplacement d'une personne absente" ? personneRemplacee : null,
          raison_remplacement: motif === "Remplacement d'une personne absente" ? raisonRemplacement : null,
          raison_accroissement: motif === "Accroissement d'activité" ? raisonAccroissement : null,
          commentaire: commentaire || null
        });
      
      if (commandeError) throw commandeError;
      
      // Create the commande_jours entries for each active day
      for (const jour of jours) {
        if (!jour.actif) continue;
        
        const { creneaux } = jour;
        
        // For each active creneau, create a commande_jour entry
        const creatingCreneaux = [];
        
        if (creneaux.matin) {
          creatingCreneaux.push({
            commande_id: commandeId,
            jour_semaine: jour.jour_semaine,
            creneau_type: 'Matin',
            heure_debut: creneaux.matin_debut,
            heure_fin: creneaux.matin_fin,
            nb_personnes: creneaux.matin_personnes,
            statut: 'En recherche'
          });
        }
        
        if (creneaux.soir) {
          creatingCreneaux.push({
            commande_id: commandeId,
            jour_semaine: jour.jour_semaine,
            creneau_type: 'Soir',
            heure_debut: creneaux.soir_debut,
            heure_fin: creneaux.soir_fin,
            nb_personnes: creneaux.soir_personnes,
            statut: 'En recherche'
          });
        }
        
        if (creneaux.nuit && secteur === 'Réception') {
          creatingCreneaux.push({
            commande_id: commandeId,
            jour_semaine: jour.jour_semaine,
            creneau_type: 'Nuit',
            heure_debut: creneaux.nuit_debut,
            heure_fin: creneaux.nuit_fin,
            nb_personnes: creneaux.nuit_personnes,
            statut: 'En recherche'
          });
        }
        
        // Insert all creneaux for this day
        if (creatingCreneaux.length > 0) {
          const { error: joursError } = await supabase
            .from('commande_jours')
            .insert(creatingCreneaux);
          
          if (joursError) throw joursError;
        }
      }
      
      toast.success("Commande créée avec succès");
      onClose();
    } catch (error) {
      console.error('Error creating commande:', error);
      toast.error("Erreur lors de la création de la commande");
    }
  };
  
  // Get day name for display
  const getDayName = (dayIndex: number) => {
    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    return days[dayIndex];
  };
  
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
      {/* Left side - General information */}
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
        
        {/* Secteur */}
        <div className="space-y-2">
          <Label htmlFor="secteur">Secteur <span className="text-red-500">*</span></Label>
          <Select 
            value={secteur} 
            onValueChange={setSecteur}
          >
            <SelectTrigger id="secteur">
              <SelectValue placeholder="Sélectionner un secteur" />
            </SelectTrigger>
            <SelectContent>
              {SECTEURS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Client */}
        <div className="space-y-2">
          <Label htmlFor="client">Client <span className="text-red-500">*</span></Label>
          <Select 
            value={clientId} 
            onValueChange={setClientId}
            disabled={!secteur || clients.length === 0}
          >
            <SelectTrigger id="client">
              <SelectValue placeholder={
                !secteur ? "Sélectionnez d'abord un secteur" : 
                clients.length === 0 ? "Aucun client disponible" : 
                "Sélectionner un client"
              } />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>{client.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Semaine */}
        <div className="space-y-2">
          <Label htmlFor="semaine">Semaine <span className="text-red-500">*</span></Label>
          <Select 
            value={semaine} 
            onValueChange={setSemaine}
          >
            <SelectTrigger id="semaine">
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
        <div className="space-y-2">
          <Label htmlFor="motif">Motif <span className="text-red-500">*</span></Label>
          <Select 
            value={motif} 
            onValueChange={setMotif}
          >
            <SelectTrigger id="motif">
              <SelectValue placeholder="Sélectionner un motif" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Extra usage constant">Extra usage constant</SelectItem>
              <SelectItem value="Remplacement d'une personne absente">Remplacement d'une personne absente</SelectItem>
              <SelectItem value="Accroissement d'activité">Accroissement d'activité</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Conditional fields based on motif */}
        {motif === "Remplacement d'une personne absente" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="personne-remplacee">Nom & prénom de la personne à remplacer</Label>
              <Input
                id="personne-remplacee"
                value={personneRemplacee}
                onChange={(e) => setPersonneRemplacee(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="raison-remplacement">Raison du remplacement</Label>
              <Textarea
                id="raison-remplacement"
                value={raisonRemplacement}
                onChange={(e) => setRaisonRemplacement(e.target.value)}
                rows={3}
              />
            </div>
          </>
        )}
        
        {motif === "Accroissement d'activité" && (
          <div className="space-y-2">
            <Label htmlFor="raison-accroissement">Raison de l'accroissement</Label>
            <Textarea
              id="raison-accroissement"
              value={raisonAccroissement}
              onChange={(e) => setRaisonAccroissement(e.target.value)}
              rows={3}
            />
          </div>
        )}
        
        {/* Commentaire */}
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="commentaire" className="mr-2">Commentaire</Label>
            <Info size={16} className="text-gray-500" aria-label="Si rempli, une icône info apparaîtra sur la ligne de planning" />
          </div>
          <Textarea
            id="commentaire"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Informations supplémentaires (optionnel)"
            rows={3}
          />
        </div>
      </div>
      
      {/* Right side - Day management */}
      <div className="space-y-4 p-4 border rounded-md">
        <h3 className="text-lg font-semibold mb-4">Jours et créneaux</h3>
        
        {/* Days grid */}
        <div className="space-y-4">
          {jours.map((jour, idx) => (
            <div key={idx} className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">{getDayName(idx)}</div>
                <Switch 
                  checked={jour.actif}
                  onCheckedChange={() => toggleDay(idx)}
                />
              </div>
              
              {jour.actif && (
                <div className="pl-4 space-y-3">
                  {/* Matin/Midi (available for all sectors) */}
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <Switch 
                        id={`matin-${idx}`}
                        checked={jour.creneaux.matin}
                        onCheckedChange={() => toggleCreneau(idx, 'matin')}
                        className="mr-2"
                      />
                      <Label htmlFor={`matin-${idx}`}>Matin/Midi</Label>
                    </div>
                    
                    {jour.creneaux.matin && (
                      <div className="pl-8 grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Début</Label>
                          <Input 
                            type="time" 
                            value={jour.creneaux.matin_debut}
                            onChange={(e) => updateCreneau(idx, 'matin', 'debut', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Fin</Label>
                          <Input 
                            type="time" 
                            value={jour.creneaux.matin_fin}
                            onChange={(e) => updateCreneau(idx, 'matin', 'fin', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Personnes</Label>
                          <Input 
                            type="number" 
                            min={1}
                            value={jour.creneaux.matin_personnes}
                            onChange={(e) => updateCreneau(idx, 'matin', 'personnes', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Soir (available for all sectors except Étages) */}
                  {secteur !== "Étages" && (
                    <div className="flex flex-col">
                      <div className="flex items-center mb-2">
                        <Switch 
                          id={`soir-${idx}`}
                          checked={jour.creneaux.soir}
                          onCheckedChange={() => toggleCreneau(idx, 'soir')}
                          className="mr-2"
                        />
                        <Label htmlFor={`soir-${idx}`}>Soir</Label>
                      </div>
                      
                      {jour.creneaux.soir && (
                        <div className="pl-8 grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Début</Label>
                            <Input 
                              type="time" 
                              value={jour.creneaux.soir_debut}
                              onChange={(e) => updateCreneau(idx, 'soir', 'debut', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Fin</Label>
                            <Input 
                              type="time" 
                              value={jour.creneaux.soir_fin}
                              onChange={(e) => updateCreneau(idx, 'soir', 'fin', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Personnes</Label>
                            <Input 
                              type="number" 
                              min={1}
                              value={jour.creneaux.soir_personnes}
                              onChange={(e) => updateCreneau(idx, 'soir', 'personnes', parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Nuit (only available for Reception) */}
                  {secteur === "Réception" && (
                    <div className="flex flex-col">
                      <div className="flex items-center mb-2">
                        <Switch 
                          id={`nuit-${idx}`}
                          checked={jour.creneaux.nuit}
                          onCheckedChange={() => toggleCreneau(idx, 'nuit')}
                          className="mr-2"
                        />
                        <Label htmlFor={`nuit-${idx}`}>Nuit</Label>
                      </div>
                      
                      {jour.creneaux.nuit && (
                        <div className="pl-8 grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Début</Label>
                            <Input 
                              type="time" 
                              value={jour.creneaux.nuit_debut}
                              onChange={(e) => updateCreneau(idx, 'nuit', 'debut', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Fin</Label>
                            <Input 
                              type="time" 
                              value={jour.creneaux.nuit_fin}
                              onChange={(e) => updateCreneau(idx, 'nuit', 'fin', e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Personnes</Label>
                            <Input 
                              type="number" 
                              min={1}
                              value={jour.creneaux.nuit_personnes}
                              onChange={(e) => updateCreneau(idx, 'nuit', 'personnes', parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => toggleAllDays(true)}
          >
            Activer tous les jours
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => toggleAllDays(false)}
          >
            Désactiver tous les jours
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={replicateCreneaux}
          >
            <Check size={16} className="mr-1" aria-label="Appliquer" />
            Répliquer les horaires
          </Button>
        </div>
      </div>
      
      {/* Form buttons */}
      <div className="flex justify-end gap-2 col-span-1 md:col-span-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="bg-[#840404] hover:bg-[#6b0303]">
          Créer la commande
        </Button>
      </div>
    </form>
  );
};

export default CommandeForm;
