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

export const getMarketData = async function (capID) {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM crypto_market_data WHERE id = ?";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      connection.on('error', function (err) {
        console.log('>>> error >>>', err);
      });

      connection.query(sql, [capID], function (err, results) {
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

export const insertMarketData = async function (data) {
  return new Promise((resolve, reject) => {
    var sql = "INSERT INTO crypto_market_data (id, name, symbol, price_usd, last_updated) VALUES (?, ?, ?, ?, ?)";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      var date = new Date(data.last_updated);
      connection.query(sql, [data.id, data.name, data.symbol, data.quote.USD.price, format(date, 'YYYY-MM-DD HH:mm:ss')], function (err, results) {
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
