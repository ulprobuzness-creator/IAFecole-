/**
 * script.js - Gestion interactive entièrement locale de la plateforme IAFECOLE.
 *
 * Élimine toute dépendance à Supabase et offre une interface dynamique, humaine
 * et immersive (Onboarding local, recherche en temps réel, cours interactifs,
 * checklists de leçons, barres de progression, quiz, et animations de téléchargement).
 */

// Base de données locale de cours ultra-interactive, enrichie avec des quiz et des chapitres réalistes
const COURSES_DATABASE = {
  "1ère année INSPEM": [
    {
      id: "gpet-101",
      title: "Introduction au Génie Pétrolier",
      tag: "Nouveau",
      desc: "Bases de l'amont/aval, exploration, raffinage, et cycle de vie des hydrocarbures.",
      lessons: [
        "Histoire et importance de l'industrie pétrolière",
        "Différences clés entre l'Amont, le Milieu et l'Aval (Upstream/Downstream)",
        "Les grandes étapes de l'exploration sismique",
        "Introduction simplifiée au raffinage du brut",
        "Principes de la transition énergétique pour un ingénieur"
      ],
      quiz: {
        question: "Quelle phase englobe l'exploration et la production du brut ?",
        options: [
          "L'Upstream (Amont)",
          "Le Downstream (Aval)",
          "Le Midstream (Milieu)",
          "Le Trading de brut"
        ],
        answer: 0
      }
    },
    {
      id: "geol-102",
      title: "Géologie Générale et Sédimentologie",
      tag: "Important",
      desc: "Étude des bassins sédimentaires et des roches réservoirs pour le piégeage de pétrole.",
      lessons: [
        "Le cycle sédimentaire et l'érosion des reliefs",
        "Processus d'altération physique et chimique",
        "Roches réservoirs clastiques vs carbonatées",
        "Mécanismes de piégeage structural et stratigraphique",
        "Diagenèse et compaction sédimentaire"
      ],
      quiz: {
        question: "Quel type de piège est formé par une faille ou un anticlinal ?",
        options: [
          "Piège stratigraphique",
          "Piège structural",
          "Piège diagénétique",
          "Piège hydrodynamique"
        ],
        answer: 1
      }
    },
    {
      id: "ther-103",
      title: "Thermodynamique des Fluides de Gisement",
      tag: "En cours",
      desc: "Principes fondamentaux des gaz et liquides sous pression dans les gisements pétroliers.",
      lessons: [
        "Comportement PVT (Pression-Volume-Température) des gaz réels",
        "Équations d'état classiques (Van der Waals, Peng-Robinson)",
        "Calculs des équilibres liquide-vapeur",
        "Viscosité et compressibilité du pétrole brut",
        "Diagrammes de phases de mélanges multicomposants"
      ],
      quiz: {
        question: "Que représente le point de rosée sur un diagramme de phase ?",
        options: [
          "L'apparition de la première bulle de gaz",
          "L'apparition de la première goutte de liquide",
          "Le point où le liquide devient solide",
          "La température critique du mélange"
        ],
        answer: 1
      }
    }
  ],
  "2ème année INSPEM": [
    {
      id: "fora-201",
      title: "Ingénierie de Forage et Équipements",
      tag: "Recommandé",
      desc: "Forage vertical et rotatif, boues de forage, et tubage des puits d'exploration.",
      lessons: [
        "Composants majeurs d'un appareil de forage rotatif",
        "Rôles fondamentaux des boues de forage (pression, débris)",
        "Critères de sélection des trépans (PDC, tricônes)",
        "Calculs de perte de charge dans l'espace annulaire",
        "Principes de tubage et de cimentation des puits"
      ],
      quiz: {
        question: "Quel est le rôle principal d'une boue de forage ?",
        options: [
          "Alimenter les moteurs électriques en surface",
          "Lubrifier le trépan et remonter les débris de roche",
          "Chauffer le puits pour liquéfier le bitume",
          "Dissoudre complètement la roche dure"
        ],
        answer: 1
      }
    },
    {
      id: "phys-202",
      title: "Physique des Réservoirs (Pétrophysique)",
      tag: "Essentiel",
      desc: "Porosité, perméabilité, écoulements multiphasiques et application des lois de Darcy.",
      lessons: [
        "Porosité absolue vs porosité efficace des roches",
        "Perméabilité absolue et démonstration de la Loi de Darcy",
        "Mouillabilité et pressions capillaires en milieu poreux",
        "Perméabilités relatives en écoulements multiphasiques",
        "Saturations en eau irréductible et huile résiduelle"
      ],
      quiz: {
        question: "La loi de Darcy décrit le débit d'un fluide en fonction de quel paramètre clé ?",
        options: [
          "Le gradient de pression et la perméabilité",
          "La température de surface",
          "Le volume total du réservoir",
          "La vitesse de rotation du trépan"
        ],
        answer: 0
      }
    },
    {
      id: "raff-203",
      title: "Raffinage et Pétrochimie",
      tag: "Intermédiaire",
      desc: "Distillation atmosphérique, craquage catalytique, et traitement du gaz naturel.",
      lessons: [
        "Distillation atmosphérique et sous vide du pétrole brut",
        "Craquage thermique et craquage catalytique (FCC)",
        "Procédés de désulfuration (hydrotraitement)",
        "Amélioration de l'indice d'octane (reformage)",
        "Bases de la pétrochimie (éthylène, propylène)"
      ],
      quiz: {
        question: "Quel est le but principal de l'hydrodésulfuration (HDS) ?",
        options: [
          "Augmenter l'indice d'octane de l'essence",
          "Retirer le soufre pour protéger les catalyseurs et l'environnement",
          "Solidifier les résidus lourds",
          "Produire du kérosène plus lourd"
        ],
        answer: 1
      }
    }
  ],
  "3ème année INSPEM": [
    {
      id: "simu-301",
      title: "Simulation de Réservoir Avancée",
      tag: "Avancé",
      desc: "Modélisation numérique des gisements par différences finies et prévisions de production.",
      lessons: [
        "Discrétisation spatiale et grilles de simulation (Corner-Point)",
        "Équations d'écoulement de fluides compressibles",
        "Méthodes numériques de résolution (IMPES, fully implicit)",
        "Calage d'historique (History Matching) et incertitudes",
        "Prévisions de production et optimisation des placements de puits"
      ],
      quiz: {
        question: "Qu'est-ce que le 'History Matching' (calage d'historique) ?",
        options: [
          "L'ajustement du modèle numérique pour reproduire le passé historique du gisement",
          "Le calcul de la date de découverte du gisement",
          "La comparaison des prix du baril de pétrole brut",
          "La numérisation de vieux documents papier"
        ],
        answer: 0
      }
    },
    {
      id: "dirg-302",
      title: "Forage Dirigé et Complétion de Puits",
      tag: "Spécialisé",
      desc: "Trajectoires horizontales, fracturation hydraulique, et têtes de puits sous-marines.",
      lessons: [
        "Techniques d'orientation et moteurs de fond (Mud Motors)",
        "Profils de puits déviés (S-Shape, puits horizontaux)",
        "Calculs de torque & drag et prévention des coincements",
        "Équipements de complétion simple et intelligente",
        "Stimulation des réservoirs compacts (fracturation hydraulique)"
      ],
      quiz: {
        question: "Quel outil permet de mesurer l'inclinaison et la direction du puits en temps réel ?",
        options: [
          "Le MWD (Measurement While Drilling)",
          "La table de rotation",
          "La pompe à boue",
          "Le casing shoe"
        ],
        answer: 0
      }
    },
    {
      id: "tran-303",
      title: "Transition Énergétique & Stockage (CCUS)",
      tag: "Projet final",
      desc: "Décarbonation de l'industrie, stockage souterrain de CO2 et intégration de l'hydrogène vert.",
      lessons: [
        "Les enjeux mondiaux de décarbonation du secteur de l'énergie",
        "Captage du CO2 (post-combustion, pré-combustion)",
        "Mécanismes de piégeage géologique du CO2",
        "Stockage souterrain d'hydrogène : défis et opportunités",
        "Analyse de cycle de vie et comptabilité carbone"
      ],
      quiz: {
        question: "Quelle méthode de piégeage du CO2 est considérée comme la plus pérenne géologiquement ?",
        options: [
          "Le piégeage par dissolution dans l'eau",
          "Le piégeage minéral (réaction avec la roche)",
          "Le piégeage par adsorption physique",
          "Le piégeage hydrodynamique standard"
        ],
        answer: 1
      }
    }
  ]
};

