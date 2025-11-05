const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
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
  secret: process.env.SESSION_SECRET_PASS || 'Ma_secret_key_ultra_secure',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));


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
  // visualiser les erreur de la base users
  app.get('/debug-schema', (_, res) => {
    db.all("PRAGMA table_info(users);", (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erreur' });
      res.json(rows);
    });
  });

// Page de connexion
app.post('/login', (req, res, next) => {
  let { username, password } = req.body;
  username = username?.trim();
  password = password?.trim();

  if (!username || !password) {
    const error = new Error("Champs manquants");
    error.status = 400;
    return next(error);
  }

  db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
    if (err) {
      const error = new Error("Erreur serveur");
      error.status = 500;
      return next(error);
    }
    if (!user) {
      const error = new Error("Utilisateur introuvable");
      error.status = 404;
      return next(error);
    }

    const match = await bcrypt.compare(password, user.password_hash);
    req.session.userId = user.id;
    if (!match) {
      const error = new Error("Identifiants incorrects");
      error.status = 401;
      return next(error);
    }

    return res.status(200).json({
      message: "Connexion réussie",
      success: true
    });
  }); 
});
// Afficher la session de l'utilisateur
app.get('/userSession', async (req, res) => {
  console.log('Route /userSession appelée');
  if (!req.session.userId) {
    return res.json({ loggedIn: false });
  } 
  db.get(`SELECT id, username FROM users WHERE id = ?`, [req.session.userId], (err, user) => {
    if (err) return res.status(500).json({ loggedIn: false, message: "Erreur serveur" });
    if (!user) return res.json({ loggedIn: false, message: "User serveur" });

    return res.json({
      loggedIn: true,
      username: user.username
    });
  });
});

// Obtenir les préférences de l'utilisateur
app.get('/userProfil', (req, res) => {
  console.log('Route /userProfil appelée');
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Non connecté' });
  }

  db.get(
    `SELECT avatarProfil, description, job, bio, birthdate, language, theme
     FROM userProfil
     WHERE userId = ?`,
    [req.session.userId],
    (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération du profil :', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      if (!row) {
        // Aucun profil → le front garde ses valeurs HTML par défaut
        return res.json(null);
      }

      res.json(row);
    }
  );
});

// Mise à jour du profil (updateField)
app.patch('/userProfil', (req, res) => {
  console.log('PATCH body:', req.body);
  const { userId } = req.session;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const [field, value] = Object.entries(req.body)[0];
  const allowed = ['avatarProfil','description','job','bio','birthdate','language','theme'];
  if (!allowed.includes(field)) return res.status(400).json({ error: 'Champ non autorisé' });

  db.run(
    `INSERT INTO userProfil (userId, ${field})
     VALUES (?, ?)
     ON CONFLICT(userId) DO UPDATE SET ${field} = excluded.${field}`,
    [userId, value],
    function (err) {
      if (err) {
        console.error('Erreur SQL :', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json({ success: true, field, value });
    }
  );
});


  // Route de debug pour les profils
  app.get('/debugProfil', (_, res) => {
    db.all('SELECT * FROM userProfil', [], (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des profils :', err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(rows);
    });
  });

// btnDeconnect :
// > détruite la session 
// > modifier texte du btn d'index.html 
// > rediriger vers index.html

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erreur interne du serveur"
  });
});


// NEWSLETTER :
app.post('/newsletter', (req, res) => {
    const { email } = req.body;
    if(!email) {
        return res.status(400).json({message: 'Email requis'});
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    if (!emailRegex.test(email)) { 
        return res.status(400).json({ message: 'Format d’email invalide' }); 
    } 
    db.run(`INSERT INTO newsletter (email) VALUES (?)`, [email], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') { 
                return res.status(409).json({ message: 'Cet email est déjà inscrit' }); 
            }
            console.error('Erreur SQLite :', err);
            return res.status(500).json({ message: 'Erreur du serveur pas d’insertion à la bdd'});
        }
        res.json({ message: 'Inscription réussie'});
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

// Fichiers static :
app.use(express.static('public'));

// PORT :
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});