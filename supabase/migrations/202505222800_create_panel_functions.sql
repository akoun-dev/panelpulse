-- Migration pour créer les fonctions liées aux panels

-- Fonction pour incrémenter le compteur de panels créés
CREATE OR REPLACE FUNCTION public.increment_panels_created(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET panels_created = COALESCE(panels_created, 0) + 1,
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''incrémentation du compteur de panels: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter le compteur de panels participés
CREATE OR REPLACE FUNCTION public.increment_panels_participated(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET panels_participated = COALESCE(panels_participated, 0) + 1,
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''incrémentation du compteur de panels participés: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter le compteur de questions répondues
CREATE OR REPLACE FUNCTION public.increment_questions_answered(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET questions_answered = COALESCE(questions_answered, 0) + 1,
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''incrémentation du compteur de questions répondues: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour le temps de parole total
CREATE OR REPLACE FUNCTION public.update_total_speaking_time(user_id UUID, minutes INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET total_speaking_time = COALESCE(total_speaking_time, 0) + minutes,
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de la mise à jour du temps de parole total: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
