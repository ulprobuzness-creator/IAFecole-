/**
 * header.js - Gestionnaire de l'en-tête, du profil utilisateur et des téléchargements.
 *
 * Entièrement localisé sans dépendance à Supabase.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Gérer la réinitialisation du profil
  const resetBtn = document.getElementById('menu-btn-reset-profile');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm("Voulez-vous réinitialiser votre profil local (nom et progression) ?")) {
        localStorage.clear();
        alert("Profil réinitialisé !");
        window.location.href = 'index.html';
      }
    });
  }

  // Mettre à jour les labels d'email/nom si le profil local existe
  const savedName = localStorage.getItem('iafecole_user_name');
  const userEmailSpan = document.getElementById('menu-user-email');
  if (userEmailSpan && savedName) {
    userEmailSpan.textContent = "Étudiant : " + savedName;
  }
});
