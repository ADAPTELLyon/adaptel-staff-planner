
// Date utility functions

// Get the current week number
export const getCurrentWeekNumber = (date: Date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
};

// Get the current year
export const getCurrentYear = (date: Date = new Date()) => {
  return date.getFullYear();
};

// Generate week dates
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
      enRecherche: 0 // Will be populated later if needed
    };
  });
};

// Format a date to YYYY-MM-DD
export const formatDateToISOString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Generate week options for select
export const generateWeekOptions = (currentYear: number) => {
  const options = [];
  const now = new Date();
  const currentWeek = getCurrentWeekNumber(now);
  
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
