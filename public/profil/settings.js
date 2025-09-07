// Envois des données au serveur :
function updateProfileField(field, value) {
  fetch('/userProfil', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ [field]: value })
  })
  .then(res => {
    if (!res.ok) throw new Error('Erreur lors de la sauvegarde');
    return res.json();
  })
  .then(data => {
    console.log(`Champ ${field} mis à jour`, data);
  })
  .catch(err => console.error(err));
}

// Code spécifique à la page profil :
if (window.location.pathname.endsWith('/profil.html')) {
  // MODIFIER L'AVATAR :
  const openAvatar = document.getElementById('openAvatar');
  const lightboxAvatar = document.getElementById('lightboxAvatar');
  const avatarTheme = document.querySelectorAll(".avatar-gallery img");
  const avatarProfil = document.getElementById('avatarProfil');
  // Ouvrir/fermer bloc d'avatar
    function toggleAvatarMenu() {
      if (lightboxAvatar) {
        lightboxAvatar.classList.toggle('active');
      }
    }
    if (openAvatar) {
      openAvatar.addEventListener('click', toggleAvatarMenu);
    }
    // Fermer au click à côté du bloc d'avatar
    document.addEventListener('click', function(e) {
      if (lightboxAvatar && lightboxAvatar.classList.contains('active')) {
        if (!lightboxAvatar.contains(e.target) && e.target !== openAvatar) {
          lightboxAvatar.classList.remove('active');
        }
      }
    });
    // Mettre à jour l'image de profil :
    function changeSrcAlt() {
      // Mettre à jour les images
      avatarProfil.src = this.src;
      avatarProfil.alt = this.alt;
      const value = avatarProfil.src;
      const field = avatarProfil.dataset.field;
      updateProfileField(field, value);
    }

  // MODIFIER LA PRESENTATION :
  const btnModifier = document.getElementById('btnModifierProfil');
  const champs = document.querySelectorAll('.profile-right dd');
  let enEdition = false;
    function modeEdition() {
      if (!enEdition) {
        champs.forEach(dd => {
          let texte = dd.textContent.trim();
          let input = document.createElement('input');
          input.type = 'text';
          input.value = texte;
          input.classList.add('input-profil');
          dd.textContent = '';
          dd.appendChild(input);
        })
        btnModifier.textContent = 'Enregistrer';
        enEdition = true;
      } else {
        champs.forEach(dd => {
          const input = dd.querySelector('input');
          if (input) {
            const value = input.value.trim();
            const field = dd.dataset.field;
            dd.textContent = value; 
            updateProfileField(field, value);
          }
        })
        btnModifier.textContent = 'Modifier';
        enEdition = false;
      }
    }

  // MODIFIER LA LANGUE : (a mettre à jour)
  // document.addEventListener('DOMContentLoaded', () => {
  const selectBox = document.querySelector('.custom-select');
  if (!selectBox) return;

  const selected = selectBox.querySelector('.selected');
  const options = selectBox.querySelector('.options');
  selected.addEventListener('click', () => {
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
  });
  options.querySelectorAll('li').forEach(option => {
    option.addEventListener('click', () => {
      selected.textContent = option.textContent;
      selected.setAttribute('data-value', option.getAttribute('data-value'));
      options.style.display = 'none';

      
      const langValue = option.dataset.value;
      updateProfileField('language', langValue);
      // changer la langue du site : (a faire)
    });
  });
  // Fermer le menu des langues si on clique à côté
  document.addEventListener('click', (e) => {
    if (!selectBox.contains(e.target)) {
      options.style.display = 'none';
    }
  });
  // });


  // Mise à jours de l'avatar du profil :
  avatarTheme.forEach(function(img) {
    img.addEventListener('click', changeSrcAlt);
  });
  // Mise à jours du texte de présentation :
  if (btnModifier) {
    btnModifier.addEventListener('click', modeEdition);
  }

}

// MODIFIER LE THEME :
const THEMES = {
  forest: {
    '--color-primary': '#3D7337',
    '--color-secondary': '#A5C572',
    '--color-accent': '#FFA1A4',
    '--color-accent-light': '#F9D3E2',
    '--color-background': '#FBEAE8'
  },
  ocean: {
    '--color-primary': '#01408D',
    '--color-secondary': '#96ADD6',
    '--color-accent': '#E75234',
    '--color-accent-light': '#F8B8AF',
    '--color-background': '#F3D7D3'
  },
  sunset: {
    '--color-primary': '#DD0E22',
    '--color-secondary': '#FF9A9E',
    '--color-accent': '#FF4C01',
    '--color-accent-light': '#ffc061ff',
    '--color-background': '#F4E4CB'
  },
  chocolate: {
    '--color-primary': '#584738',
    '--color-secondary': '#B59E7B',
    '--color-accent': '#F1EADA',
    '--color-accent-light': '#a49881ff',
    '--color-background': '#CEC1A8'
  },
  lemon: {
    '--color-primary': '#FCFC3A',
    '--color-secondary': '#A4BEE3',
    '--color-accent': '#f0b521ff',
    '--color-accent-light': '#e9e4b7ff',
    '--color-background': '#6798E4'
  }
};
function applyTheme(themeName) {
  // Séléctionner le bon theme dans le tableau
  const selectedTheme = THEMES[themeName];
  if (!selectedTheme) return;
  // Modifier le root du document
  const root = document.documentElement;
  for (const [propriete, valeur] of Object.entries(selectedTheme)) {
    root.style.setProperty(propriete, valeur);
  }
}

// Appel du theme choisis
document.querySelectorAll('[data-field="theme"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const themeName = btn.dataset.theme;
    applyTheme(themeName);
    updateProfileField('theme', themeName);
  });
});

// Mise à jour de la page au rechargement avant modification
document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.endsWith('/profil.html')) return;
  
  fetch('/userProfil', { credentials: 'include' })
    .then(res => res.json())
    .then(user => {
      // Avatar
      if (user.avatarProfil) {
        avatarProfil.src = user.avatarProfil;
      }
      // Présentation
      champs.forEach(dd => {
        const field = dd.dataset.field;
        if (user[field]) {
          dd.textContent = user[field];
        }
      });
      // Langue
      const selected = document.querySelector('.custom-select .selected');
      const option = document.querySelector(`.options [data-value="${user.language}"]`);
      if (selected && option) {
        selected.textContent = option.textContent;
        selected.dataset.value = user.language;
      }
      // Thème
      if (user.theme) {
        applyTheme(user.theme);
      }
    })
    .catch(console.error);
});