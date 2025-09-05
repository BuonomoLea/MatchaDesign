const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/inscriptionNews.db');

db.serialize(() => {
    // newsletter
    db.run(`CREATE TABLE IF NOT EXISTS newsletter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL)`);
    
    // users
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
    )`);        

});

module.exports = db;