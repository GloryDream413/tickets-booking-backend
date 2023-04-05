import express from 'express';
import { getTicketSummary } from '../models/ticket.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import voucher_codes from 'voucher-code-generator';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { insertReferralCode } from '../models/referrals.js';

import {
  createUser,
  loginUser,
  confirmUser,
  checkUser,
  updateCode,
  getUserCode,
  updatePassword,
  getPovList,
  insertPovList,
  updatePovList
}
  from '../models/user.js';

import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SENDGRID_SENDER = process.env.SENDGRID_SENDER;

var user_router = express.Router();
const saltRounds = 10

let transporter = nodemailer.createTransport({
  host: 'smtp.mandrillapp.com',
  //host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: "apikey",
    pass: "md-I8uJg9iCZB8oqPXE0M5uhQ"
    //pass: process.env.SENDGRID_API_KEY
  }
});

user_router.post('/', async (req, res) => {
  try {
    console.log('Create User', req.body);

    var email = req.body.email;
    var pwd = req.body.password;
    var referral_code = req.body.referral_code;

    if (referral_code == undefined)
      referral_code = "";

    var user = await checkUser(email);
    console.log(user);
    if (user != undefined) {
      return res
        .status(409)
        .json({ error: "The email already exists" });
    }
    let reg_code = voucher_codes.generate({
      length: 6,
      count: 1,
      charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    });

    var salt = await bcrypt.genSalt(saltRounds);
    var hashPassword = await bcrypt.hash(pwd, salt);

    var insertedUser = await createUser(email, hashPassword, reg_code, referral_code);

    const msg = {
      to: email,
      from: SENDGRID_SENDER,
      subject: 'Verify your email',
      html: '<p>Welcome to the Haven Wood</p><p>Your verification code is <span style="font-weight:bold;"> ' + reg_code + '</span></p>',
    }

    transporter.sendMail(msg, function (err, info) {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Sending email is failed" });
      } else {
        return res
          .status(200)
          .json({ result: "success" });
      }
    });
    /*
            sgMail
                .send(msg)
                .then((response) => {
                    return res
                        .status(200)
                        .json({result: "success"});
                })
                .catch((error) => {
                    console.log(error);
                    return res
                        .status(500)
                        .json({error: "Sending email is failed"});
                })
                */
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: "500 Internal Server Error", message: null });
  }
});

user_router.post('/login', async (req, res) => {
  try {
    console.log('Login User', req.body);

    var email = req.body.email;
    var pwd = req.body.password;

    var user = await loginUser(email);

    if (user != null && user != undefined) {

      bcrypt
        .compare(pwd, user.pwd)
        .then(async (resp) => {
          if (resp) {
            let jwtSecretKey = process.env.JWT_SECRET_KEY;
            let data = {
              time: Date(),
              userId: user.id,
            }
            const token = jwt.sign(data, jwtSecretKey);

            var ticket_summary = await getTicketSummary();

            return res
              .status(200)
              .json({
                result: "success",
                token: token,
                ticket_price: ticket_summary.current_price,
                userId: user.id
              });
          } else {
            console.debug("Password is wrong");
            return res
              .status(401)
              .json({ error: "Incorrect email or password" });
          }
        })
        .catch(err => {
          console.error(err.message);
        })
    } else {
      console.debug("No such user");
      return res
        .status(401)
        .json({ error: "Incorrect email or password" });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: "500 Internal Server Error", message: null });
  }
});

user_router.post('/confirm', async (req, res) => {
  try {
    console.log('Confirm User', req.body);

    var email = req.body.email;
    var code = req.body.code;

    var userId = await confirmUser(email, code);
    if (userId != undefined && userId != -1) {
      let jwtSecretKey = process.env.JWT_SECRET_KEY;
      let data = {
        time: Date(),
        userId: userId,
      }
      const token = jwt.sign(data, jwtSecretKey);
      return res
        .status(200)
        .json({ result: "success", token: token, userId: userId });
    }

    return res
      .status(401)
      .json({ error: "Incorrect email or code" });

  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: "500 Internal Server Error", message: null });
  }
});

