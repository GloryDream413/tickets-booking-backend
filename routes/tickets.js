import express from 'express';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { getTicketSummary, insertTicketSummary, updateTicketSummary, getAllTickets, getUserTickets } from '../models/ticket.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import { mintNFTwithMetadata, uploadMetadata } from '../utils/tatum.js';

var tickets_router = express.Router();

tickets_router.get('/user/:id', async (req, res) => {
  console.log('Get all tickets', req.params);
  try {
    var userTickets = await getUserTickets(req.params.id);
    return res
      .status(200)
      .json({ tickets: userTickets });
  } catch (e) {
    // Display error on client
    return res
      .status(500)
      .json({ error: e.message });
  }
});

tickets_router.get('/current_price', async (req, res) => {
  console.log('Get current ticket price');
  try {
    var ticket_summary = await getTicketSummary();
    return res
      .status(200)
      .json({ ticket_price: ticket_summary.current_price });
  } catch (e) {
    // Display error on client
    return res
      .status(500)
      .json({ error: e.message });
  }
});

tickets_router.post('/testTicketMint', async(req, res) => {
  console.log('testTicketMint', req.body);
  try {
    var resp = await mintNFTwithMetadata(req.body.token_id, req.body.url);
    return res
      .status(200)
      .json({ result: resp });
  } catch (err) {
    // Display error on client
    console.log('testTicketMint error', err.response.data);
    return res
      .status(err.response.data.statusCode)
      .json({ error: err.response.data });
  }
});

tickets_router.post('/testUploadMetadata', async(req, res) => {
  console.log('testUploadMetadata', req.body);
  try {
    var ipfsHash = await uploadMetadata(req.body.token_id, req.body.url);
    return res
      .status(200)
      .json(ipfsHash);
  } catch (err) {
    // Display error on client
    console.log('testUploadMetadata error', err.response.data);
    return res
      .status(err.response.data.statusCode)
      .json({ error: err.response.data });
  }
});

export default tickets_router;
