import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { getCurrentWeekNumber, generateWeekDates, formatDateToISOString } from "@/utils/dateUtils";

const DisponibiliteForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    candidat: "",
    semaine: getCurrentWeekNumber().toString(),
    annee: new Date().getFullYear().toString(),
    jours: [
      { jour_semaine: 1, date: "", disponible: false, creneaux: [] },
      { jour_semaine: 2, date: "", disponible: false, creneaux: [] },
      { jour_semaine: 3, date: "", disponible: false, creneaux: [] },
      { jour_semaine: 4, date: "", disponible: false, creneaux: [] },
      { jour_semaine: 5, date: "", disponible: false, creneaux: [] },
      { jour_semaine: 6, date: "", disponible: false, creneaux: [] },
      { jour_semaine: 7, date: "", disponible: false, creneaux: [] },
    ],
    commentaire: "",
  });
  
  const [candidats, setCandidats] = useState<{id: string, nom: string, prenom: string}[]>([]);
  const [weekDates, setWeekDates] = useState<any[]>([]);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  useEffect(() => {
    // Fetch candidats from Supabase
    const fetchCandidats = async () => {
      // Simulate fetching data (replace with actual Supabase fetch)
      setCandidats([
        { id: "1", nom: "Doe", prenom: "John" },
        { id: "2", nom: "Smith", prenom: "Jane" },
      ]);
    };
    
    fetchCandidats();
  }, []);
  
  useEffect(() => {
    // Generate week dates
    const weekNum = parseInt(formData.semaine);
    const year = parseInt(formData.annee);
    const dates = generateWeekDates(weekNum, year);
    setWeekDates(dates);
    
    // Update form data with dates
    setFormData(prev => ({
      ...prev,
      jours: prev.jours.map((jour, index) => ({
        ...jour,
        date: formatDateToISOString(dates[index].date)
      }))
    }));
  }, [formData.semaine, formData.annee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (index: number) => {
    setFormData(prev => {
      const updatedJours = [...prev.jours];
      updatedJours[index].disponible = !updatedJours[index].disponible;
      return { ...prev, jours: updatedJours };
    });
  };

  const handleCreneauChange = (index: number, creneauIndex: number, value: string) => {
    setFormData(prev => {
      const updatedJours = [...prev.jours];
      const updatedCreneaux = [...(updatedJours[index].creneaux || [])];
      updatedCreneaux[creneauIndex] = value;
      updatedJours[index].creneaux = updatedCreneaux;
      return { ...prev, jours: updatedJours };
    });
  };

  const addCreneau = (index: number) => {
    setFormData(prev => {
      const updatedJours = [...prev.jours];
      updatedJours[index].creneaux = [...(updatedJours[index].creneaux || []), ""];
      return { ...prev, jours: updatedJours };
    });
  };

  const removeCreneau = (index: number, creneauIndex: number) => {
    setFormData(prev => {
      const updatedJours = [...prev.jours];
      updatedJours[index].creneaux = updatedJours[index].creneaux?.filter((_, i) => i !== creneauIndex);
      return { ...prev, jours: updatedJours };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate submitting data (replace with actual Supabase insert)
    console.log("Form Data Submitted:", formData);
    
    // Close the dialog
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <Label htmlFor="candidat">Candidat</Label>
        <Select 
          value={formData.candidat}
          onValueChange={(value) => setFormData(prev => ({ ...prev, candidat: value }))}
        >
          <SelectTrigger id="candidat">
            <SelectValue placeholder="Sélectionner un candidat" />
          </SelectTrigger>
          <SelectContent>
            {candidats.map((candidat) => (
              <SelectItem key={candidat.id} value={candidat.id}>
                {candidat.prenom} {candidat.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="semaine">Semaine</Label>
          <Select
            value={formData.semaine}
            onValueChange={(value) => setFormData(prev => ({ ...prev, semaine: value }))}
          >
            <SelectTrigger id="semaine">
              <SelectValue placeholder="Sélectionner une semaine" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                <SelectItem key={week} value={week.toString()}>
                  {week}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="annee">Année</Label>
          <Input
            type="text"
            id="annee"
            name="annee"
            value={formData.annee}
            onChange={handleInputChange}
          />
        </div>
        
        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center" side="bottom">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date()
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((day, index) => (
          <Card key={index} className="p-4">
            <div className="flex flex-col items-center">
              <Label className="text-sm">{day.jourNom} {day.numero}</Label>
              <Checkbox
                id={`jour-${day.jour}`}
                checked={formData.jours[index].disponible}
                onCheckedChange={() => handleCheckboxChange(index)}
              />
            </div>
            
            {formData.jours[index].disponible && (
              <div className="mt-4">
                {formData.jours[index].creneaux?.map((creneau, creneauIndex) => (
                  <div key={creneauIndex} className="flex gap-2 items-center mb-2">
                    <Input
                      type="text"
                      placeholder="Créneau"
                      value={creneau}
                      onChange={(e) => handleCreneauChange(index, creneauIndex, e.target.value)}
                    />
                    <Button 
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeCreneau(index, creneauIndex)}
                    >
                      <span className="sr-only">Supprimer</span>
                      X
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addCreneau(index)}>
                  Ajouter un créneau
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div>
        <Label htmlFor="commentaire">Commentaire</Label>
        <Textarea
          id="commentaire"
          name="commentaire"
          value={formData.commentaire}
          onChange={handleInputChange}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  );
};

export default DisponibiliteForm;
