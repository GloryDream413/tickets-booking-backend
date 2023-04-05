import mysql from 'mysql';
import { format } from 'fecha';

var pool = mysql.createPool({
  connectionLimit: 100,
  host: 'localhost',
  user: 'alek_db',
  password: '(&zjn$#2Z',
  database: 'tickets',
  timezone: 'Z'
});

export const getReferralCodes = async function (userId) {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM referrals WHERE user_id = ?";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }

      connection.query(sql, [userId], function (err, results) {
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

export const insertReferralCode = async function (user_id, referral_code) {
  return new Promise((resolve, reject) => {
    var sql = "INSERT INTO referrals (user_id, referral_code) VALUES (?, ?)";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      connection.query(sql, [user_id, referral_code], function (err, results) {
        connection.release();
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(results.insertId);
      });
    });
  })
};

// export const updateMarketData = async function(capID, data) {
//   return new Promise((resolve, reject) => {
//       var sql = "UPDATE crypto_market_data SET price_usd = ?, last_updated = ? WHERE id = ?";
//       pool.getConnection(function(err, connection) {
//           if (err) { 
//               console.log(err); 
//               return reject(err);
//           }
//           var date = new Date(data.last_updated);
//           connection.query(sql, [data.quote.USD.price, format(date, 'YYYY-MM-DD HH:mm:ss'), capID], function(err, results) {
//               connection.release();
//               if (err) { 
//                   console.log(err); 
//                   return reject(err); 
//               }
//               return resolve(results);
//           });
//       });
//   })
// };

export const updateMarketData = async function (capID, data) {
  return new Promise((resolve, reject) => {
    var sql = "UPDATE crypto_market_data SET price_usd = ?, last_updated = ? WHERE id = ?";
    var date = new Date(data.last_updated);
    pool.query(sql, [data.quote.USD.price, format(date, 'YYYY-MM-DD HH:mm:ss'), capID], function (err, results) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(results);
    });
  })
};

export const loginUser = async function (email) {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM users WHERE email = ? AND status = 0";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      connection.query(sql, [email], function (err, results) {
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

export const getAllMarketData = async function () {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM crypto_market_data";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }

      connection.query(sql, [], function (err, results) {
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
