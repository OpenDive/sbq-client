import 'dotenv/config'
import express from 'express';

import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { KioskClient, Network } from '@mysten/kiosk';

const options = {
    method: 'GET', 
    headers: {
        accept: 'application/json', 'x-api-key': process.env.INDEXER_API
    }
};
const addr = "0x6045d15865d74a53dc42e481280190aec7d06463f40088acf49ea4585acc29e2"
const suiFrensPackage = "0xee496a0cc04d06a345982ba6697c90c619020de9e274408c7819f787ff66e1a1"

const app = express();


// localhost:8280/api/?address=0x6045d15865d74a53dc42e481280190aec7d06463f40088acf49ea4585acc29e2
app.get("/api/getSuiFrens", (req, res) => {
    const address = req.query.address
    res.json({ address: address });
});
  
app.get("/api/hello", (req, res) => {
    res.json({ hello: "world" });
});

export const handler = app;