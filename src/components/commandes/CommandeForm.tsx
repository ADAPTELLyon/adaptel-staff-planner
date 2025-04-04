
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { SECTEURS, generateWeekOptions, getStatusColors } from "@/services/commandesService";

interface Client {
  id: string;
  nom: string;
  secteur: string | null;
}

interface CommandeJourDetails {
  jour_semaine: number;
  jour_date: string;
  actif: boolean;
  creneaux: {
    matin: boolean;
    soir: boolean;
    nuit: boolean;
    debut_matin?: string;
    fin_matin?: string;
    debut_soir?: string;
    fin_soir?: string;
    debut_nuit?: string;
    fin_nuit?: string;
    personnes_matin?: number;
    personnes_soir?: number;
    personnes_nuit?: number;
  };
}

const motifSchema = z.object({
  type: z.enum(['extra', 'accroissement', 'remplacement']),
  raison: z.string().optional(),
  personne_remplacee: z.string().optional(),
  motif_remplacement: z.string().optional()
});

const jourSchema = z.object({
  jour_semaine: z.number(),
  jour_date: z.string(),
  actif: z.boolean(),
  creneaux: z.object({
    matin: z.boolean().default(false),
    soir: z.boolean().default(false),
    nuit: z.boolean().default(false),
    debut_matin: z.string().optional(),
    fin_matin: z.string().optional(),
    debut_soir: z.string().optional(),
    fin_soir: z.string().optional(),
    debut_nuit: z.string().optional(),
    fin_nuit: z.string().optional(),
    personnes_matin: z.number().min(1).optional(),
    personnes_soir: z.number().min(1).optional(),
    personnes_nuit: z.number().min(1).optional()
  })
});

const formSchema = z.object({
  secteur: z.string(),
  client_id: z.string(),
  semaine: z.string(),
  informations: z.string().optional(),
  motif: motifSchema,
  jours: z.array(jourSchema)
});

type FormValues = z.infer<typeof formSchema>;

interface CommandeFormProps {
  onClose: () => void;
}

