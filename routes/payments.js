import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Stripe from 'stripe';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { mintNFTwithMetadata } from '../utils/tatum.js';
import { getTicketSummary, insertTicketSummary, updateTicketSummary, insertSoldTicket, updateSoldTicketNFT } from '../models/ticket.js';
import { getAllMarketData } from '../models/market_data.js';

var payment_router = express.Router();
const saltRounds = 10
const startTicketPrice = 7.0;

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const IPFS_URL = process.env.IPFS_URL;

payment_router.post('/payStripe', async (req, res) => {
  try {
    console.log('Confirm pay', req.body);
    // Create the PaymentIntent
    let intent = await stripe.paymentIntents.create({
      payment_method: req.body.payment_method_id,
      description: "Buy tickets",
      amount: Math.ceil(req.body.amount.toFixed(2) * 100),
      currency: 'usd',
      confirmation_method: 'manual',
      confirm: true
    });
    // Send the response to the client
    return generateResponse(res, intent, req.body.ticket_count, req.body.userId, req.body.payment_method_id);
  } catch (e) {
    // Display error on client
    return res
      .status(400)
      .json({ error: e.message });
  }
});

const generateResponse = async (res, intent, ticket_count, userId, stripe_trans) => {
  if (intent.status === 'succeeded') {
    // The payment didn’t need any additional actions and completed!
    // Handle post-payment fulfillment
    var ticket_summary = await getTicketSummary();

    for(var i = 0 ; i < ticket_count ; i++) {
      var ticket_id = await insertSoldTicket(userId, stripe_trans, ticket_summary.current_price, '', '', '', ticket_summary.current_price, '','');
      var txId = null;
      try {
        const mintResp = await mintNFTwithMetadata(ticket_id, IPFS_URL);
        txId = mintResp.txId;
      } catch (err) {
        // Display error on client
        return res
          .status(err.response.data.statusCode)
          .json({ error: err.response.data });
      }

      if (txId) {
        await updateSoldTicketNFT(userId, ticket_id, txId, ticket_id);
      }
    }

    ticket_summary.total_sold += ticket_count;
    const multiply = Math.floor(ticket_summary.total_sold / 500);
    var new_ticket_price = startTicketPrice + multiply * 0.01;
    await updateTicketSummary(ticket_summary.total_sold, new_ticket_price);

    return res
      .status(200)
      .json({ result: "success", new_ticket_price: new_ticket_price });
  } else {
    // Invalid status
    return res
      .status(500)
      .json({ error: "Invalid PaymentIntent status" });
  }
};


payment_router.post('/payCrypto', async (req, res) => {
  try {
    console.log('Confirm crypto Pay', req.body);
    
    var ticket_summary = await getTicketSummary();
    var ticket_count = req.body.ticketCount;
    var userId = req.body.userId;

    for(var i = 0 ; i < req.body.ticketCount ; i++) {
      var ticket_id = await insertSoldTicket(req.body.userId, '', 0, req.body.token, req.body.amount, req.body.txHash, req.body.usd_amount, '','');
      var txId = null;
      try {
        txId = await mintNFTwithMetadata(ticket_id, IPFS_URL);
      } catch (err) {
        // Display error on client
        return res
          .status(err.response.data.statusCode)
          .json({ error: err.response.data });
      }
      console.log(' >>> txId >>> ', txId);
      if (txId != null) {
        await updateSoldTicketNFT(userId, ticket_id, txId, ticket_id);
      }
    }

    ticket_summary.total_sold += ticket_count;
    const multiply = Math.floor(ticket_summary.total_sold / 500);
    var new_ticket_price = startTicketPrice + multiply * 0.01;
    await updateTicketSummary(ticket_summary.total_sold, new_ticket_price);

    return res
      .status(200)
      .json({ result: "success", new_ticket_price: new_ticket_price });
  } catch (e) {
    // Display error on client
    return res
      .status(400)
      .json({ error: e.message });
  }
});

payment_router.get('/market_data', async (req, res) => {
  try {
    console.log('Get Market Data');
    
    var market_data = await getAllMarketData();
    return res
      .status(200)
      .json({ result: "success", market_data: market_data });
  } catch (e) {
    // Display error on client
    return res
      .status(400)
      .json({ error: e.message });
  }
});

export default payment_router;
