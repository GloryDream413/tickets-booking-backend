import mysql from 'mysql';
var pool = mysql.createPool({
  host: 'localhost',
  user: 'alek_db',
  password: '(&zjn$#2Z',
  database: 'tickets'
});

export const getTicketSummary = async function () {
  return new Promise((resolve, reject) => {
    var sql = "SELECT * FROM tickets_summary";
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
        return resolve(results[0]);
      });
    });
  })
};

export const insertTicketSummary = async function (tickets_sold, current_price) {
  return new Promise((resolve, reject) => {
    var sql = "INSERT INTO tickets_summary (total_sold, current_price) VALUES (?, ?)";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      connection.query(sql, [tickets_sold, current_price], function (err, results) {
        connection.release();
        if (err) {
          console.log(err);
          return reject(err);
        }
        console.log('Tickets summary data is inserted');
        return resolve(results.insertId);
      });
    });
  })
};

export const updateTicketSummary = async function (tickets_sold, current_price) {
  return new Promise((resolve, reject) => {
    var sql = "UPDATE tickets_summary SET total_sold = ?, current_price = ?";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      connection.query(sql, [tickets_sold, current_price], function (err, results) {
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

export const insertSoldTicket = async function (userId, stripe_trans, stripe_amount, crypto_token, crypto_amount, crypto_tx, usd_amount, nft_tx, nft_id) {
  return new Promise((resolve, reject) => {
    var sql = "INSERT INTO tickets_sold (user_id, stripe_trans, stripe_amount, crypto_token, \
      crypto_amount, crypto_tx, usd_amount, nft_tx, nft_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      connection.query(sql, [userId, stripe_trans, stripe_amount, crypto_token, crypto_amount, crypto_tx, usd_amount, nft_tx, nft_id], function (err, results) {
        connection.release();
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(results.insertId);
      });
    });
  })
}

export const updateSoldTicketNFT = async function (userId, ticket_id, nft_tx, nft_id) {
  return new Promise((resolve, reject) => {
    var sql = "UPDATE tickets_sold SET nft_tx = ?, nft_id = ? WHERE user_id = ? AND ticket_id = ?";
    pool.getConnection(function (err, connection) {
      if (err) {
        console.log(err);
        return reject(err);
      }
      connection.query(sql, [nft_tx, nft_id, userId, ticket_id], function (err, results) {
        connection.release();
        if (err) {
          console.log(err);
          return reject(err);
        }
        return resolve(results.insertId);
      });
    });
  })
}

export const getAllTickets = async function () {
  return new Promise((resolve, reject) => {
    var sql = "SELECT A.ticket_id, A.stripe_trans, A.stripe_amount, A.crypto_token, round(A.crypto_amount, 6) as crypto_amount, A.crypto_tx, case when LENGTH(A.crypto_tx) > 5 then CONCAT(left(A.crypto_tx, 5), '...', right(A.crypto_tx, 5)) else A.crypto_tx end AS short_crypto_tx, A.usd_amount, A.nft_id, B.email FROM tickets_sold AS A LEFT JOIN users AS B ON A.user_id = B.id";
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


export const getUserTickets = async function (userId) {
  return new Promise((resolve, reject) => {
    var sql = "SELECT ticket_id, stripe_trans, stripe_amount, crypto_token, round(crypto_amount, 6) as crypto_amount, crypto_tx, case when LENGTH(crypto_tx) > 5 then CONCAT(left(crypto_tx, 7), '...', right(crypto_tx, 7)) else crypto_tx end AS short_crypto_tx, usd_amount, nft_id FROM tickets_sold WHERE user_id = ?";
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