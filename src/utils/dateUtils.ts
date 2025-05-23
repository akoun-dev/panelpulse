/**
 * Convertit une date ISO en format datetime-local pour les inputs HTML
 * @param isoDate - Date au format ISO (ex: 2025-01-08T08:00:00+00:00)
 * @returns Date au format datetime-local (ex: 2025-01-08T08:00)
 */
export const formatISOToDatetimeLocal = (isoDate: string | null | undefined): string => {
  if (!isoDate) return '';
  
  try {
    // Créer un objet Date à partir de la date ISO
    const date = new Date(isoDate);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.error('Date invalide:', isoDate);
      return '';
    }
    
    // Formater la date au format YYYY-MM-DDThh:mm
    // padStart est utilisé pour s'assurer que les nombres ont 2 chiffres
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Erreur lors de la conversion de la date:', error);
    return '';
  }
};

/**
 * Convertit une date au format datetime-local en format ISO
 * @param localDate - Date au format datetime-local (ex: 2025-01-08T08:00)
 * @returns Date au format ISO (ex: 2025-01-08T08:00:00.000Z)
 */
export const formatDatetimeLocalToISO = (localDate: string | null | undefined): string => {
  if (!localDate) return '';
  
  try {
    // Créer un objet Date à partir de la date locale
    const date = new Date(localDate);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.error('Date invalide:', localDate);
      return '';
    }
    
    // Convertir en format ISO
    return date.toISOString();
  } catch (error) {
    console.error('Erreur lors de la conversion de la date:', error);
    return '';
  }
};