user_router.post('/sendcode', async (req, res) => {
  try {
    console.log('Send code', req.body);

    var email = req.body.email;

    var user = await checkUser(email);
    if (user == undefined) {
      return res
        .status(404)
        .json({ error: "The email doesn't exist" });
    }

    let reg_code = voucher_codes.generate({
      length: 6,
      count: 1,
      charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    });

    var updateResult = await updateCode(email, reg_code);

    const msg = {
      to: email,
      from: SENDGRID_SENDER,
      subject: 'Password reset code',
      html: '<p>Your password reset code is <span style="font-weight:bold;"> ' + reg_code + '</span></p>',
    }

    transporter.sendMail(msg, function (err, info) {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Sending email is failed" });
      } else {
        return res
          .status(200)
          .json({ result: "success" });
      }
    });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: "500 Internal Server Error", message: null });
  }
});

user_router.patch('/changepassword', async (req, res) => {
  try {
    console.log('Change password', req.body);

    var email = req.body.email;
    var pwd = req.body.password;
    var code = req.body.code;

    var user = await checkUser(email);
    if (user == undefined) {
      return res
        .status(404)
        .json({ error: "The email doesn't exist" });
    }

    var dbCode = await getUserCode(email);
    if (dbCode != code) {
      return res
        .status(400)
        .json({ error: "Invalid code" });
    }

    var salt = await bcrypt.genSalt(saltRounds);
    var hashPassword = await bcrypt.hash(pwd, salt);

    await updatePassword(email, hashPassword);

    return res
      .status(200)
      .json({ result: "success" });
    /*
            sgMail
                .send(msg)
                .then((response) => {
                    return res
                        .status(200)
                        .json({result: "success"});
                })
                .catch((error) => {
                    console.log(error);
                    return res
                        .status(500)
                        .json({error: "Sending email is failed"});
                })
                */
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: "500 Internal Server Error", message: null });
  }
});

user_router.post('/joinpov', async (req, res) => {
  try {
    console.log('Join Pov List', req.body);

    var userId = req.body.userId;
    var fb = req.body.fb == true ? 1 : 0;
    var ig = req.body.ig == true ? 1 : 0;
    var tt = req.body.tt == true ? 1 : 0;
    var tw = req.body.tw == true ? 1 : 0;

    var pov = await getPovList(userId);

    if (pov == undefined) {
      await insertPovList(userId, fb, ig, tt, tw);
    } else {
      await updatePovList(userId, fb, ig, tt, tw);
    }

    let referral_code = voucher_codes.generate({
      length: 20,
      count: 1,
      charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz"
    });

    await insertReferralCode(userId, referral_code);

    return res
      .status(200)
      .json({
        result: "success",
        referral_code : referral_code
      });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: e });
  }
});

user_router.get('/povlist/:userid', async (req, res) => {
  try {
    console.log('Get Pov List', req.params);

    var userId = req.params.userid;

    var pov = await getPovList(userId);

    if (pov == undefined) {
      return res
        .status(200)
        .json({
          result: "success",
          pov: {
            fb : false,
            ig: false,
            tt: false,
            tw: false
          }
        });
    } else {
      return res
        .status(200)
        .json({
          result: "success",
          pov: {
            fb: pov.fb == 1 ? true : false,
            ig: pov.ig == 1 ? true : false,
            tt: pov.tt == 1 ? true : false,
            tw: pov.tw == 1 ? true : false,
          }
        });
    }
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ error: e });
  }
});

/*
user_router.patch('/:id/:uid', async(req, res) => {
    try {
        console.log('update application', req.params, req.body);

        const shopifyRes = await fetch(req.body.shopURL + '/admin/oauth/access_scopes.json', {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': req.body.shopifyAccessToken}
        });

        if (!shopifyRes.ok) {
            return res
                .status(200)
                .json({error: "shopify error", message: "Failed to validate shopify"});
        }
        var res_data = await shopifyRes.json(); 
        if (res_data === null || res_data === undefined) {
            return res
                .status(200)
                .json({error: "shopify error", message: "Failed to validate shopify"});
        }

        var access_scopes = [];
        res_data.access_scopes.forEach(scope => {
            access_scopes.push(scope.handle);
        });

        if (access_scopes.length == 0) {
            return res
                .status(200)
                .json({error: "shopify error", message: "No valid scopes"});
        }

        await Project.updateApplication(req.params.id, req.params.uid, JSON.stringify(access_scopes), req.body);

        return res
            .status(200)
            .json({error: null, message: ""});
    } catch (e) {
        console.log(e);
        return res
            .status(500)
            .json({error: "500 Internal Server Error", message: null});
    }
});*/


export default user_router;
