const mysql = require ('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'db_clinica'
});

db.connect();

module.exports = {
    findUser: (username, password, callback) => {
     db.query(
        'SELECT * FROM users WHERE username = ? AND password = ?', 
        [username, password], 
        (err, results) => {
            if (err) throw err;
            callback(results);
        }
     );
    }
};