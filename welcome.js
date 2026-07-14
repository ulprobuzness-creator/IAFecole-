/**
 * welcome.js - Gestion de la section de bienvenue pour IAFECOLE.
 *
 * Ce fichier gère l'affichage dynamique, l'interaction et la fermeture
 * persistante de la bannière de bienvenue d'IAFECOLE.
 */

document.addEventListener('DOMContentLoaded', () => {
  const welcomeBanner = document.getElementById('welcome-banner');
  const welcomeCloseBtn = document.getElementById('welcome-close-btn');

  if (!welcomeBanner) return;

  // Vérifier si l'utilisateur a déjà masqué la bannière précédemment
  const isBannerClosed = localStorage.getItem('welcome-banner-closed');

  if (!isBannerClosed) {
    // Afficher la bannière de bienvenue
    welcomeBanner.classList.remove('hidden');
  }

  // Gérer la fermeture de la bannière
  if (welcomeCloseBtn) {
    welcomeCloseBtn.addEventListener('click', () => {
      // Animation de fondu de sortie
      welcomeBanner.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      welcomeBanner.style.opacity = '0';
      welcomeBanner.style.transform = 'translateY(-10px)';

      setTimeout(() => {
        welcomeBanner.classList.add('hidden');
        // Enregistrer l'état fermé de manière persistante
        localStorage.setItem('welcome-banner-closed', 'true');
      }, 400);
    });
  }
});
