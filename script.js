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
window.supabaseClient = supabaseClient;

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
 * Redirige l'utilisateur s'il n'est pas autorisé sur la page courante.
 * @param {object} session Session actuelle Supabase.
 */
function handlePageAccess(session) {
  const currentPath = window.location.pathname;
  const isIndexPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/');
  const isLoginPage = currentPath.endsWith('login.html');
  const isSignupPage = currentPath.endsWith('signup.html');

  // Si l'utilisateur est connecté et sur login/signup, on le redirige vers l'accueil
  if (session && (isLoginPage || isSignupPage)) {
    window.location.href = 'index.html';
  }
}

// --- INITIALISATION GENERALE DE LA SESSION ---

document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const isIndexPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('/');
  const isLoginPage = currentPath.endsWith('login.html');
  const isSignupPage = currentPath.endsWith('signup.html');

  // Éléments du DOM globaux
  const loadingOverlay = document.getElementById('loading-overlay');
  const navVisitor = document.getElementById('nav-visitor');
  const navStudent = document.getElementById('nav-student');
  const navUserEmail = document.getElementById('nav-user-email');
  const btnLogoutNav = document.getElementById('btn-logout-nav');

  // Éléments du menu dropdown
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const menuDropdownContent = document.getElementById('menu-dropdown-content');
  const menuLinkDashboard = document.getElementById('menu-link-dashboard');
  const menuUserInfo = document.getElementById('menu-user-info');
  const menuUserEmailSpan = document.getElementById('menu-user-email');
  const menuLinkLogin = document.getElementById('menu-link-login');
  const menuLinkSignup = document.getElementById('menu-link-signup');
  const menuBtnLogout = document.getElementById('menu-btn-logout');

  const menuBtnYear1 = document.getElementById('menu-btn-year1');
  const menuBtnYear2 = document.getElementById('menu-btn-year2');
  const menuBtnYear3 = document.getElementById('menu-btn-year3');

  // Éléments du DOM d'index.html
  const visitorContainer = document.getElementById('visitor-container');
  const studentContainer = document.getElementById('student-container');
  const userYearBadge = document.getElementById('user-year-badge');
  const userSubBadge = document.getElementById('user-sub-badge');

  // Variables globales de session courante
  let currentSession = null;

  // Gestionnaire de clic pour afficher/masquer le menu dropdown
  if (menuToggleBtn && menuDropdownContent) {
    menuToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuDropdownContent.classList.toggle('hidden');
      menuToggleBtn.classList.toggle('active');
    });
  }

  // Fermer le menu si on clique en dehors
  document.addEventListener('click', (e) => {
    if (menuDropdownContent && !menuDropdownContent.classList.contains('hidden')) {
      if (!menuDropdownContent.contains(e.target) && e.target !== menuToggleBtn && !menuToggleBtn.contains(e.target)) {
        menuDropdownContent.classList.add('hidden');
        menuToggleBtn.classList.remove('active');
      }
    }
  });

  // Fermer le menu sur touche Échap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuDropdownContent && !menuDropdownContent.classList.contains('hidden')) {
      menuDropdownContent.classList.add('hidden');
      menuToggleBtn.classList.remove('active');
    }
  });

  // Fonction pour charger et afficher dynamiquement des cours à la demande
  function handleYearSelection(yearName) {
    if (menuDropdownContent) {
      menuDropdownContent.classList.add('hidden');
    }

    if (!currentSession) {
      showAlert("Veuillez vous connecter pour accéder à l'espace de cours de la " + yearName + ".", "error");
      // Rediriger vers la page d'accueil pour que l'utilisateur voie le message d'alerte s'il n'y est pas
      if (!isIndexPage) {
        localStorage.setItem('redirect_alert_message', "Veuillez vous connecter pour accéder aux cours de la " + yearName + ".");
        localStorage.setItem('redirect_alert_type', "error");
        window.location.href = 'index.html';
      }
      return;
    }

    if (isIndexPage) {
      // Mettre à jour l'affichage de l'année académique de manière temporaire/active
      if (userYearBadge) {
        userYearBadge.textContent = yearName;
      }
      // Rendu dynamique des cours correspondants
      renderCourses(yearName);
      // Scroll fluide vers le container étudiant/les cours
      const coursesSection = document.getElementById('student-container');
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Stocker l'année sélectionnée pour le rendu après redirection vers index.html
      localStorage.setItem('selected_academic_year', yearName);
      window.location.href = 'index.html';
    }
  }

  // Événements pour les boutons d'année du menu dropdown
  if (menuBtnYear1) menuBtnYear1.addEventListener('click', () => handleYearSelection('1ère année INSPEM'));
  if (menuBtnYear2) menuBtnYear2.addEventListener('click', () => handleYearSelection('2ème année INSPEM'));
  if (menuBtnYear3) menuBtnYear3.addEventListener('click', () => handleYearSelection('3ème année INSPEM'));

  // S'il y avait un message d'alerte stocké en localStorage après redirection
  const storedAlert = localStorage.getItem('redirect_alert_message');
  const storedAlertType = localStorage.getItem('redirect_alert_type');
  if (storedAlert) {
    showAlert(storedAlert, storedAlertType || 'error');
    localStorage.removeItem('redirect_alert_message');
    localStorage.removeItem('redirect_alert_type');
  }

  // Écoute de l'état d'authentification Supabase (Maintien de session après refresh)
  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    console.log("Événement d'authentification :", event);
    currentSession = session;

    // Fermeture de l'overlay de chargement dès que l'état initial est connu
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }

    // Gestion de l'accès aux pages
    handlePageAccess(session);

    if (session) {
      // --- UTILISATEUR CONNECTÉ ---
      const user = session.user;

      // Affichage du menu étudiant connecté
      if (navStudent) navStudent.classList.remove('hidden');
      if (navUserEmail) navUserEmail.textContent = user.email;
      if (navVisitor) navVisitor.classList.add('hidden');

      // Mettre à jour les éléments visibles du menu Dropdown
      if (menuLinkDashboard) menuLinkDashboard.classList.remove('hidden');
      if (menuUserInfo) menuUserInfo.classList.remove('hidden');
      if (menuUserEmailSpan) menuUserEmailSpan.textContent = user.email;
      if (menuLinkLogin) menuLinkLogin.classList.add('hidden');
      if (menuLinkSignup) menuLinkSignup.classList.add('hidden');
      if (menuBtnLogout) menuBtnLogout.classList.remove('hidden');

      // Si nous sommes sur la page d'accueil/dashboard (index.html)
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

          let finalYear = "1ère année INSPEM";
          let finalSub = "Gratuit";

          if (dbError) {
            console.warn("Impossible de récupérer les infos de la table 'users' :", dbError);
            if (userYearBadge) userYearBadge.textContent = "Année non spécifiée";
            if (userSubBadge) userSubBadge.textContent = "Abonnement standard";
          } else if (userData) {
            finalYear = userData.annee_academique || "1ère année INSPEM";
            finalSub = userData.statut_abonnement || "Gratuit";

            if (userYearBadge) userYearBadge.textContent = finalYear;
            if (userSubBadge) userSubBadge.textContent = finalSub;
          }

          // Vérifier s'il y a une année sélectionnée depuis le menu sur une autre page
          const storedYear = localStorage.getItem('selected_academic_year');
          if (storedYear) {
            finalYear = storedYear;
            localStorage.removeItem('selected_academic_year');
            if (userYearBadge) userYearBadge.textContent = finalYear;
          }

          // Rendu dynamique des cours correspondants
          renderCourses(finalYear);

        } catch (err) {
          console.error("Erreur inattendue lors de la récupération utilisateur :", err);
        }
      }
    } else {
      // --- UTILISATEUR NON CONNECTÉ ---
      if (navStudent) navStudent.classList.add('hidden');
      if (navVisitor) navVisitor.classList.remove('hidden');

      // Mettre à jour les éléments visibles du menu Dropdown
      if (menuLinkDashboard) menuLinkDashboard.classList.add('hidden');
      if (menuUserInfo) menuUserInfo.classList.add('hidden');
      if (menuLinkLogin) menuLinkLogin.classList.remove('hidden');
      if (menuLinkSignup) menuLinkSignup.classList.remove('hidden');
      if (menuBtnLogout) menuBtnLogout.classList.add('hidden');

      if (isIndexPage) {
        if (visitorContainer) visitorContainer.classList.remove('hidden');
        if (studentContainer) studentContainer.classList.add('hidden');
      }
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
          // 1. Inscription dans Supabase Auth
          const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password
          });

          if (authError) {
            showAlert(`Erreur d'inscription : ${authError.message}`, 'error');
            setButtonLoading(submitBtn, false, originalBtnText);
            return;
          }

          const authUser = authData?.user;

          if (authUser) {
            // 2. Création automatique de la ligne correspondante dans la table 'users'
            const { error: dbError } = await supabaseClient
              .from('users')
              .insert([
                {
                  id: authUser.id,
                  email: authUser.email,
                  annee_academique: academicYear,
                  statut_abonnement: 'Gratuit' // Valeur par défaut
                }
              ]);

            if (dbError) {
              console.error("Erreur lors de l'insertion dans la table 'users' :", dbError);
              showAlert(`Inscription Auth réussie, mais échec de création du profil : ${dbError.message}`, 'error');
              setButtonLoading(submitBtn, false, originalBtnText);
              return;
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
          if (document.getElementById('btn-submit') && !document.getElementById('btn-submit').disabled) {
            setButtonLoading(submitBtn, false, originalBtnText);
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
  const handleLogout = async () => {
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
  };

  if (btnLogoutNav) {
    btnLogoutNav.addEventListener('click', handleLogout);
  }
  if (menuBtnLogout) {
    menuBtnLogout.addEventListener('click', handleLogout);
  }
});