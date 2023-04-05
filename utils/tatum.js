import { mintNFTWithUri, EthMintErc721, ipfsUpload, createNFT } from '@tatumio/tatum';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';
import fs from 'fs';

const TicketChain = process.env.TICKET_CHAIN;
const ContractAddress = process.env.CONTRACT_ADDRESS;
const MinterAddress = process.env.MINTER_ADDRESS;
const OwnerAddress = process.env.OWNER_WALLET_ADDRESS;

export const uploadMetadata = async function (token_id, ipfsURL) {
  return new Promise(async (resolve, reject) => {
    try {
      const metadata = {
        name: "The Haven Wood Ticket #" + token_id,
        description: "This is a ticket to see The Haven Wood movie",
        image: ipfsURL,
        tokenId: token_id
      };
      const jsonString = JSON.stringify(metadata);
      console.log(jsonString);
      var metadataJsonFile = './metadata/' + token_id + ".json";
      fs.writeFileSync(metadataJsonFile, jsonString);

      var buffer = fs.readFileSync(metadataJsonFile);

      var ipfsHash = await ipfsUpload(buffer, token_id + ".json");
      return resolve(ipfsHash);
    } catch (err) {
      return reject(err);
    }
  })
};

export const mintNFTwithMetadata = async function (token_id, ipfsURL) {
  return new Promise(async (resolve, reject) => {
    var mintRequest = new EthMintErc721();
    mintRequest.chain = TicketChain;
    mintRequest.contractAddress = ContractAddress;
    mintRequest.minter = MinterAddress;
    mintRequest.to = OwnerAddress;
    mintRequest.tokenId = token_id;
    //mintRequest.url = ipfsURL;
    try {
      var uploadResp = await uploadMetadata(token_id, ipfsURL);
      console.log(' >>> ipfsUpload response >>>', uploadResp);

      mintRequest.url = 'https://ipfs.io/ipfs/' + uploadResp.ipfsHash;
      console.log(mintRequest.url);

      var resp = await mintNFTWithUri(process.env.IS_TESTNET, mintRequest);
      console.log(' >>> mintNFTWithUri response >>>', resp);
      return resolve(resp.txId);
    } catch (err) {
      return reject(err);
    }
  })
};