// --- INITIALISATION DU DOM ---

document.addEventListener('DOMContentLoaded', () => {
  // Masquer l'overlay de chargement instantanément
  const loadingOverlay = document.getElementById('loading-overlay');
  if (loadingOverlay) {
    setTimeout(() => {
      loadingOverlay.classList.add('hidden');
    }, 400);
  }

  // Éléments UI principaux
  const visitorContainer = document.getElementById('visitor-container');
  const studentContainer = document.getElementById('student-container');
  const onboardingForm = document.getElementById('local-onboarding-form');
  const studentFirstnameInput = document.getElementById('student-firstname');
  const studentYearSelect = document.getElementById('student-year-select');

  const dashboardWelcomeHeading = document.getElementById('dashboard-welcome-heading');
  const userYearBadge = document.getElementById('user-year-badge');
  const userSubBadge = document.getElementById('user-sub-badge');
  const coursesListContainer = document.getElementById('courses-list');
  const coursesCountText = document.getElementById('courses-count-text');

  // Recherche et filtres
  const courseSearchInput = document.getElementById('course-search-input');
  const filterButtons = document.querySelectorAll('.filter-btn');

  // Menu Dropdown principal
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const menuDropdownContent = document.getElementById('menu-dropdown-content');
  const menuLinkDashboard = document.getElementById('menu-link-dashboard');
  const menuBtnYear1 = document.getElementById('menu-btn-year1');
  const menuBtnYear2 = document.getElementById('menu-btn-year2');
  const menuBtnYear3 = document.getElementById('menu-btn-year3');

  // Modal d'études interactif
  const courseStudyModal = document.getElementById('course-study-modal');
  const closeStudyModalBtn = document.getElementById('close-study-modal-btn');
  const modalCourseTag = document.getElementById('modal-course-tag');
  const modalCourseTitle = document.getElementById('modal-course-title');
  const modalProgressBar = document.getElementById('modal-progress-bar');
  const modalProgressText = document.getElementById('modal-progress-text');
  const modalLessonsList = document.getElementById('modal-lessons-list');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  const downloadProgressContainer = document.getElementById('download-progress-container');
  const downloadBarFill = document.getElementById('download-bar-fill');
  const downloadPercentText = document.getElementById('download-percent-text');

  // Quiz interactif
  const quizQuestion = document.getElementById('quiz-question');
  const quizOptionsContainer = document.getElementById('quiz-options-container');
  const quizFeedback = document.getElementById('quiz-feedback');

  // --- VARIABLES D'ÉTAT LOCAL (PERSISTÉES) ---
  let userFirstname = localStorage.getItem('iafecole_user_name') || "";
  let userAcademicYear = localStorage.getItem('iafecole_user_year') || "1ère année INSPEM";
  let activeFilter = "all"; // "all" ou "studied"
  let currentOpenCourse = null;

  // Initialisation de la vue utilisateur
  function refreshUserInterface() {
    if (userFirstname) {
      // Utilisateur enregistré
      if (visitorContainer) visitorContainer.classList.add('hidden');
      if (studentContainer) studentContainer.classList.remove('hidden');
      if (menuLinkDashboard) menuLinkDashboard.classList.remove('hidden');

      // Formuler des messages humains, motivants et immersifs
      const greetings = [
        `Ravi de vous revoir, ${userFirstname} ! 👋`,
        `Cap sur la réussite, ${userFirstname} ! 🚀`,
        `Excellente journée d'études, ${userFirstname} ! 🛢️`,
        `Chaque pas compte, ${userFirstname} ! 🎓`
      ];
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      if (dashboardWelcomeHeading) dashboardWelcomeHeading.textContent = randomGreeting;

      if (userYearBadge) userYearBadge.textContent = userAcademicYear;
      if (userSubBadge) {
        // Formules fun et valorisantes
        const subStatuses = ["Compte Étudiant Certifié", "Ingénieur en Devenir", "Option Réussite Active"];
        userSubBadge.textContent = subStatuses[userFirstname.length % 3];
      }

      // Rendre les cours
      renderLocalCourses();
    } else {
      // Visiteur anonyme
      if (visitorContainer) visitorContainer.classList.remove('hidden');
      if (studentContainer) studentContainer.classList.add('hidden');
      if (menuLinkDashboard) menuLinkDashboard.classList.add('hidden');
    }

    // Mettre à jour l'en-tête (pour header.js)
    const userEmailSpan = document.getElementById('menu-user-email');
    if (userEmailSpan) {
      userEmailSpan.textContent = userFirstname ? `Étudiant : ${userFirstname}` : "Étudiant Invité";
    }
  }

  // --- LOGIQUE DE RENDU DES CARTES DE COURS ---
  function renderLocalCourses() {
    if (!coursesListContainer) return;
    coursesListContainer.innerHTML = '';

    const allCourses = COURSES_DATABASE[userAcademicYear] || [];
    let query = courseSearchInput ? courseSearchInput.value.toLowerCase().trim() : "";

    // Filtrer les cours selon la recherche et l'onglet de statut
    let filteredCourses = allCourses.filter(course => {
      const matchQuery = course.title.toLowerCase().includes(query) || course.desc.toLowerCase().includes(query);

      if (activeFilter === "studied") {
        // Est en cours d'étude si au moins une leçon locale est cochée
        const checkedLessonsCount = getCheckedLessonsCount(course.id);
        return matchQuery && checkedLessonsCount > 0;
      }
      return matchQuery;
    });

    if (coursesCountText) {
      coursesCountText.textContent = `${filteredCourses.length} module${filteredCourses.length > 1 ? 's' : ''} disponible${filteredCourses.length > 1 ? 's' : ''}`;
    }

    if (filteredCourses.length === 0) {
      coursesListContainer.innerHTML = `
        <div class="empty-search-state">
          <p class="text-muted">Aucun module ne correspond à vos critères de recherche. Essayez d'autres mots-clés !</p>
        </div>
      `;
      return;
    }

    filteredCourses.forEach(course => {
      const checkedCount = getCheckedLessonsCount(course.id);
      const progressPercent = Math.round((checkedCount / course.lessons.length) * 100);

      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <div class="course-header">
          <span class="course-tag">${course.tag}</span>
          <h4>${course.title}</h4>
        </div>
        <div class="course-body">
          <p class="course-description">${course.desc}</p>
          <div class="course-mini-progress">
            <div class="mini-progress-bar">
              <div class="mini-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <span class="mini-progress-label">${progressPercent}% assimilé</span>
          </div>
          <div class="course-footer">
            <span class="course-lessons-count">
              📚 ${course.lessons.length} chapitres
            </span>
            <button class="btn btn-primary btn-sm btn-open-course" data-id="${course.id}">Étudier</button>
          </div>
        </div>
      `;
      coursesListContainer.appendChild(card);
    });

    // Attacher l'événement d'ouverture du modal
    const openButtons = document.querySelectorAll('.btn-open-course');
    openButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = e.target.getAttribute('data-id');
        openCourseModal(courseId);
      });
    });
  }

  // --- OBTENIR PROGRESSION DES LEÇONS LOCALES ---
  function getCheckedLessonsCount(courseId) {
    const savedLessons = JSON.parse(localStorage.getItem(`iafecole_lessons_${courseId}`)) || {};
    return Object.values(savedLessons).filter(Boolean).length;
  }

  // --- LOGIQUE DU MODAL D'ÉTUDES ---
  function openCourseModal(courseId) {
    const allCourses = COURSES_DATABASE[userAcademicYear] || [];
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    currentOpenCourse = course;

    // Reset styles de téléchargement
    if (downloadProgressContainer) downloadProgressContainer.classList.add('hidden');
    if (downloadPdfBtn) downloadPdfBtn.disabled = false;

    // Remplir les informations
    if (modalCourseTag) modalCourseTag.textContent = course.tag;
    if (modalCourseTitle) modalCourseTitle.textContent = course.title;

    // Rendu de la checklist de leçons
    if (modalLessonsList) {
      modalLessonsList.innerHTML = '';
      const savedLessons = JSON.parse(localStorage.getItem(`iafecole_lessons_${courseId}`)) || {};

      course.lessons.forEach((lessonName, index) => {
        const isChecked = !!savedLessons[index];
        const item = document.createElement('div');
        item.className = 'lesson-check-item';
        item.innerHTML = `
          <input type="checkbox" id="lesson-chk-${index}" class="lesson-checkbox" ${isChecked ? 'checked' : ''} data-index="${index}">
          <label for="lesson-chk-${index}" class="lesson-label">${lessonName}</label>
        `;
        modalLessonsList.appendChild(item);

        // Événement de mise à jour de progression
        const chk = item.querySelector('.lesson-checkbox');
        chk.addEventListener('change', (e) => {
          const index = e.target.getAttribute('data-index');
          savedLessons[index] = e.target.checked;
          localStorage.setItem(`iafecole_lessons_${courseId}`, JSON.stringify(savedLessons));
          updateModalProgress(course);
          renderLocalCourses(); // Refresh la grille de fond

          if (e.target.checked) {
            showToast("Progression enregistrée ! Beau travail 🌟");
          }
        });
      });
    }

    updateModalProgress(course);

    // Rendu du Quiz d'auto-évaluation
    initQuiz(course);

    // Ouvrir le modal
    if (courseStudyModal) {
      courseStudyModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // Bloquer le scroll
    }
  }

  function updateModalProgress(course) {
    const checkedCount = getCheckedLessonsCount(course.id);
    const progressPercent = Math.round((checkedCount / course.lessons.length) * 100);

    if (modalProgressBar) modalProgressBar.style.width = `${progressPercent}%`;
    if (modalProgressText) modalProgressText.textContent = `${progressPercent}% complété (${checkedCount}/${course.lessons.length} chapitres)`;
  }

  // --- LOGIQUE DU QUIZ INTERACTIF ---
  function initQuiz(course) {
    if (!quizQuestion || !quizOptionsContainer || !quizFeedback) return;

    quizFeedback.classList.add('hidden');
    quizFeedback.className = 'quiz-feedback';

    const quizData = course.quiz;
    quizQuestion.textContent = quizData.question;
    quizOptionsContainer.innerHTML = '';

    quizData.options.forEach((optionText, idx) => {
      const optionBtn = document.createElement('button');
      optionBtn.className = 'quiz-option-btn';
      optionBtn.textContent = optionText;
      optionBtn.addEventListener('click', () => {
        // Empêcher d'autres sélections
        const allOpts = quizOptionsContainer.querySelectorAll('.quiz-option-btn');
        allOpts.forEach(btn => btn.disabled = true);

        if (idx === quizData.answer) {
          optionBtn.classList.add('correct');
          quizFeedback.textContent = "🎉 Excellente réponse ! Votre sens d'ingénieur pétrolier brille !";
          quizFeedback.className = "quiz-feedback success";
          quizFeedback.classList.remove('hidden');
          showToast("Bonne réponse ! +10 points de fierté 🥳");
        } else {
          optionBtn.classList.add('incorrect');
          // Mettre la bonne en évidence
          allOpts[quizData.answer].classList.add('correct');
          quizFeedback.textContent = "❌ Ce n'est pas tout à fait ça. Relisez le cours ou réessayez !";
          quizFeedback.className = "quiz-feedback error";
          quizFeedback.classList.remove('hidden');
        }
      });
      quizOptionsContainer.appendChild(optionBtn);
    });
  }

  // --- EXPÉRIENCE DE TÉLÉCHARGEMENT SIMULÉ ---
  if (downloadPdfBtn) {
    downloadPdfBtn.addEventListener('click', () => {
      if (!currentOpenCourse) return;

      downloadPdfBtn.disabled = true;
      downloadProgressContainer.classList.remove('hidden');

      let progress = 0;
      downloadBarFill.style.width = '0%';
      downloadPercentText.textContent = "Préparation de la fiche de synthèse...";

      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          setTimeout(() => {
            downloadProgressContainer.classList.add('hidden');
            downloadPdfBtn.disabled = false;
            showToast("📥 PDF Téléchargé avec succès ! Bonnes révisions !");
          }, 600);
        }
        downloadBarFill.style.width = `${progress}%`;
        downloadPercentText.textContent = `Téléchargement : ${progress}%`;
      }, 200);
    });
  }

  // --- FERMER LE MODAL D'ÉTUDES ---
  if (closeStudyModalBtn) {
    closeStudyModalBtn.addEventListener('click', () => {
      if (courseStudyModal) {
        courseStudyModal.classList.add('hidden');
        document.body.style.overflow = ''; // Restaurer le scroll
      }
    });
  }

  // --- NOTIFICATION TOAST ULTRA INTUITION ---
  function showToast(message) {
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-msg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    // Retirer après 3,5 secondes
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 400);
    }, 3500);
  }

  // --- GESTION DE LA SOUCOUP DE RECHERCHE ---
  if (courseSearchInput) {
    courseSearchInput.addEventListener('input', () => {
      renderLocalCourses();
    });
  }

  // --- FILTRES DE STATUT DE COURS ---
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeFilter = e.target.getAttribute('data-filter');
      renderLocalCourses();
    });
  });

  // --- GESTIONNAIRE D'ONBOARDING LOCAL ---
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = studentFirstnameInput.value.trim();
      const year = studentYearSelect.value;

      if (name.length < 2) {
        alert("Veuillez saisir un prénom d'au moins 2 lettres.");
        return;
      }

      // Enregistrer localement
      localStorage.setItem('iafecole_user_name', name);
      localStorage.setItem('iafecole_user_year', year);

      userFirstname = name;
      userAcademicYear = year;

      showToast(`Bienvenue à bord de l'INSPEM, ${name} ! 🎓`);

      // Rediriger vers le mot d'accueil du Directeur
      setTimeout(() => {
        window.location.href = 'bienvenue_directeur.html';
      }, 1000);
    });
  }

  // --- INTERACTION DES ONGLETS DE SÉLECTION D'ANNÉE DU MENU DROPDOWN ---
  function handleDropdownYearSelect(year) {
    if (menuDropdownContent) {
      menuDropdownContent.classList.add('hidden');
      menuToggleBtn.classList.remove('active');
    }

    if (!userFirstname) {
      alert(`Veuillez d'abord compléter l'accueil avec votre prénom pour activer vos cours de ${year}.`);
      return;
    }

    localStorage.setItem('iafecole_user_year', year);
    userAcademicYear = year;
    refreshUserInterface();
    showToast(`Parcours configuré pour la ${year} !`);
  }

  if (menuBtnYear1) menuBtnYear1.addEventListener('click', () => handleDropdownYearSelect('1ère année INSPEM'));
  if (menuBtnYear2) menuBtnYear2.addEventListener('click', () => handleDropdownYearSelect('2ème année INSPEM'));
  if (menuBtnYear3) menuBtnYear3.addEventListener('click', () => handleDropdownYearSelect('3ème année INSPEM'));

  // --- OUVERTURE/FERMETURE DU MENU DROPDOWN ---
  if (menuToggleBtn && menuDropdownContent) {
    menuToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuDropdownContent.classList.toggle('hidden');
      menuToggleBtn.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!menuDropdownContent.classList.contains('hidden')) {
        if (!menuDropdownContent.contains(e.target) && e.target !== menuToggleBtn) {
          menuDropdownContent.classList.add('hidden');
          menuToggleBtn.classList.remove('active');
        }
      }
    });
  }

  // Lancement initial
  refreshUserInterface();
});
