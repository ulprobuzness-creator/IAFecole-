/**
 * header.js - Gestionnaire de l'en-tête, du profil utilisateur et des téléchargements.
 *
 * Ce script gère l'état d'authentification pour mettre à jour l'avatar,
 * calculer les initiales, afficher le compteur de téléchargements restants depuis Supabase,
 * et gérer le menu déroulant de profil.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Sélection des éléments du DOM pour l'en-tête
  const headerDownloadsCounter = document.getElementById('header-downloads-counter');
  const navVisitorAuth = document.getElementById('nav-visitor-auth');
  const navProfileWrapper = document.getElementById('nav-profile-wrapper');
  const headerAvatarBtn = document.getElementById('header-avatar-btn');
  const headerProfileDropdown = document.getElementById('header-profile-dropdown');
  const headerProfileEmail = document.getElementById('header-profile-email');
  const headerLogoutBtn = document.getElementById('header-logout-btn');

  // Gérer l'ouverture/fermeture du dropdown profil
  if (headerAvatarBtn && headerProfileDropdown) {
    headerAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      headerProfileDropdown.classList.toggle('hidden');
    });
  }

  // Fermer le dropdown au clic à l'extérieur
  document.addEventListener('click', (e) => {
    if (headerProfileDropdown && !headerProfileDropdown.classList.contains('hidden')) {
      if (!headerProfileDropdown.contains(e.target) && e.target !== headerAvatarBtn) {
        headerProfileDropdown.classList.add('hidden');
      }
    }
  });

  // Fermer le dropdown sur touche Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && headerProfileDropdown && !headerProfileDropdown.classList.contains('hidden')) {
      headerProfileDropdown.classList.add('hidden');
    }
  });

  // Déterminer le client Supabase actif avec fallback robuste sur window
  const activeClient = window.supabaseClient || (typeof supabaseClient !== 'undefined' ? supabaseClient : null);

  // Gérer la déconnexion via le bouton de dropdown profil
  if (headerLogoutBtn && activeClient) {
    headerLogoutBtn.addEventListener('click', async () => {
      try {
        const { error } = await activeClient.auth.signOut();
        if (error) {
          console.error("Erreur déconnexion header :", error.message);
        } else {
          window.location.href = 'index.html';
        }
      } catch (err) {
        console.error("Erreur inattendue déconnexion header :", err);
      }
    });
  }

  /**
   * Calcule les initiales de l'utilisateur à partir de son email en tant que fallback robuste.
   * @param {string} email L'adresse email.
   * @returns {string} Les initiales (1 ou 2 lettres en majuscules).
   */
  function getInitialsFromEmail(email) {
    if (!email) return 'U';
    const localPart = email.split('@')[0];
    const parts = localPart.split(/[\._-]/); // découpe par point, tiret ou underscore

    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return localPart.charAt(0).toUpperCase();
  }

  /**
   * Met à jour le nombre de téléchargements restants depuis la table 'downloads'.
   * @param {string} userId L'identifiant de l'utilisateur connecté.
   */
  async function updateDownloadsCounter(userId) {
    if (!headerDownloadsCounter || !activeClient) return;

    try {
      // Tenter de compter les téléchargements de l'utilisateur
      const { count, error } = await activeClient
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.warn("Impossible de requêter la table 'downloads' (elle n'existe peut-être pas encore ou RLS active) :", error.message);
        // Fallback gracieux en affichant 5/5 restants
        headerDownloadsCounter.textContent = "5/5 téléchargements";
        headerDownloadsCounter.classList.remove('hidden');
        return;
      }

      // Calcul des téléchargements restants (sur un maximum de 5)
      const downloadCount = count || 0;
      const remaining = Math.max(0, 5 - downloadCount);
      headerDownloadsCounter.textContent = `${remaining}/5 téléchargements`;
      headerDownloadsCounter.classList.remove('hidden');
    } catch (err) {
      console.error("Erreur lors de la récupération des téléchargements :", err);
      headerDownloadsCounter.textContent = "5/5 téléchargements";
      headerDownloadsCounter.classList.remove('hidden');
    }
  }

  /**
   * Récupère le profil utilisateur et met à jour l'avatar de l'en-tête.
   * @param {object} user L'utilisateur connecté de Supabase Auth.
   */
  async function updateProfileAvatar(user) {
    if (!headerAvatarBtn || !headerProfileEmail || !activeClient) return;

    headerProfileEmail.textContent = user.email;

    // Calculer les initiales par défaut depuis l'email
    let initials = getInitialsFromEmail(user.email);
    headerAvatarBtn.textContent = initials;

    try {
      // Tenter de récupérer les informations complémentaires de l'utilisateur depuis la table 'users'
      const { data: userData, error: dbError } = await activeClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!dbError && userData) {
        // Tenter de trouver un prénom/nom ou initiales dans l'enregistrement
        const prenom = userData.prenom || userData.firstName;
        const nom = userData.nom || userData.lastName;
        const name = userData.name || userData.username;

        if (prenom && nom) {
          initials = (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
        } else if (name) {
          const nameParts = name.trim().split(/\s+/);
          if (nameParts.length >= 2) {
            initials = (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
          } else {
            initials = name.slice(0, 2).toUpperCase();
          }
        } else if (userData.initiales) {
          initials = userData.initiales.toUpperCase();
        }
        headerAvatarBtn.textContent = initials;
      }
    } catch (err) {
      console.warn("Impossible de charger les données du profil complet pour l'avatar :", err);
    }
  }

  // Écoute de l'état d'authentification pour adapter dynamiquement l'en-tête
  if (activeClient) {
    activeClient.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const user = session.user;

        // Afficher les éléments connectés, masquer le menu visiteur
        if (navProfileWrapper) navProfileWrapper.classList.remove('hidden');
        if (navVisitorAuth) navVisitorAuth.classList.add('hidden');

        // Mettre à jour l'avatar et les téléchargements
        await updateProfileAvatar(user);
        await updateDownloadsCounter(user.id);
      } else {
        // Mode visiteur non connecté
        if (navProfileWrapper) navProfileWrapper.classList.add('hidden');
        if (headerDownloadsCounter) headerDownloadsCounter.classList.add('hidden');
        if (navVisitorAuth) navVisitorAuth.classList.remove('hidden');
      }
    });
  }
});
