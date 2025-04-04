
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export interface Commande {
  id: string;
  client_id: string | null;
  client_nom: string;
  secteur: string | null;
  statut: string;
  semaine: number;
  annee: number;
  created_at: string;
  updated_at: string;
}

export interface CommandeJour {
  id: string;
  commande_id: string | null;
  jour_semaine: number;
  jour_date: string;
  statut: string | null;
  candidat: string | null;
  creneaux: string[] | null;
  couleur_fond: string | null;
  couleur_texte: string | null;
  created_at: string;
  updated_at: string;
}

export interface Indicateur {
  nom: string;
  valeur: number;
  couleur: string;
  icone: string;
}

// Get the current week number
export const getCurrentWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
};

// Get week number from a date
export const getWeekNumber = (date: Date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Get the current year
export const getCurrentYear = () => {
  return new Date().getFullYear();
};

// Generate the week dates
export const generateWeekDates = (weekNumber: number, year: number) => {
  // Calculate the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Calculate the first day of the week (considering Monday as the first day)
  const firstDayOfWeek = new Date(year, 0, 1 + (weekNumber - 1) * 7 - firstDayOfYear.getDay() + (firstDayOfYear.getDay() === 0 ? -6 : 1));
  
  // Generate the dates for the week
  return Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + idx);
    return {
      date,
      jour: idx + 1, // 1 = Monday, 7 = Sunday
      jourNom: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"][idx],
      numero: date.getDate(),
      mois: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"][date.getMonth()],
      enRecherche: 0 // Will be populated later
    };
  });
};

// Fetch commandes for a specific week
export const fetchCommandesForWeek = async (semaine: number, annee: number) => {
  try {
    const { data: commandes, error: commandesError } = await supabase
      .from("commandes")
      .select("*")
      .eq("semaine", semaine)
      .eq("annee", annee);
    
    if (commandesError) {
      throw commandesError;
    }
    
    // For each commande, fetch the commande_jours data
    const commandesWithJours = await Promise.all(commandes.map(async (commande) => {
      const { data: jours, error: joursError } = await supabase
        .from("commande_jours")
        .select("*")
        .eq("commande_id", commande.id)
        .order("jour_semaine");
        
      if (joursError) {
        throw joursError;
      }
      
      return {
        ...commande,
        jours: jours || []
      };
    }));
    
    return commandesWithJours;
  } catch (error) {
    console.error("Error fetching commandes:", error);
    throw error;
  }
};

// Calculate indicators based on commandes
export const calculateIndicators = (commandes: any[]) => {
  const indicators = [
    { nom: "En recherche", valeur: 0, couleur: "#ffe599", icone: "Search" },
    { nom: "Demandées", valeur: commandes.length, couleur: "#cfe2f3", icone: "ClipboardList" },
    { nom: "Validées", valeur: 0, couleur: "#d9ead3", icone: "Check" },
    { nom: "Non pourvue", valeur: 0, couleur: "#dd7e6b", icone: "AlertTriangle" },
  ];
  
  // Count by status
  commandes.forEach(commande => {
    if (commande.jours) {
      commande.jours.forEach((jour: CommandeJour) => {
        if (jour.statut === "En recherche") {
          indicators[0].valeur++;
        } else if (jour.statut === "Validé") {
          indicators[2].valeur++;
        } else if (jour.statut === "Non pourvue") {
          indicators[3].valeur++;
        }
      });
    }
  });
  
  return indicators;
};

// Create a new commande
export const createCommande = async (data: any) => {
  try {
    // Create commande
    const { data: commande, error: commandeError } = await supabase
      .from("commandes")
      .insert([{
        client_nom: data.client_nom,
        client_id: data.client_id,
        secteur: data.secteur,
        statut: data.statut,
        semaine: data.semaine,
        annee: data.annee
      }])
      .select();
      
    if (commandeError) {
      throw commandeError;
    }
    
    if (!commande || commande.length === 0) {
      throw new Error("Failed to create commande");
    }
    
    // Create commande_jours for each jour in the week
    const jourPromises = data.jours.map(async (jour: any) => {
      const { error: jourError } = await supabase
        .from("commande_jours")
        .insert([{
          commande_id: commande[0].id,
          jour_semaine: jour.jour_semaine,
          jour_date: jour.jour_date,
          statut: jour.statut,
          candidat: jour.candidat,
          creneaux: jour.creneaux,
          couleur_fond: jour.couleur_fond,
          couleur_texte: jour.couleur_texte
        }]);
        
      if (jourError) {
        throw jourError;
      }
    });
    
    await Promise.all(jourPromises);
    
    return commande[0];
  } catch (error) {
    console.error("Error creating commande:", error);
    throw error;
  }
};

// Map statuts to colors
export const getStatusColors = (statut: string) => {
  switch (statut) {
    case "En recherche":
      return { couleur_fond: "#ffe599", couleur_texte: "#000000" };
    case "Validé":
      return { couleur_fond: "#d9ead3", couleur_texte: "#000000" };
    case "Non pourvue":
      return { couleur_fond: "#dd7e6b", couleur_texte: "#ffffff" };
    default:
      return { couleur_fond: "#ffffff", couleur_texte: "#000000" };
  }
}

// List available sectors
export const SECTEURS = ["Cuisine", "Salle", "Plonge", "Réception", "Étages"];

// Generate week options for select
export const generateWeekOptions = (currentYear: number) => {
  const options = [];
  const now = new Date();
  const currentWeek = getCurrentWeekNumber();
  
  // Generate options for 5 weeks before and 10 weeks after current week
  for (let i = -5; i <= 10; i++) {
    const weekNum = currentWeek + i;
    if (weekNum > 0 && weekNum <= 52) {
      const weekDates = generateWeekDates(weekNum, currentYear);
      const firstDate = weekDates[0].date;
      const lastDate = weekDates[6].date;
      
      const formattedFirstDate = `${firstDate.getDate()} ${["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"][firstDate.getMonth()]}`;
      const formattedLastDate = `${lastDate.getDate()} ${["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"][lastDate.getMonth()]}`;
      
      options.push({
        value: weekNum.toString(),
        label: `Semaine ${weekNum} - du ${formattedFirstDate} au ${formattedLastDate}`
      });
    }
  }
  
  return options;
};
