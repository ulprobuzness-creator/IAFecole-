# IAFECOLE - Plateforme Éducative INSPEM 🎓

Ce dépôt contient le code source de la plateforme éducative IAFECOLE, conçue pour les étudiants de l'INSPEM (Université Nationale du Pétrole et de l'Énergie).

## Résolution du problème de déconnexion automatique après inscription 🛠️

Le problème où les utilisateurs se retrouvaient déconnectés automatiquement ou devaient se reconnecter/réinscrire immédiatement après avoir validé l'inscription et accepté les règles de la direction provient du fait que Supabase Auth n'établissait pas une session active et validée si le compte n'était pas expressément confirmé sur le serveur Supabase.

Nous avons résolu ce problème à deux niveaux :
1. **Côté client (`script.js`)** : Connexion explicite automatique via `signInWithPassword()` dès la validation réussie du code de sécurité OTP.
2. **Côté base de données (`supabase_setup.sql`)** : Ajout d'une mise à jour automatique dans le déclencheur (trigger) PostgreSQL pour confirmer instantanément l'email et le numéro de téléphone lors de la création d'un nouvel utilisateur Auth, contournant ainsi tout blocage de sécurité lié à l'exigence de confirmation.

---

### Étapes pour appliquer les corrections sur votre projet Supabase 🚀

Pour que ces corrections fonctionnent pleinement sur votre instance de production Supabase, vous devez exécuter les deux actions suivantes dans votre console d'administration Supabase :

#### Action 1 : Mettre à jour le déclencheur de création d'utilisateur dans l'éditeur SQL Supabase
1. Allez sur votre [Console Supabase](https://supabase.com).
2. Ouvrez l'onglet **SQL Editor** dans le menu latéral gauche.
3. Créez une nouvelle requête (New Query).
4. Copiez et collez le script SQL complet disponible dans le fichier `supabase_setup.sql` de ce dépôt, ou simplement le bloc ci-dessous :

```sql
-- 1. Recréation de la fonction de gestion d'utilisateur avec auto-confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Copier l'étudiant dans la table public.users
  INSERT INTO public.users (id, email, annee_academique, statut_abonnement)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'annee_academique', '1ère année INSPEM'),
    'Gratuit'
  );

  -- Confirmer automatiquement l'email et le numéro de téléphone pour éviter d'être bloqué
  UPDATE auth.users
  SET
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    phone_confirmed_at = COALESCE(phone_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW())
  WHERE id = new.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recréation du trigger sur la table auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Notification pour vider le cache d'API
NOTIFY pgrst, 'reload schema';
```

5. Cliquez sur le bouton **Run** pour exécuter le script SQL.

#### Action 2 : Désactiver l'exigence de confirmation par email/téléphone (Optionnel mais recommandé)
Si vous ne souhaitez pas envoyer de vrais emails ou SMS de confirmation lors des tests ou de l'utilisation de l'application :
1. Sur votre console Supabase, allez dans **Authentication** > **Providers** > **Email**.
2. Désactivez l'option **Confirm email** (Confirmer l'adresse email).
3. Cliquez sur **Save**.
4. Procédez de même pour le fournisseur de numéro de téléphone (Phone) si vous l'utilisez, en désactivant la confirmation obligatoire de code OTP par vrai SMS.
