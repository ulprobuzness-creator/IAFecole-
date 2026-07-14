/**
 * script.js - Gestion de l'authentification et de la base de données Supabase pour IAFECOLE.
 *
 * Ce fichier gère l'initialisation du client Supabase, l'inscription, la connexion,
 * la déconnexion, ainsi que le contrôle d'accès aux pages, la gestion des sessions
 * persistantes, et le rendu dynamique des cours selon l'année académique.
 */

// Configuration de Supabase
const SUPABASE_URL = "https://iirnqybvolpjlmfymfvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpcm5xeWJ2b2xwamxtZnltZnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MDUyNzksImV4cCI6MjA5OTM4MTI3OX0.xJVvSLT11HGUEYz71w01pAkCFDhrMP923833M9ov2H4";

// Initialisation du client Supabase
if (typeof supabase === 'undefined') {
  console.error("Le SDK Supabase n'est pas chargé. Assurez-vous d'inclure le script CDN de Supabase.");
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Base de données locale de cours pour l'affichage dynamique par année académique
const COURSES_DATABASE = {
  "1ère année INSPEM": [
    {
      title: "Introduction à l'IA",
      tag: "Nouveau",
      desc: "Bases de l'apprentissage automatique, historique de l'IA et premiers pas avec Python.",
      lessons: 8
    },
    {
      title: "Mathématiques pour l'IA I",
      tag: "Important",
      desc: "Algèbre linéaire, matrices, et vecteurs essentiels pour comprendre les algorithmes d'IA.",
      lessons: 12
    },
    {
      title: "Algorithmique Fondamentale",
      tag: "En cours",
      desc: "Structures de données fondamentales et logique algorithmique pour le développement moderne.",
      lessons: 10
    }
  ],
  "2ème année INSPEM": [
    {
      title: "Machine Learning Supervisé",
      tag: "Recommandé",
      desc: "Régression linéaire, classification, arbres de décision et forêts aléatoires avec Scikit-Learn.",
      lessons: 15
    },
    {
      title: "Bases de Données & SQL",
      tag: "Essentiel",
      desc: "Modélisation relationnelle de données, indexation et requêtes complexes avec PostgreSQL.",
      lessons: 12
    },
    {
      title: "Introduction aux Réseaux de Neurones",
      tag: "Intermédiaire",
      desc: "Concepts du perceptron, fonctions d'activation, rétropropagation et premières architectures.",
      lessons: 10
    }
  ],
  "3ème année INSPEM": [
    {
      title: "Deep Learning & Vision",
      tag: "Avancé",
      desc: "Réseaux de neurones convolutifs (CNN), segmentation et traitement d'images avancés avec PyTorch.",
      lessons: 18
    },
    {
      title: "Traitement du Langage Naturel (NLP)",
      tag: "Spécialisé",
      desc: "Modèles de langage, Tokenisation, Transformers et applications avec HuggingFace.",
      lessons: 14
    },
    {
      title: "MLOps & Déploiement Cloud",
      tag: "Projet final",
      desc: "Déploiement en production, Docker, architectures FastAPI et intégration continue (CI/CD) de modèles d'IA.",
      lessons: 10
    }
  ]
};

// --- FONCTIONS UTILITAIRES ---

/**
 * Affiche un message d'alerte (succès ou erreur) à l'utilisateur dans l'interface.
 * @param {string} message Le texte à afficher.
 * @param {string} type Le type d'alerte ('success' ou 'error').
 */
function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alert-box');
  if (!alertBox) return;

  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
  alertBox.style.display = 'block';

  // Défilement automatique vers l'alerte pour une meilleure visibilité
  alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Masque la boîte d'alerte.
 */
function hideAlert() {
  const alertBox = document.getElementById('alert-box');
  if (alertBox) {
    alertBox.style.display = 'none';
    alertBox.className = 'alert hidden';
  }
}

/**
 * Active ou désactive l'état de chargement d'un bouton pour éviter les doubles clics.
 * @param {HTMLButtonElement} button Element bouton à modifier.
 * @param {boolean} isLoading État de chargement.
 * @param {string} originalText Texte original du bouton à restaurer.
 */
function setButtonLoading(button, isLoading, originalText) {
  if (!button) return;
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner-inline"></span> Opération en cours...';
  } else {
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

// --- LOGIQUE DES COURS ---

/**
 * Génère le rendu HTML des cours pour une année académique donnée.
 * @param {string} academicYear L'année académique de l'utilisateur.
 */
function renderCourses(academicYear) {
  const coursesListContainer = document.getElementById('courses-list');
  if (!coursesListContainer) return;

  coursesListContainer.innerHTML = '';

  // Récupération des cours correspondant à l'année académique
  const courses = COURSES_DATABASE[academicYear] || [];

  if (courses.length === 0) {
    coursesListContainer.innerHTML = '<p class="text-muted">Aucun cours disponible pour cette année académique.</p>';
    return;
  }

  courses.forEach(course => {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div class="course-header">
        <span class="course-tag">${course.tag}</span>
        <h4>${course.title}</h4>
      </div>
      <div class="course-body">
        <p class="course-description">${course.desc}</p>
        <div class="course-footer">
          <span class="course-lessons-count">
            📚 ${course.lessons} leçons
          </span>
          <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">Étudier</button>
        </div>
      </div>
    `;
    coursesListContainer.appendChild(card);
  });
}

// --- SÉCURITÉ & ACCÈS AUX PAGES ---

/**
 * Détermine le type de page sur laquelle l'utilisateur navigue actuellement.
 */
function getPageType() {
  const path = window.location.pathname.toLowerCase();
  const isLoginPage = path.includes('login');
  const isSignupPage = path.includes('signup');
  const isIndexPage = !isLoginPage && !isSignupPage;
  return { isLoginPage, isSignupPage, isIndexPage };
}

/**
 * Redirige l'utilisateur s'il tente d'accéder aux pages d'auth alors qu'il est connecté.
 * @param {object} session Session actuelle Supabase.
 */
function handlePageAccess(session) {
  const { isLoginPage, isSignupPage } = getPageType();

  // Si connecté, redirige de login ou signup vers l'accueil index.html
  if (session && (isLoginPage || isSignupPage)) {
    window.location.href = 'index.html';
  }
}

// --- GESTION DE LA SESSION ET INITIALISATION ---

document.addEventListener('DOMContentLoaded', () => {
  const { isLoginPage, isSignupPage, isIndexPage } = getPageType();

  // Éléments DOM globaux
  const loadingOverlay = document.getElementById('loading-overlay');
  const navVisitor = document.getElementById('nav-visitor');
  const navStudent = document.getElementById('nav-student');
  const navUserEmail = document.getElementById('nav-user-email');
  const btnLogoutNav = document.getElementById('btn-logout-nav');

  // Éléments DOM d'index.html (Espace étudiant & Espace Visiteur)
  const visitorContainer = document.getElementById('visitor-container');
  const studentContainer = document.getElementById('student-container');
  const userYearBadge = document.getElementById('user-year-badge');
  const userSubBadge = document.getElementById('user-sub-badge');

  // Écoute de l'état d'authentification de Supabase (Maintien de session après rafraîchissement)
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log("Événement d'authentification Supabase :", event);

    // Gérer les accès aux pages d'authentification en fonction de la session
    handlePageAccess(session);

    if (session) {
      // --- ÉTUDIANT CONNECTÉ ---
      const user = session.user;

      // Afficher le menu de l'étudiant, masquer celui des visiteurs
      if (navStudent) navStudent.classList.remove('hidden');
      if (navUserEmail) navUserEmail.textContent = user.email;
      if (navVisitor) navVisitor.classList.add('hidden');

      // Si nous sommes sur l'accueil (index.html)
      if (isIndexPage) {
        if (visitorContainer) visitorContainer.classList.add('hidden');
        if (studentContainer) studentContainer.classList.remove('hidden');

        try {
          // Tentative de récupération des métadonnées personnalisées depuis la table 'users'
          const { data: userData, error: dbError } = await supabaseClient
            .from('users')
            .select('annee_academique, statut_abonnement')
            .eq('id', user.id)
            .single();

          if (dbError) {
            console.warn("Récupération depuis la table 'users' échouée (politique RLS active ou table vide). Utilisation du fallback métadonnées :", dbError);

            // Fallback robuste : récupération des métadonnées directement stockées lors de l'auth.signUp
            const fallbackYear = user.user_metadata?.annee_academique || "1ère année INSPEM";
            const fallbackSub = user.user_metadata?.statut_abonnement || "Gratuit";

            if (userYearBadge) userYearBadge.textContent = fallbackYear;
            if (userSubBadge) userSubBadge.textContent = fallbackSub;

            renderCourses(fallbackYear);
          } else if (userData) {
            // Mise à jour de l'UI avec les valeurs de la base de données
            const academicYear = userData.annee_academique || "1ère année INSPEM";
            const subscriptionStatus = userData.statut_abonnement || "Gratuit";

            if (userYearBadge) userYearBadge.textContent = academicYear;
            if (userSubBadge) userSubBadge.textContent = subscriptionStatus;

            // Rendu dynamique des cours
            renderCourses(academicYear);
          }
        } catch (err) {
          console.error("Erreur système lors du chargement des données utilisateur :", err);
        }
      }
    } else {
      // --- UTILISATEUR VISITEUR ---
      if (navStudent) navStudent.classList.add('hidden');
      if (navVisitor) navVisitor.classList.remove('hidden');

      if (isIndexPage) {
        if (visitorContainer) visitorContainer.classList.remove('hidden');
        if (studentContainer) studentContainer.classList.add('hidden');
      }
    }

    // Masquer le chargement initial une fois l'état de la session résolu
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  });

  // --- LOGIQUE DU FORMULAIRE D'INSCRIPTION (signup.html) ---
  if (isSignupPage) {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const academicYear = document.getElementById('signup-year').value;
        const submitBtn = document.getElementById('btn-submit');
        const originalBtnText = submitBtn.innerHTML;

        setButtonLoading(submitBtn, true, originalBtnText);

        try {
          // 1. Inscription du compte utilisateur dans Supabase Auth
          // Nous incluons l'année académique dans user_metadata pour une double sécurité en cas d'erreurs RLS sur la table 'users'.
          const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                annee_academique: academicYear,
                statut_abonnement: 'Gratuit'
              }
            }
          });

          if (authError) {
            showAlert(`Erreur d'inscription Supabase Auth : ${authError.message}`, 'error');
            setButtonLoading(submitBtn, false, originalBtnText);
            return;
          }

          const authUser = authData?.user;

          if (authUser) {
            console.log("Utilisateur inscrit avec succès dans Supabase Auth :", authUser.id);

            // 2. Création de la ligne correspondante dans la table 'users'
            const { error: dbError } = await supabaseClient
              .from('users')
              .upsert({
                id: authUser.id,
                email: authUser.email,
                annee_academique: academicYear,
                statut_abonnement: 'Gratuit'
              });

            if (dbError) {
              console.error("Erreur lors de l'enregistrement dans la table 'users' :", dbError);

              // Affichage d'un avertissement instructif à destination du développeur ou de l'utilisateur
              showAlert(
                `Compte créé dans Supabase Auth, mais impossible d'insérer dans la table public.'users' : "${dbError.message}". \n` +
                `Si l'email de confirmation est activé, la table ne peut être écrite avant validation de l'email, ou vos politiques RLS bloquent l'écriture. \n` +
                `Vérifiez vos politiques RLS ou utilisez un trigger SQL (ex: on_auth_user_created).`,
                'error'
              );
              setButtonLoading(submitBtn, false, originalBtnText);
              return;
            }

            // Gestion de l'email de confirmation (si actif sur la console Supabase)
            if (authData.session === null) {
              showAlert("Inscription réussie ! Un email de confirmation vous a été envoyé. Veuillez le valider pour activer et vous connecter à votre compte.", "success");
              signupForm.reset();
            } else {
              // Si la validation par email n'est pas requise, on connecte directement l'utilisateur
              showAlert("Inscription réussie et profil enregistré ! Redirection en cours...", "success");
              setTimeout(() => {
                window.location.href = 'index.html';
              }, 1500);
            }
          }
        } catch (err) {
          console.error("Erreur inattendue durant l'inscription :", err);
          showAlert(`Une erreur système inattendue est survenue : ${err.message}`, 'error');
        } finally {
          const btn = document.getElementById('btn-submit');
          if (btn && !btn.disabled) {
            setButtonLoading(btn, false, originalBtnText);
          }
        }
      });
    }
  }

  // --- LOGIQUE DU FORMULAIRE DE CONNEXION (login.html) ---
  if (isLoginPage) {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const submitBtn = document.getElementById('btn-submit');
        const originalBtnText = submitBtn.innerHTML;

        setButtonLoading(submitBtn, true, originalBtnText);

        try {
          // Connexion de l'utilisateur
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
          });

          if (error) {
            showAlert(`Erreur de connexion : ${error.message}`, 'error');
            setButtonLoading(submitBtn, false, originalBtnText);
            return;
          }

          if (data?.session) {
            showAlert("Connexion réussie ! Redirection en cours...", "success");
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 1000);
          }
        } catch (err) {
          console.error("Erreur inattendue durant la connexion :", err);
          showAlert(`Une erreur système inattendue est survenue : ${err.message}`, 'error');
          setButtonLoading(submitBtn, false, originalBtnText);
        }
      });
    }
  }

  // --- LOGIQUE DE DECONNEXION ---
  if (btnLogoutNav) {
    btnLogoutNav.addEventListener('click', async () => {
      try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
          console.error("Erreur lors de la déconnexion Supabase Auth :", error);
          showAlert(`Erreur lors de la déconnexion : ${error.message}`, 'error');
        } else {
          window.location.href = 'index.html';
        }
      } catch (err) {
        console.error("Erreur inattendue lors de la déconnexion :", err);
      }
    });
  }
});