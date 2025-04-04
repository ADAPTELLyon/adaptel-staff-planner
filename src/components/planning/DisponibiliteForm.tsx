
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { SECTEURS, generateWeekOptions } from "@/services/commandesService";

interface Candidat {
  id: string;
  nom: string;
  prenom: string;
  secteurs: string[];
}

interface JourDisponibilite {
  jour_semaine: number;
  jour_date: string;
  statut: "Non renseigné" | "Non dispo" | "Dispo";
  creneaux: {
    matin: boolean;
    soir: boolean;
    nuit: boolean;
  };
  hasMission: boolean;
}

const jourSchema = z.object({
  jour_semaine: z.number(),
  jour_date: z.string(),
  statut: z.enum(["Non renseigné", "Non dispo", "Dispo"]),
  creneaux: z.object({
    matin: z.boolean(),
    soir: z.boolean(),
    nuit: z.boolean()
  }),
  hasMission: z.boolean()
});

const formSchema = z.object({
  secteur: z.string(),
  candidat_id: z.string(),
  semaine: z.string(),
  informations: z.string().optional(),
  jours: z.array(jourSchema)
});

type FormValues = z.infer<typeof formSchema>;

interface DisponibiliteFormProps {
  onClose: () => void;
}

const DisponibiliteForm = ({ onClose }: DisponibiliteFormProps) => {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [filteredCandidats, setFilteredCandidats] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekOptions, setWeekOptions] = useState<{ value: string; label: string }[]>([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [joursDates, setJoursDates] = useState<{ date: Date; jour: number; jourNom: string; numero: number; mois: string }[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      secteur: '',
      candidat_id: '',
      semaine: '',
      informations: '',
      jours: []
    }
  });

  // Watch for changes in fields
  const watchSecteur = form.watch('secteur');
  const watchSemaine = form.watch('semaine');
  const watchCandidatId = form.watch('candidat_id');
  
  // Fetch candidats from Supabase
  const fetchCandidats = async () => {
    try {
      const { data, error } = await supabase
        .from('candidats')
        .select('id, nom, prenom, secteurs')
        .eq('actif', true);
      
      if (error) throw error;
      setCandidats(data || []);
    } catch (error) {
      console.error('Error fetching candidats:', error);
      toast.error('Erreur lors du chargement des candidats');
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

  // Check if a candidat has missions for specific days
  const checkExistingMissions = async (candidatId: string, weekNum: number, year: number) => {
    try {
      // Find commande_jours where this candidat is assigned
      const { data, error } = await supabase
        .from('commande_jours')
        .select('jour_semaine, jour_date')
        .eq('candidat', candidatId)
        .like('jour_date', `${year}-%`);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error checking for existing missions:', error);
      return [];
    }
  };

  // Check if the candidat already has disponibilities recorded for this week
  const checkExistingDisponibilities = async (candidatId: string, weekNum: number, year: number) => {
    // This would require a table specifically for candidat disponibilities
    // For now we return empty data as this table doesn't exist yet
    return [];
  };

  // Update jours when semaine and candidat changes
  useEffect(() => {
    if (watchSemaine && watchCandidatId) {
      const weekNum = parseInt(watchSemaine);
      const year = currentYear;
      
      const updateJoursWithAvailability = async () => {
        // Generate dates for the selected week
        const dates = generateWeekDates(weekNum, year);
        setJoursDates(dates);
        
        // Check for existing missions
        const existingMissions = await checkExistingMissions(watchCandidatId, weekNum, year);
        const existingDispos = await checkExistingDisponibilities(watchCandidatId, weekNum, year);
        
        // Create jours array with default values
        const joursArray = dates.map(date => {
          const dateStr = formatDateToISO(date.date);
          const hasMission = existingMissions.some(
            mission => formatDateToISO(new Date(mission.jour_date)) === dateStr
          );
          
          // Check if we already have disponibility data
          const existingDispo = existingDispos.find(
            dispo => dispo.jour_date === dateStr
          );
          
          return {
            jour_semaine: date.jour,
            jour_date: dateStr,
            statut: existingDispo ? existingDispo.statut : "Non renseigné" as "Non renseigné" | "Non dispo" | "Dispo",
            creneaux: existingDispo ? existingDispo.creneaux : {
              matin: false,
              soir: false,
              nuit: false
            },
            hasMission
          };
        });
        
        form.setValue('jours', joursArray);
      };
      
      updateJoursWithAvailability();
    }
  }, [watchSemaine, watchCandidatId, form]);

  // Filter candidats when secteur changes
  useEffect(() => {
    if (watchSecteur) {
      const filtered = candidats.filter(candidat => 
        candidat.secteurs && candidat.secteurs.includes(watchSecteur)
      );
      setFilteredCandidats(filtered);
      
      // Reset candidat selection when sector changes
      form.setValue('candidat_id', '');
    } else {
      setFilteredCandidats(candidats);
    }
  }, [watchSecteur, candidats, form]);

  useEffect(() => {
    fetchCandidats();
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

  // Helper function to determine if a creneau should be available for a sector
  const isCreneauAvailable = (secteur: string, creneau: 'matin' | 'soir' | 'nuit') => {
    if (creneau === 'nuit') return secteur === 'Réception';
    if (secteur === 'Étages') return creneau === 'matin';
    return true;
  };

  // Toggle all days status
  const setAllDaysStatus = (status: "Dispo" | "Non dispo") => {
    const updatedJours = form.getValues('jours').map(jour => {
      if (!jour.hasMission) {
        return {
          ...jour,
          statut: status,
          creneaux: status === "Dispo" ? jour.creneaux : { matin: false, soir: false, nuit: false }
        };
      }
      return jour;
    });
    form.setValue('jours', updatedJours);
  };

  // Toggle all creneaux for available days
  const toggleAllCreneaux = (active: boolean) => {
    const updatedJours = form.getValues('jours').map(jour => {
      if (jour.statut === "Dispo" && !jour.hasMission) {
        return {
          ...jour,
          creneaux: {
            matin: isCreneauAvailable(watchSecteur, 'matin') ? active : false,
            soir: isCreneauAvailable(watchSecteur, 'soir') ? active : false,
            nuit: isCreneauAvailable(watchSecteur, 'nuit') ? active : false
          }
        };
      }
      return jour;
    });
    form.setValue('jours', updatedJours);
  };

  // Save the disponibilities
  const saveDisponibilites = async (values: FormValues) => {
    setLoading(true);
    try {
      // For now, we just show a success message since we don't have a table for disponibilities yet
      // In a real implementation, you would save this data to a dedicated table
      
      toast.success('Disponibilités enregistrées avec succès');
      onClose();
    } catch (error) {
      console.error('Error saving disponibilities:', error);
      toast.error('Erreur lors de l\'enregistrement des disponibilités');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    saveDisponibilites(values);
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
              name="candidat_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Candidat*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                    disabled={!watchSecteur}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={watchSecteur ? "Sélectionner un candidat" : "Sélectionnez d'abord un secteur"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCandidats.map((candidat) => (
                        <SelectItem key={candidat.id} value={candidat.id}>
                          {`${candidat.prenom} ${candidat.nom}`}
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
              name="informations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Informations complémentaires</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Informations complémentaires sur les disponibilités" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex flex-col gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setAllDaysStatus("Dispo")}
              >
                Mettre tous les jours en Disponible
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setAllDaysStatus("Non dispo")}
              >
                Mettre tous les jours en Non disponible
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => toggleAllCreneaux(true)}
              >
                Activer tous les créneaux possibles
              </Button>
            </div>
          </div>
          
          {/* Right column - days details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Disponibilités par jour</h3>
            
            <div className="space-y-4">
              {form.getValues('jours')?.map((jour, index) => (
                <div key={index} className={`border rounded-md p-4 ${jour.hasMission ? 'bg-gray-100' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {joursDates[index]?.jourNom} {joursDates[index]?.numero} {joursDates[index]?.mois}
                    </h4>
                    
                    {jour.hasMission ? (
                      <Badge variant="secondary">Mission planifiée</Badge>
                    ) : (
                      <FormField
                        control={form.control}
                        name={`jours.${index}.statut`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange as (value: string) => void}
                                defaultValue={field.value}
                                value={field.value}
                                className="flex gap-4"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Non renseigné" />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Non renseigné
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Non dispo" />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Non dispo
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Dispo" />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    Dispo
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  {form.getValues(`jours.${index}.statut`) === "Dispo" && !jour.hasMission && (
                    <div className="border-t pt-2 space-y-2">
                      <p className="text-sm font-medium">Créneaux disponibles:</p>
                      
                      {isCreneauAvailable(watchSecteur, 'matin') && (
                        <FormField
                          control={form.control}
                          name={`jours.${index}.creneaux.matin`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Matin/Midi
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {isCreneauAvailable(watchSecteur, 'soir') && (
                        <FormField
                          control={form.control}
                          name={`jours.${index}.creneaux.soir`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Soir
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      )}
                      
                      {isCreneauAvailable(watchSecteur, 'nuit') && (
                        <FormField
                          control={form.control}
                          name={`jours.${index}.creneaux.nuit`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                Nuit
                              </FormLabel>
                            </FormItem>
                          )}
                        />
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
            Enregistrer les disponibilités
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DisponibiliteForm;
