import 'profil/settings.js';

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

// Login
// const loginForm = document.getElementById('loginForm');
// if (loginForm) {
//   loginForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     const data = Object.fromEntries(new FormData(loginForm));
//     const res = await fetch('/login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json'},
//       body: JSON.stringify(data)
//     });
//     alert((await res.json()).message);
//   });
// }

// validation du formulaire newsletter :

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

