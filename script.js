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

  // --- GESTION DES TABS D'AUTHENTIFICATION & OTP ---
  const tabEmail = document.getElementById('tab-email');
  const tabPhone = document.getElementById('tab-phone');
  const groupEmail = document.getElementById('group-email');
  const groupPhone = document.getElementById('group-phone');
  const signupMethod = document.getElementById('signup-method');
  const loginMethod = document.getElementById('login-method');
  const signupEmailInput = document.getElementById('signup-email');
  const signupPhoneInput = document.getElementById('signup-phone');
  const loginEmailInput = document.getElementById('login-email');
  const loginPhoneInput = document.getElementById('login-phone');

  // Gérer l'état des onglets
  if (tabEmail && tabPhone) {
    tabEmail.addEventListener('click', () => {
      tabEmail.classList.add('active');
      tabPhone.classList.remove('active');
      if (groupEmail) groupEmail.classList.remove('hidden');
      if (groupPhone) groupPhone.classList.add('hidden');
      if (signupMethod) signupMethod.value = 'email';
      if (loginMethod) loginMethod.value = 'email';

      if (signupEmailInput) signupEmailInput.setAttribute('required', 'true');
      if (signupPhoneInput) signupPhoneInput.removeAttribute('required');
      if (loginEmailInput) loginEmailInput.setAttribute('required', 'true');
      if (loginPhoneInput) loginPhoneInput.removeAttribute('required');
    });

    tabPhone.addEventListener('click', () => {
      tabPhone.classList.add('active');
      tabEmail.classList.remove('active');
      if (groupPhone) groupPhone.classList.remove('hidden');
      if (groupEmail) groupEmail.classList.add('hidden');
      if (signupMethod) signupMethod.value = 'phone';
      if (loginMethod) loginMethod.value = 'phone';

      if (signupPhoneInput) signupPhoneInput.setAttribute('required', 'true');
      if (signupEmailInput) signupEmailInput.removeAttribute('required');
      if (loginPhoneInput) loginPhoneInput.setAttribute('required', 'true');
      if (loginEmailInput) loginEmailInput.removeAttribute('required');
    });
  }

  // --- LOGIQUE OTP GLOBALE ET SIMULATION DE PUSH ---
  let generatedOTP = null;
  let activeOTPFlow = null; // 'signup' ou 'login'
  let pendingAuthData = {}; // Stocke les données de formulaire en attendant l'OTP

  function showSimulatedPushNotification(method, target, code) {
    const existing = document.getElementById('simulated-push-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.id = 'simulated-push-notification';
    notification.className = 'push-notification';

    let icon = method === 'email' ? '✉️ Gmail' : '💬 SMS';
    let intro = method === 'email' ? 'Nouveau message' : 'Nouveau SMS';

    notification.innerHTML = `
      <div class="push-notification-header">
        <span class="push-icon">${icon}</span>
        <span class="push-title">${intro}</span>
        <span class="push-time">À l'instant</span>
      </div>
      <div class="push-notification-body">
        <strong>IAFECOLE Securité</strong> : Votre code de vérification aléatoire est <span class="push-code">${code}</span>. Ne le partagez pas.
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    // Supprimer après 15 secondes
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 15000);
  }

  // Configuration de l'auto-tab des chiffres OTP
  const otpDigits = document.querySelectorAll('.otp-digit');
  if (otpDigits.length > 0) {
    otpDigits.forEach((digit, index) => {
      digit.addEventListener('input', (e) => {
        // Ne garder que les chiffres
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        if (e.target.value.length === 1 && index < otpDigits.length - 1) {
          otpDigits[index + 1].focus();
        }
      });
      digit.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value.length === 0 && index > 0) {
          otpDigits[index - 1].focus();
        }
      });
    });
  }

  // Déclencher le flux OTP
  function triggerOTPFlow(flowType, method, targetVal, authData) {
    generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
    activeOTPFlow = flowType;
    pendingAuthData = authData;

    // Afficher la notification push simulée
    showSimulatedPushNotification(method, targetVal, generatedOTP);

    // Mettre à jour l'overlay OTP
    const otpContainer = document.getElementById('otp-container');
    const otpChannel = document.getElementById('otp-channel');

    if (otpChannel) {
      otpChannel.textContent = method === 'email' ? `votre Gmail (${targetVal})` : `votre numéro mobile (${targetVal})`;
    }

    if (otpContainer) {
      otpContainer.classList.remove('hidden');
    }

    // Masquer le formulaire actif
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    if (signupForm) signupForm.classList.add('hidden');
    if (loginForm) loginForm.classList.add('hidden');

    // Focus sur le premier input
    if (otpDigits.length > 0) {
      otpDigits[0].focus();
    }

    showAlert("Un code de vérification aléatoire vous a été envoyé pour des raisons de sécurité.", "success");
  }

  // Validation du code OTP saisi
  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', async () => {
      let enteredCode = "";
      otpDigits.forEach(digit => {
        enteredCode += digit.value;
      });

      if (enteredCode.length < 6) {
        showAlert("Veuillez saisir les 6 chiffres du code de sécurité.", "error");
        return;
      }

      if (enteredCode !== generatedOTP) {
        showAlert("Le code de validation saisi est incorrect. Veuillez réessayer.", "error");
        // Vider les champs
        otpDigits.forEach(digit => { digit.value = ""; });
        if (otpDigits.length > 0) otpDigits[0].focus();
        return;
      }

      // Code correct ! Procéder avec l'authentification correspondante
      hideAlert();
      const verifyBtnText = btnVerifyOtp.innerHTML;
      setButtonLoading(btnVerifyOtp, true, verifyBtnText);

      try {
        if (activeOTPFlow === 'signup') {
          // --- FLUX INSCRIPTION ---
          const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: pendingAuthData.email,
            password: pendingAuthData.password
          });

          if (authError) {
            showAlert(`Erreur d'inscription : ${authError.message}`, 'error');
            setButtonLoading(btnVerifyOtp, false, verifyBtnText);
            return;
          }

          const authUser = authData?.user;
          if (authUser) {
            // Création dans la table 'users'
            const { error: dbError } = await supabaseClient
              .from('users')
              .insert([
                {
                  id: authUser.id,
                  email: authUser.email,
                  annee_academique: pendingAuthData.academicYear,
                  statut_abonnement: 'Gratuit'
                }
              ]);

            if (dbError) {
              showAlert(`Inscription Auth réussie, mais échec de création du profil : ${dbError.message}`, 'error');
              setButtonLoading(btnVerifyOtp, false, verifyBtnText);
              return;
            }

            showAlert("Validation réussie et compte créé avec succès ! Redirection...", "success");
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 1500);
          }
        } else if (activeOTPFlow === 'login') {
          // --- FLUX CONNEXION ---
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: pendingAuthData.email,
            password: pendingAuthData.password
          });

          if (error) {
            showAlert(`Erreur de connexion : ${error.message}`, 'error');
            setButtonLoading(btnVerifyOtp, false, verifyBtnText);
            return;
          }

          if (data?.session) {
            showAlert("Validation réussie et connexion établie ! Redirection...", "success");
            setTimeout(() => {
              window.location.href = 'index.html';
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Erreur post-OTP :", err);
        showAlert(`Une erreur est survenue : ${err.message}`, 'error');
        setButtonLoading(btnVerifyOtp, false, verifyBtnText);
      }
    });
  }

  // Renvoyer le code
  const btnResendOtp = document.getElementById('btn-resend-otp');
  if (btnResendOtp) {
    btnResendOtp.addEventListener('click', () => {
      generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      showSimulatedPushNotification(pendingAuthData.method, pendingAuthData.targetVal, generatedOTP);
      showAlert("Un nouveau code de validation de sécurité a été renvoyé !", "success");
      otpDigits.forEach(digit => { digit.value = ""; });
      if (otpDigits.length > 0) otpDigits[0].focus();
    });
  }

  // --- GESTION DU FORMULAIRE D'INSCRIPTION (signup.html) ---
  if (isSignupPage) {
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();

        const method = signupMethod ? signupMethod.value : 'email';
        let email = "";
        let targetVal = "";

        if (method === 'email') {
          email = signupEmailInput.value.trim();
          targetVal = email;
          // Vérification rapide d'un Gmail ou adresse standard
          if (!email.includes('@')) {
            showAlert("Veuillez saisir une adresse email valide.", "error");
            return;
          }
        } else {
          const rawPhone = signupPhoneInput.value.trim();
          if (rawPhone.length < 8) {
            showAlert("Veuillez saisir un numéro de téléphone portable valide.", "error");
            return;
          }
          targetVal = rawPhone;
          // Formatage en email pour Supabase Auth
          email = `${rawPhone.replace(/\s+/g, '')}@phone.iafecole.fr`;
        }

        const password = document.getElementById('signup-password').value;
        const academicYear = document.getElementById('signup-year').value;

        // Déclencher le flux OTP
        triggerOTPFlow('signup', method, targetVal, {
          email: email,
          password: password,
          academicYear: academicYear,
          method: method,
          targetVal: targetVal
        });
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

        const method = loginMethod ? loginMethod.value : 'email';
        let email = "";
        let targetVal = "";

        if (method === 'email') {
          email = loginEmailInput.value.trim();
          targetVal = email;
        } else {
          const rawPhone = loginPhoneInput.value.trim();
          if (rawPhone.length < 8) {
            showAlert("Veuillez saisir un numéro de téléphone portable valide.", "error");
            return;
          }
          targetVal = rawPhone;
          email = `${rawPhone.replace(/\s+/g, '')}@phone.iafecole.fr`;
        }

        const password = document.getElementById('login-password').value;

        // Déclencher le flux OTP
        triggerOTPFlow('login', method, targetVal, {
          email: email,
          password: password,
          method: method,
          targetVal: targetVal
        });
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