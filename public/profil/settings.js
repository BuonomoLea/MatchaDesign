document.addEventListener('DOMContentLoaded', () => {
  const selectBox = document.querySelector('.custom-select');
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

      // changer la langue du site :
    });
  });

  // Fermer le menu si on clique ailleurs
  document.addEventListener('click', (e) => {
    if (!selectBox.contains(e.target)) {
      options.style.display = 'none';
    }
  });
});



// Paramètrages personnalisation pour la page Settings.html :
const THEMES = {
  forest: {
    '--color-primary': '#3D7337',
    '--color-secondary': '#A5C572',
    '--color-accent': '#FFA1A4',
    '--color-accent-light': '#F9D3E2',
    '--color-background': '#FBEAE8'
  },
  ocean: {
    '--color-primary': '#01408D',       // bleu profond
    '--color-secondary': '#96ADD6',     // turquoise
    '--color-accent': '#E75234',        // orange chaud
    '--color-accent-light': '#F8B8AF',  // sable clair
    '--color-background': '#F3D7D3'     // vert d'eau
  },
  sunset: {
    '--color-primary': '#DD0E22',       // rouge profond
    '--color-secondary': '#FF9A9E',     // orange brûlé
    '--color-accent': '#FF4C01',        // doré
    '--color-accent-light': '#ffc061ff',  // sable clair
    '--color-background': '#F4E4CB'    // jaune pastel
  },
  chocolate: {
    '--color-primary': '#584738',       // rouge profond
    '--color-secondary': '#B59E7B',     // orange brûlé
    '--color-accent': '#F1EADA',        // doré
    '--color-accent-light': '#beb096ff',  // sable clair
    '--color-background': '#CEC1A8'    // jaune pastel
  },
  lemon: {
    '--color-primary': '#FCFC3A',       // rouge profond
    '--color-secondary': '#A4BEE3',     // orange brûlé
    '--color-accent': '#f0b521ff',        // doré
    '--color-accent-light': '#e9e4b7ff',  // sable clair
    '--color-background': '#6798E4'    // jaune pastel
  }
};
const STORAGE_KEY = 'siteThemePalette';
function applyTheme(themeName) {
  const vars = THEMES[themeName];
  if (!vars) return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v);
  }
  localStorage.setItem(STORAGE_KEY, themeName);
}
function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && THEMES[saved]) {
    applyTheme(saved);
  }
}
// function resetTheme() {
//   localStorage.removeItem(STORAGE_KEY);
//   location.reload();
// }

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  
  document.querySelectorAll('[data-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.theme);
    });
  });

  // const resetBtn = document.querySelector('[data-theme-reset]');
  // if (resetBtn) {
  //   resetBtn.addEventListener('click', resetTheme);
  // }
});
