import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Replace the existing date imports with:
import { getCurrentWeekNumber, generateWeekDates, formatDateToISOString } from "@/utils/dateUtils";

import {
  CommandesFormType,
  getStatusColors,
  SECTEURS,
} from "@/services/commandesService";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CommandeFormProps {
  onClose: () => void;
}

const CommandeForm: React.FC<CommandeFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<CommandesFormType>({
    client_nom: "",
    client_id: "",
    secteur: "",
    statut: "En recherche",
    semaine: getCurrentWeekNumber(),
    annee: new Date().getFullYear(),
    jours: [],
  });
  const [clients, setClients] = useState<{ id: string; nom: string }[]>([]);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [creneaux, setCreneaux] = useState<{
    [day: number]: { debut: string; fin: string; personnes: number }[];
  }>({});
  const [weekDates, setWeekDates] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("id, nom");

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

  // Generate week dates
  useEffect(() => {
    const dates = generateWeekDates(formData.semaine, formData.annee);
    setWeekDates(dates);
  }, [formData.semaine, formData.annee]);

  // Handle form field change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle day selection
  const handleDayToggle = (day: number) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
      const { [day]: removed, ...rest } = creneaux;
      setCreneaux(rest);
    } else {
      setSelectedDays([...selectedDays, day]);
      setCreneaux({
        ...creneaux,
        [day]: [{ debut: "09:00", fin: "17:00", personnes: 1 }],
      });
    }
  };

  // Handle creneau change
  const handleCreneauChange = (
    day: number,
    index: number,
    field: string,
    value: string | number
  ) => {
    setCreneaux((prevCreneaux) => {
      const updatedCreneaux = { ...prevCreneaux };
      if (!updatedCreneaux[day]) {
        updatedCreneaux[day] = [];
      }
      if (!updatedCreneaux[day][index]) {
        updatedCreneaux[day][index] = {
          debut: "09:00",
          fin: "17:00",
          personnes: 1,
        };
      }
      updatedCreneaux[day][index] = {
        ...updatedCreneaux[day][index],
        [field]: value,
      };
      return updatedCreneaux;
    });
  };

  // Add creneau
  const handleAddCreneau = (day: number) => {
    setCreneaux((prevCreneaux) => {
      const updatedCreneaux = { ...prevCreneaux };
      if (!updatedCreneaux[day]) {
        updatedCreneaux[day] = [];
      }
      updatedCreneaux[day].push({ debut: "09:00", fin: "17:00", personnes: 1 });
      return updatedCreneaux;
    });
  };

  // Remove creneau
  const handleRemoveCreneau = (day: number, index: number) => {
    setCreneaux((prevCreneaux) => {
      const updatedCreneaux = { ...prevCreneaux };
      updatedCreneaux[day] = updatedCreneaux[day].filter((_, i) => i !== index);
      return updatedCreneaux;
    });
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare jours data
    const joursData = weekDates.map((date, index) => {
      const jour_semaine = index + 1;
      const jour_date = formatDateToISOString(date.date);
      const statut = "En recherche";
      const { couleur_fond, couleur_texte } = getStatusColors(statut);
      const creneauxForDay = creneaux[jour_semaine] || [];
      const creneauxFormatted = selectedDays.includes(jour_semaine)
        ? creneauxForDay.map(
            (creneau) => `${creneau.debut}-${creneau.fin}`
          )
        : [];

      return {
        jour_semaine,
        jour_date,
        statut,
        creneaux: creneauxFormatted,
        couleur_fond,
        couleur_texte,
      };
    });

    // Update form data with jours
    setFormData({
      ...formData,
      jours: joursData,
    });

    try {
      // Call your createCommande function here
      const { error } = await supabase.from("commandes").insert([
        {
          client_nom: formData.client_nom,
          client_id: formData.client_id,
          secteur: formData.secteur,
          statut: formData.statut,
          semaine: formData.semaine,
          annee: formData.annee,
        },
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Succès!",
        description: "Commande créée avec succès.",
      });
      onClose();
    } catch (error: any) {
      console.error("Error creating commande:", error);
      toast({
        title: "Erreur!",
        description:
          error.message || "Une erreur est survenue lors de la création.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Client Information */}
      <div>
        <Label htmlFor="client_nom">Nom du client</Label>
        <Input
          type="text"
          id="client_nom"
          name="client_nom"
          value={formData.client_nom}
          onChange={handleInputChange}
          placeholder="Nom du client"
          required
        />
      </div>

      <div>
        <Label htmlFor="client-select">Client</Label>
        <Select
          value={formData.client_id}
          onValueChange={(value) =>
            setFormData({ ...formData, client_id: value })
          }
        >
          <SelectTrigger id="client-select">
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Secteur */}
      <div>
        <Label htmlFor="secteur">Secteur</Label>
        <Select
          value={formData.secteur}
          onValueChange={(value) =>
            setFormData({ ...formData, secteur: value })
          }
        >
          <SelectTrigger id="secteur">
            <SelectValue placeholder="Sélectionner un secteur" />
          </SelectTrigger>
          <SelectContent>
            {SECTEURS.map((secteur) => (
              <SelectItem key={secteur} value={secteur}>
                {secteur}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Week Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="semaine">Semaine</Label>
          <Input
            type="number"
            id="semaine"
            name="semaine"
            value={formData.semaine}
            onChange={handleInputChange}
            placeholder="Numéro de semaine"
            required
          />
        </div>

        <div>
          <Label htmlFor="annee">Année</Label>
          <Input
            type="number"
            id="annee"
            name="annee"
            value={formData.annee}
            onChange={handleInputChange}
            placeholder="Année"
            required
          />
        </div>
      </div>

      {/* Day Selection */}
      <div>
        <Label>Jours</Label>
        <div className="flex flex-wrap gap-2">
          {weekDates.map((date, index) => {
            const day = index + 1;
            return (
              <Button
                key={day}
                variant={selectedDays.includes(day) ? "default" : "outline"}
                onClick={() => handleDayToggle(day)}
              >
                {date.jourNom} {date.numero}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Creneaux Input */}
      {selectedDays.map((day) => (
        <div key={day}>
          <Label>
            Créneaux - {weekDates[day - 1].jourNom} {weekDates[day - 1].numero}
          </Label>
          {creneaux[day] &&
            creneaux[day].map((creneau, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 mb-2">
                <div>
                  <Label htmlFor={`debut-${day}-${index}`}>Début</Label>
                  <Input
                    type="time"
                    id={`debut-${day}-${index}`}
                    value={creneau.debut}
                    onChange={(e) =>
                      handleCreneauChange(
                        day,
                        index,
                        "debut",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`fin-${day}-${index}`}>Fin</Label>
                  <Input
                    type="time"
                    id={`fin-${day}-${index}`}
                    value={creneau.fin}
                    onChange={(e) =>
                      handleCreneauChange(day, index, "fin", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor={`personnes-${day}-${index}`}>Personnes</Label>
                  <Input
                    type="number"
                    id={`personnes-${day}-${index}`}
                    value={creneau.personnes}
                    onChange={(e) =>
                      handleCreneauChange(
                        day,
                        index,
                        "personnes",
                        parseInt(e.target.value)
                      )
                    }
                  />
                </div>
                {creneaux[day].length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveCreneau(day, index)}
                  >
                    Supprimer
                  </Button>
                )}
              </div>
            ))}
          <Button variant="secondary" onClick={() => handleAddCreneau(day)}>
            Ajouter un créneau
          </Button>
        </div>
      ))}

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Création..." : "Créer la commande"}
      </Button>
    </form>
  );
};

export default CommandeForm;
