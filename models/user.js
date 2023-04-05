import mysql from 'mysql';
var pool = mysql.createPool({
    host: 'localhost',
    user: 'alek_db',
    password: '(&zjn$#2Z',
    database: 'tickets'
});

export const createUser = async function(email, pwd, code, referral_code) {
    return new Promise((resolve, reject) => {
        var sql = "INSERT INTO users (email, pwd, auth_code, referral_code) VALUES (?, ?, ?, ?)";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [email, pwd, code, referral_code], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                console.log('User is inserted');
                return resolve(results.insertId);
            });
        });
    })
};

export const checkUser = async function(email) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM users WHERE email = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [email], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                return resolve(results[0]);
            });
        });
    })
};

export const loginUser = async function(email) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT * FROM users WHERE email = ? AND status = 0";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [email], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                return resolve(results[0]);
            });
        });
    })
};

export const confirmUser = async function(email, code) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT id, auth_code FROM users WHERE email = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [email], function(err, results) {
                if (err) { 
                    connection.release();
                    console.log(err); 
                    return reject(err); 
                }
                if (results[0] != undefined && results[0].auth_code == code) {
                    // Confirm ok
                    var userId = results[0].id;

                    var sql = "UPDATE users SET status = 0 WHERE email = ?";
                    connection.query(sql, [email], function(err, results) {
                        connection.release();
                        if (err) { 
                            console.log(err); 
                            return reject(err); 
                        }
                        return resolve(userId);
                    });
                } else {
                    return resolve(-1);
                }
            });
        });
    })
};

export const updateCode = async function(email, newCode) {
    return new Promise((resolve, reject) => {
        var sql = "UPDATE users SET auth_code = ? WHERE email = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [newCode, email], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                return resolve(results);
            });
        });
    })
};

export const getUserCode = async function(email) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT auth_code FROM users WHERE email = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [email], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }

                return resolve(results[0].auth_code);
            });
        });
    })
};

export const updatePassword = async function(email, newPassword) {
    return new Promise((resolve, reject) => {
        var sql = "UPDATE users SET pwd = ? WHERE email = ?";
        pool.getConnection(function(err, connection) {
            if (err) { 
                console.log(err); 
                return reject(err);
            }
            connection.query(sql, [newPassword, email], function(err, results) {
                connection.release();
                if (err) { 
                    console.log(err); 
                    return reject(err); 
                }
                return resolve(results);
            });
        });
    })
};

export const getPovList = async function(userId) {
  return new Promise((resolve, reject) => {
      var sql = "SELECT * FROM povlist WHERE user_id = ?";
      pool.getConnection(function(err, connection) {
          if (err) { 
              console.log(err); 
              return reject(err);
          }
          connection.query(sql, [userId], function(err, results) {
              connection.release();
              if (err) { 
                  console.log(err); 
                  return reject(err); 
              }
              return resolve(results[0]);
          });
      });
  })
};

export const insertPovList = async function(userId, fb, ig, tt, tw) {
  return new Promise((resolve, reject) => {
      var sql = "INSERT INTO povlist (user_id, fb, ig, tt, tw) VALUES (?, ?, ?, ?, ?)";
      pool.getConnection(function(err, connection) {
          if (err) { 
              console.log(err); 
              return reject(err);
          }
          connection.query(sql, [userId, fb, ig, tt, tw], function(err, results) {
              connection.release();
              if (err) { 
                  console.log(err); 
                  return reject(err); 
              }
              return resolve(results[0]);
          });
      });
  })
};

export const updatePovList = async function(userId, fb, ig, tt, tw) {
  return new Promise((resolve, reject) => {
      var sql = "UPDATE povlist SET fb = ?, ig = ?, tt = ?, tw = ? WHERE user_id = ?";
      pool.getConnection(function(err, connection) {
          if (err) { 
              console.log(err); 
              return reject(err);
          }
          connection.query(sql, [fb, ig, tt, tw, userId], function(err, results) {
              connection.release();
              if (err) { 
                  console.log(err); 
                  return reject(err); 
              }
              return resolve(results);
          });
      });
  })
};