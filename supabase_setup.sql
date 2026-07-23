-- Supabase Database Configuration Setup
-- Ce script configure la table public.users et le trigger on_auth_user_created
-- pour copier automatiquement les nouveaux étudiants de auth.users vers public.users.

-- 1. Création de la table public.users si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  annee_academique TEXT DEFAULT '1ère année INSPEM',
  statut_abonnement TEXT DEFAULT 'Gratuit',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Active la Row Level Security (RLS) sur la table public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Crée des politiques d'accès RLS simples
CREATE POLICY "Les utilisateurs peuvent lire leur propre profil"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- 2. Fonction de gestion lors de la création d'un nouvel utilisateur Auth
-- Confirme automatiquement l'utilisateur pour contourner les blocages liés à "Email not confirmed"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insertion dans public.users
  INSERT INTO public.users (id, email, annee_academique, statut_abonnement)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'annee_academique', '1ère année INSPEM'),
    'Gratuit'
  );

  -- Confirmation automatique dans auth.users (nécessite SECURITY DEFINER)
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    phone_confirmed_at = COALESCE(phone_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
  WHERE id = new.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger pour exécuter la fonction automatiquement après insertion dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Recharger le schéma PostgREST pour vider le cache et résoudre le problème "Could not find the table public.users"
NOTIFY pgrst, 'reload schema';
