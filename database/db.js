const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/inscriptionNews.db');

db.serialize(() => {
    // users
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    )`);

    // userProfil
    db.run(`CREATE TABLE IF NOT EXISTS userProfil (
        userId INTEGER PRIMARY KEY,
        avatarProfil TEXT,
        description TEXT,
        job TEXT,
        bio TEXT,
        birthdate TEXT,
        language TEXT,
        theme TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // newsletter
    db.run(`CREATE TABLE IF NOT EXISTS newsletter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL)`);
    
});

module.exports = db;