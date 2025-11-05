// import '/profil/settings.js';

// Register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(registerForm));
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    alert((await res.json()).message);
  });
}
// Login et redirection
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  console.log('loginForm trouvé ?', loginForm);
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm));

    // Données demandé au formulaire login 
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    const result = await res.json();
    // Si la connexion renvois true :
    if (result.success) {
      window.location.href = 'index.html';
    } else {
      alert(result.message || 'Identifiants incorrects');
    }
  });
}
// userSession
document.addEventListener('DOMContentLoaded', () => {
  fetch('/userSession', { credentials: 'include', cache: 'no-store' })
    .then(res => res.json())
    .then(user => {
      const btnHeader = document.getElementById('btnHeader');
      if (btnHeader) {
        if (user && user.loggedIn) {
          btnHeader.textContent = "Profil";
          btnHeader.href = "/profil/profil.html";
        } else {
          btnHeader.textContent = "Se connecter";
          btnHeader.href = "/login.html";
        }
      }

      // Utiliser loggedIn au lieu de id
      if (user && user.loggedIn) {
        fetch('/userProfil', { credentials: 'include' })
          .then(res => res.json())
          .then(profil => {
            console.log("profil reçu:", profil);
            if (profil && profil.theme && typeof window.applyTheme === 'function') {
              window.applyTheme(profil.theme);
            }
          })
          .catch(err => console.error('Erreur lors du chargement du profil :', err));
      } else {
        // Thème par défaut
        if (typeof window.applyTheme === 'function') {
          window.applyTheme('ocean');
        }
      }
    })
    .catch(err => console.error('Erreur lors de la récupération de /userSession', err));
});



// slide du footer
const slide = document.querySelectorAll('.slide');
const dot = document.querySelectorAll('.dot');
function goToSlide(index) {
  slide.forEach(s => s.classList.remove('active'));
  dot.forEach(d => d.classList.remove('active'));

  slide[index].classList.add('active');
  dot[index].classList.add('active');
}
dot.forEach((d, i) => {
  d.addEventListener('click', () => {
    goToSlide(i);
  });
});

