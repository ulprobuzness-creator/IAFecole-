/**
 * script.js - Gestion de l'authentification et de la base de données Supabase pour IAFECOLE.
 *
 * Ce fichier gère l'initialisation du client Supabase, l'inscription, la connexion,
 * la déconnexion, ainsi que le contrôle d'accès aux pages et le rendu dynamique des cours.
 */

// Configuration de Supabase
const SUPABASE_URL = "https://iirnqybvolpjlmfymfvb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_cb9sZ5aPun1HqWq_6zjc4Q_zPseLR80";

// Initialisation du client Supabase
if (typeof supabase === 'undefined') {
  console.error("Le SDK Supabase n'est pas chargé. Assurez-vous d'inclure le script CDN de Supabase.");
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Base de données des cours par année académique pour un rendu dynamique élégant
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
 * Affiche un message d'alerte (succès ou erreur) à l'utilisateur.
 * @param {string} message Le texte à afficher.
 * @param {string} type Le type d'alerte ('success' ou 'error').
 */
function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alert-box');
  if (!alertBox) return;

  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
  alertBox.style.display = 'block';

  // Défilement automatique vers l'alerte pour une meilleure UX
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
 * Active ou désactive l'état de chargement d'un bouton.
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

  // Récupération des cours correspondant à l'année
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

// --- SÉCURITÉ & SESSION ---

/**
 * Détermine le type de page sur laquelle l'utilisateur navigue (compatible URLs propres Vercel).
 */
function getPageType() {
  const path = window.location.pathname.toLowerCase();
  const isLoginPage = path.includes('login');
  const isSignupPage = path.includes('signup');
  const isIndexPage = !isLoginPage && !isSignupPage;
  return { isLoginPage, isSignupPage, isIndexPage };
}

/**
 * Redirige l'utilisateur s'il n'est pas autorisé sur la page courante.
 * @param {object} session Session actuelle Supabase.
 */
function handlePageAccess(session) {
  const { isLoginPage, isSignupPage } = getPageType();

  // Si l'utilisateur est connecté et sur login/signup, on le redirige vers l'accueil
  if (session && (isLoginPage || isSignupPage)) {
    window.location.href = 'index.html';
  }
}

// --- INITIALISATION GENERALE DE LA SESSION ---

document.addEventListener('DOMContentLoaded', () => {
  const { isLoginPage, isSignupPage, isIndexPage } = getPageType();

  // Éléments du DOM globaux
  const loadingOverlay = document.getElementById('loading-overlay');
  const navVisitor = document.getElementById('nav-visitor');
  const navStudent = document.getElementById('nav-student');
  const navUserEmail = document.getElementById('nav-user-email');
  const btnLogoutNav = document.getElementById('btn-logout-nav');

  // Éléments du DOM d'index.html
  const visitorContainer = document.getElementById('visitor-container');
  const studentContainer = document.getElementById('student-container');
  const userYearBadge = document.getElementById('user-year-badge');
  const userSubBadge = document.getElementById('user-sub-badge');

  // Écoute de l'état d'authentification Supabase (Maintien de session après refresh)
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log("Événement d'authentification :", event);

    // Gestion de l'accès aux pages
    handlePageAccess(session);

    if (session) {
      // --- UTILISATEUR CONNECTÉ ---
      const user = session.user;

      // Affichage du menu étudiant connecté
      if (navStudent) navStudent.classList.remove('hidden');
      if (navUserEmail) navUserEmail.textContent = user.email;
      if (navVisitor) navVisitor.classList.add('hidden');

      // Si nous sommes sur la page d'accueil/dashboard
      if (isIndexPage) {
        if (visitorContainer) visitorContainer.classList.add('hidden');
        if (studentContainer) studentContainer.classList.remove('hidden');

        // Récupération des informations complémentaires depuis la table 'users'
        try {
          const { data: userData, error: dbError } = await supabaseClient
            .from('users')
            .select('annee_academique, statut_abonnement')
            .eq('id', user.id)
            .single();

          if (dbError) {
            console.warn("Impossible de récupérer les infos de la table 'users' :", dbError);

            // Tentative de récupération des métadonnées stockées dans Auth (fallback robuste)
            const fallbackYear = user.user_metadata?.annee_academique || "1ère année INSPEM";
            const fallbackSub = user.user_metadata?.statut_abonnement || "Gratuit";

            if (userYearBadge) userYearBadge.textContent = fallbackYear;
            if (userSubBadge) userSubBadge.textContent = fallbackSub;

            renderCourses(fallbackYear);
          } else if (userData) {
            // Mise à jour de l'interface avec les données de la table 'users'
            const academicYear = userData.annee_academique || "1ère année INSPEM";
            const subscriptionStatus = userData.statut_abonnement || "Gratuit";

            if (userYearBadge) userYearBadge.textContent = academicYear;
            if (userSubBadge) userSubBadge.textContent = subscriptionStatus;

            // Rendu dynamique des cours correspondants
            renderCourses(academicYear);
          }
        } catch (err) {
          console.error("Erreur inattendue lors de la récupération utilisateur :", err);
        }
      }
    } else {
      // --- UTILISATEUR NON CONNECTÉ ---
      if (navStudent) navStudent.classList.add('hidden');
      if (navVisitor) navVisitor.classList.remove('hidden');

      if (isIndexPage) {
        if (visitorContainer) visitorContainer.classList.remove('hidden');
        if (studentContainer) studentContainer.classList.add('hidden');
      }
    }

    // Masquage de l'overlay de chargement une fois l'affichage complètement résolu
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  });

  // --- GESTION DU FORMULAIRE D'INSCRIPTION (signup.html) ---
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
          // 1. Inscription dans Supabase Auth (avec métadonnées pour parer aux soucis de RLS)
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
            showAlert(`Erreur d'inscription : ${authError.message}`, 'error');
            setButtonLoading(submitBtn, false, originalBtnText);
            return;
          }

          const authUser = authData?.user;

          if (authUser) {
            // 2. Création ou mise à jour (upsert) automatique du profil de la table 'users'
            const { error: dbError } = await supabaseClient
              .from('users')
              .upsert({
                id: authUser.id,
                email: authUser.email,
                annee_academique: academicYear,
                statut_abonnement: 'Gratuit'
              });

            if (dbError) {
              console.warn("Échec d'upsert dans la table 'users' (possible restriction RLS) :", dbError);
              // On ne bloque pas si l'utilisateur a pu s'inscrire, car le fallback par métadonnées prendra le relais
            }

            // Gestion de la confirmation d'email (si configurée dans Supabase)
            if (authData.session === null) {
              showAlert("Inscription réussie ! Un email de confirmation vous a été envoyé. Veuillez le valider pour vous connecter.", "success");
              signupForm.reset();
            } else {
              // Si la confirmation d'email n'est pas requise, la session est ouverte immédiatement
              showAlert("Inscription réussie ! Redirection en cours...", "success");
              setTimeout(() => {
                window.location.href = 'index.html';
              }, 1500);
            }
          }
        } catch (err) {
          console.error("Erreur inattendue :", err);
          showAlert(`Une erreur inattendue est survenue : ${err.message}`, 'error');
        } finally {
          const btn = document.getElementById('btn-submit');
          if (btn && !btn.disabled) {
            setButtonLoading(btn, false, originalBtnText);
          }
        }
      });
    }
  }

  // --- GESTION DU FORMULAIRE DE CONNEXION (login.html) ---
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
          // Connexion avec email et mot de passe
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
          console.error("Erreur inattendue :", err);
          showAlert(`Une erreur inattendue est survenue : ${err.message}`, 'error');
          setButtonLoading(submitBtn, false, originalBtnText);
        }
      });
    }
  }

  // --- GESTION DE LA DECONNEXION ---
  if (btnLogoutNav) {
    btnLogoutNav.addEventListener('click', async () => {
      try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
          console.error("Erreur lors de la déconnexion :", error);
          showAlert(`Erreur lors de la déconnexion : ${error.message}`, 'error');
        } else {
          window.location.href = 'index.html';
        }
      } catch (err) {
        console.error("Erreur inattendue de déconnexion :", err);
      }
    });
  }
});
