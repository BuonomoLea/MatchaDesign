const express = require('express');
const session = require('express-session');
const morgan = require('morgan'); 
// const bodyParser = require('body-parser'); 
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const db = require('./database/db'); 

const app = express();
const PORT = 3000;

// Sécurité & Logs 
app.use(helmet()); 
app.use(morgan('dev'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session
app.use(session({
    secret: process.env.SESSION_SECRET_PASS || 'Ma_secret_super_ultra_secure',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static('public'));

// Newsletter
// app.post('/newsletter', (req, res) => {
//     const { email } = req.body;
//     if(!email) {
//         return res.status(400).json({message: 'Email requis'});
//     }
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
//     if (!emailRegex.test(email)) { 
//         return res.status(400).json({ message: 'Format d’email invalide' }); 
//     } 
//     db.run(`INSERT INTO newsletter (email) VALUES (?)`, [email], function(err) {
//         if (err) {
//             if (err.code === 'SQLITE_CONSTRAINT') { 
//                 return res.status(409).json({ message: 'Cet email est déjà inscrit' }); 
//             }
//             console.error('Erreur SQLite :', err);
//             return res.status(500).json({ message: 'Erreur du serveur pas d’insertion à la bdd'});
//         }
//         res.json({ message: 'Inscription réussie'});
//     });
// });

// register
app.post('/register', async (req, res) => {
  console.log("Données reçues :", req.body);
  try {
    let { username, email, password } = req.body;
    username = username?.trim();
    email = email?.trim();
    password = password?.trim();

    // validation email
    if(!email) {
      return res.status(400).json({message: 'Email requis'});
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    if (!emailRegex.test(email)) { 
      return res.status(400).json({ message: 'Format d’email invalide' }); 
    } 
 
    // validation username
    if (!username) {
        return res.status(400).json({ message: "Nom d’utilisateur requis" });
    }
    if (username.length < 4 || username.length > 14) {
        return res.status(400).json({ message: "Format valide : entre 4 et 14 caractères" });
    }
    // validation password
    if (!password || password.length < 6 || password.length > 20) {
      return res.status(400).json({ message: "Format valide : entre 6 et 20 caractères" });
    }

    // vérif de l'email dans la base de données pour inscription
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, row) => {
      if (err) {
        console.error('Erreur SQLite :', err);
        return res.status(500).json({ message: "Erreur du serveur lors de la vérification de l'email"});
      }
      if (row) {
        return res.status(409).json({ message: "Cet email est déjà inscrit" });
      }
      // hashage du mot de passe
      const hash = await bcrypt.hash(password, 10);

      db.run(
        `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
        [username, email, hash],
        function (err) {
          if (err) {
            console.error("Erreur SQL :", err.message);
            return res.status(500).json({ message: "Erreur serveur lors de l'insertion" });
          }
          return res.status(201).json({ message: "Inscription réussie" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur interne" });
  }
});


// login
app.post('/login', (req, res) => {
    let { username, password } = req.body;
    username = username?.trim();
    password = password?.trim();

    if (!username || !password) {
        return res.status(400).json({ message: "Champs manquants"});
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) return res.status(500).json({ message: "Erreur serveur"});
        if (!user) return res.status(500).json({ message: "Utilisateur introuvable"});

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) return res.status(400).json({ message: "Mot de passe incorrect"});

        req.session.userId = user.id;
        res.status(200).json({ message: "Connexion réussie"});
    });
});


// visualiser les erreur de la base sql des users
app.get('/debug-schema', (_, res) => {
  db.all("PRAGMA table_info(users);", (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erreur' });
    res.json(rows);
  });
});
// Visualiser les utilisateurs inscrits
app.get('/users', (_, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
    res.json(rows);
  });
});

// Visualiser les emails inscrit à la newsletter
app.get('/emails', (_, res) => {
    db.all('SELECT * FROM newsletter', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erreur lors de la récupération des emails' });
        }
        res.json(rows);
    });
});

// PORT
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});