const CommandeForm = ({ onClose }: CommandeFormProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekOptions, setWeekOptions] = useState<{ value: string; label: string }[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [joursDates, setJoursDates] = useState<{ date: Date; jour: number; jourNom: string; numero: number; mois: string }[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      secteur: '',
      client_id: '',
      semaine: '',
      informations: '',
      motif: {
        type: 'extra'
      },
      jours: []
    }
  });

  // Watch for changes in fields
  const watchSecteur = form.watch('secteur');
  const watchSemaine = form.watch('semaine');
  const watchMotifType = form.watch('motif.type');
  
  // Fetch clients from Supabase
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, nom, secteur');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erreur lors du chargement des clients');
    }
  };

  // Init week options
  const initWeekOptions = () => {
    const options = generateWeekOptions(currentYear);
    setWeekOptions(options);
    
    // Set default to current week
    const currentWeekOption = options.find(opt => 
      opt.label.includes(`Semaine ${new Date().getWeekNumber()}`)
    );
    
    if (currentWeekOption) {
      form.setValue('semaine', currentWeekOption.value);
    }
  };

  // Update jours when semaine changes
  useEffect(() => {
    if (watchSemaine) {
      const weekNum = parseInt(watchSemaine);
      const year = new Date().getFullYear();
      
      // Generate dates for the selected week
      const dates = generateWeekDates(weekNum, year);
      setJoursDates(dates);
      
      // Create jours array with default values
      const joursArray = dates.map(date => ({
        jour_semaine: date.jour,
        jour_date: formatDateToISO(date.date),
        actif: false,
        creneaux: {
          matin: false,
          soir: false,
          nuit: false
        }
      }));
      
      form.setValue('jours', joursArray);
    }
  }, [watchSemaine, form]);

  // Filter clients when secteur changes
  useEffect(() => {
    if (watchSecteur) {
      const filtered = clients.filter(client => 
        !client.secteur || client.secteur === watchSecteur
      );
      setFilteredClients(filtered);
      
      // Reset client selection when sector changes
      form.setValue('client_id', '');
    } else {
      setFilteredClients(clients);
    }
  }, [watchSecteur, clients, form]);

  useEffect(() => {
    fetchClients();
    initWeekOptions();
  }, []);

  // Format date to ISO string (YYYY-MM-DD)
  const formatDateToISO = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Extension of Date to get week number
  declare global {
    interface Date {
      getWeekNumber(): number;
    }
  }
  
  Date.prototype.getWeekNumber = function() {
    const d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Helper function to generate dates for a specific week
  const generateWeekDates = (weekNumber: number, year: number) => {
    // Start with Jan 1
    const firstDayOfYear = new Date(year, 0, 1);
    
    // Calculate days to add to reach the first day of the target week
    // (considering Monday as the first day of the week)
    const daysToFirstDayOfWeek = (weekNumber - 1) * 7 - firstDayOfYear.getDay() + 
      (firstDayOfYear.getDay() === 0 ? -6 : 1);
    
    const firstDayOfWeek = new Date(year, 0, 1 + daysToFirstDayOfWeek);
    
    // Generate array of dates for the week
    return Array.from({ length: 7 }).map((_, idx) => {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + idx);
      return {
        date,
        jour: idx + 1, // 1 = Monday, 7 = Sunday
        jourNom: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][idx],
        numero: date.getDate(),
        mois: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"][date.getMonth()]
      };
    });
  };

  // Helper function to determine if a creneau should be available for a secteur
  const isCreneauAvailable = (secteur: string, creneau: 'matin' | 'soir' | 'nuit') => {
    if (creneau === 'nuit') return secteur === 'Réception';
    if (secteur === 'Étages') return creneau === 'matin';
    return true;
  };

  // Toggle all days
  const toggleAllDays = (active: boolean) => {
    const updatedJours = form.getValues('jours').map(jour => ({
      ...jour,
      actif: active
    }));
    form.setValue('jours', updatedJours);
  };

  // Apply same schedule to all active days
  const applyScheduleToAllDays = () => {
    const jours = form.getValues('jours');
    if (!jours.some(j => j.actif)) {
      toast.warning('Aucun jour n\'est activé');
      return;
    }
    
    // Find the first active day to use as template
    const templateDay = jours.find(j => j.actif);
    if (!templateDay) return;
    
    const updatedJours = jours.map(jour => {
      if (jour.actif) {
        return {
          ...jour,
          creneaux: { ...templateDay.creneaux }
        };
      }
      return jour;
    });
    
    form.setValue('jours', updatedJours);
  };

  // Save the commande to Supabase
  const saveCommande = async (values: FormValues) => {
    setLoading(true);
    try {
      // Find selected client
      const selectedClient = clients.find(c => c.id === values.client_id);
      if (!selectedClient) throw new Error('Client non trouvé');

      // Format jours data for insertion
      const activeDays = values.jours.filter(j => j.actif);
      if (activeDays.length === 0) {
        toast.warning('Veuillez sélectionner au moins un jour');
        setLoading(false);
        return;
      }
      
      // Create commande record
      const weekNum = parseInt(values.semaine);
      const { data: commande, error: commandeError } = await supabase
        .from('commandes')
        .insert({
          client_id: values.client_id,
          client_nom: selectedClient.nom,
          secteur: values.secteur,
          statut: 'En attente',
          semaine: weekNum,
          annee: currentYear
        })
        .select()
        .single();
      
      if (commandeError) throw commandeError;
      
      // Insert commande_jours records
      const joursToInsert = activeDays.map(jour => {
        const creneaux: string[] = [];
        const { matin, soir, nuit } = jour.creneaux;
        
        if (matin) {
          const horaire = jour.creneaux.debut_matin && jour.creneaux.fin_matin 
            ? `Matin (${jour.creneaux.debut_matin} - ${jour.creneaux.fin_matin})`
            : 'Matin';
          creneaux.push(horaire);
        }
        
        if (soir) {
          const horaire = jour.creneaux.debut_soir && jour.creneaux.fin_soir 
            ? `Soir (${jour.creneaux.debut_soir} - ${jour.creneaux.fin_soir})`
            : 'Soir';
          creneaux.push(horaire);
        }
        
        if (nuit) {
          const horaire = jour.creneaux.debut_nuit && jour.creneaux.fin_nuit 
            ? `Nuit (${jour.creneaux.debut_nuit} - ${jour.creneaux.fin_nuit})`
            : 'Nuit';
          creneaux.push(horaire);
        }

        const colors = getStatusColors('En recherche');
        
        return {
          commande_id: commande.id,
          jour_semaine: jour.jour_semaine,
          jour_date: jour.jour_date,
          statut: 'En recherche',
          creneaux,
          couleur_fond: colors.couleur_fond,
          couleur_texte: colors.couleur_texte
        };
      });
      
      const { error: joursError } = await supabase
        .from('commande_jours')
        .insert(joursToInsert);
      
      if (joursError) throw joursError;
      
      toast.success('Commande créée avec succès');
      onClose();
    } catch (error) {
      console.error('Error saving commande:', error);
      toast.error('Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    saveCommande(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - general info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations générales</h3>
            
            <FormField
              control={form.control}
              name="secteur"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secteur*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un secteur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SECTEURS.map((secteur) => (
                        <SelectItem key={secteur} value={secteur}>
                          {secteur}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                    disabled={!watchSecteur}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={watchSecteur ? "Sélectionner un client" : "Sélectionnez d'abord un secteur"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredClients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="semaine"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Semaine*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une semaine" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {weekOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="motif.type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Motif de commande*</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="extra" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Extra usage constant
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="accroissement" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Accroissement d'activité
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="remplacement" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Remplacement d'une personne absente
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {watchMotifType === 'accroissement' && (
              <FormField
                control={form.control}
                name="motif.raison"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raison de l'accroissement*</FormLabel>
                    <FormControl>
                      <Input placeholder="Raison de l'accroissement d'activité" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {watchMotifType === 'remplacement' && (
              <>
                <FormField
                  control={form.control}
                  name="motif.personne_remplacee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personne remplacée*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom et prénom" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="motif.motif_remplacement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motif du remplacement*</FormLabel>
                      <FormControl>
                        <Input placeholder="Motif du remplacement" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <FormField
              control={form.control}
              name="informations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informations complémentaires</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informations complémentaires sur la commande" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Right column - days details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Détail des journées</h3>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleAllDays(true)}
                >
                  Tout activer
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={() => toggleAllDays(false)}
                >
                  Tout désactiver
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant="outline"
                  onClick={applyScheduleToAllDays}
                >
                  Répliquer horaires
                </Button>
              </div>
            </div>
            
            <div className="space-y-6">
              {form.getValues('jours')?.map((jour, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {joursDates[index]?.jourNom} {joursDates[index]?.numero} {joursDates[index]?.mois}
                    </h4>
                    
                    <FormField
                      control={form.control}
                      name={`jours.${index}.actif`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Activer ce jour
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {form.getValues(`jours.${index}.actif`) && (
                    <div className="space-y-4">
                      {/* Matin Shift */}
                      {isCreneauAvailable(watchSecteur, 'matin') && (
                        <div className="border-t pt-2">
                          <FormField
                            control={form.control}
                            name={`jours.${index}.creneaux.matin`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 mb-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Créneau Matin/Midi
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          {form.getValues(`jours.${index}.creneaux.matin`) && (
                            <div className="grid grid-cols-3 gap-2">
                              <FormField
                                control={form.control}
                                name={`jours.${index}.creneaux.debut_matin`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Début</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`jours.${index}.creneaux.fin_matin`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Fin</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`jours.${index}.creneaux.personnes_matin`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Personnes</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        {...field} 
                                        onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Soir Shift */}
                      {isCreneauAvailable(watchSecteur, 'soir') && (
                        <div className="border-t pt-2">
                          <FormField
                            control={form.control}
                            name={`jours.${index}.creneaux.soir`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 mb-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Créneau Soir
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          {form.getValues(`jours.${index}.creneaux.soir`) && (
                            <div className="grid grid-cols-3 gap-2">
                              <FormField
                                control={form.control}
                                name={`jours.${index}.creneaux.debut_soir`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Début</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`jours.${index}.creneaux.fin_soir`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Fin</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`jours.${index}.creneaux.personnes_soir`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Personnes</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        {...field} 
                                        onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Nuit Shift - Only for Reception */}
                      {isCreneauAvailable(watchSecteur, 'nuit') && (
                        <div className="border-t pt-2">
                          <FormField
                            control={form.control}
                            name={`jours.${index}.creneaux.nuit`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 mb-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <FormLabel className="font-medium">
                                  Créneau Nuit
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                          
                          {form.getValues(`jours.${index}.creneaux.nuit`) && (
                            <div className="grid grid-cols-3 gap-2">
                              <FormField
                                control={form.control}
                                name={`jours.${index}.creneaux.debut_nuit`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Début</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`jours.${index}.creneaux.fin_nuit`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Fin</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={form.control}
                                name={`jours.${index}.creneaux.personnes_nuit`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Personnes</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        {...field} 
                                        onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Créer la commande
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CommandeForm;
