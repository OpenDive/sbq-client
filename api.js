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

function chunkArray(a,s){ // a: array to chunk, s: size of chunks
    return Array.from({length: Math.ceil(a.length / s)})
                .map((_,i) => Array.from({length: s})
                                   .map((_,j) => a[i*s+j]));
}

const app = express();


// localhost:8280/api/?address=0x6045d15865d74a53dc42e481280190aec7d06463f40088acf49ea4585acc29e2
app.get("/api/getSuiFrens", async (req, res) => {
    const address = req.query.address
    // res.json({ address: address });

    const client = new SuiClient({
        url: getFullnodeUrl('mainnet'),
    })

    const kioskClient = new KioskClient({
        client,
        network: Network.MAINNET,
    });

    // You can perform actions, like querying the owned kiosks for an address.
    const { _, kioskIds } = await kioskClient.getOwnedKiosks({ address: addr });

    const suiFrensKioskIds = kioskIds.filter(async (id) => {
        const res = await kioskClient.getKiosk({
            id,
            options: {
                withKioskFields: true, // this flag also returns the `kiosk` object in the response, which includes the base setup
                withListingPrices: true, // This flag enables / disables the fetching of the listing prices.
                objectOptions: {
                    showContent: true,
                    showDisplay: true
                }
            }
        });
        await new Promise(r => setTimeout(r, 250));
        return res.items.some((item) => item.type.includes(suiFrensPackage));
    });

    await new Promise(r => setTimeout(r, (250 * (kioskIds.length + 10))));

    var suiFrensIds = []

    suiFrensKioskIds.forEach(async (id) => {
        const res = await kioskClient.getKiosk({
            id,
            options: {
                withKioskFields: true, // this flag also returns the `kiosk` object in the response, which includes the base setup
                withListingPrices: true, // This flag enables / disables the fetching of the listing prices.
                objectOptions: {
                    showContent: true,
                    showDisplay: true
                }
            }
        });
        await new Promise(r => setTimeout(r, 250));
        suiFrensIds.push(res.itemIds);
    });

    await new Promise(r => setTimeout(r, (250 * (kioskIds.length + 10))));

    suiFrensIds = suiFrensIds.flat();
    var suiFrensIdChunk = chunkArray(suiFrensIds, 50);
    suiFrensIdChunk = suiFrensIdChunk.map(arr => {
        return arr.filter(i => i !== undefined);
    });

    var frens = [];
    suiFrensIdChunk.forEach(async (ids) => {
        const res = await client.multiGetObjects({
            ids,
            options: {
                showContent: true,
                showDisplay: true
            }
        });
        await new Promise(r => setTimeout(r, 250));
        frens.push(res);
    });

    await new Promise(r => setTimeout(r, (250 * (suiFrensIdChunk.length))));
    frens = frens.flat();

    res.json({ 
        frens: frens,
        // size: frens.length
    });
});
  
app.get("/api/hello", (req, res) => {
    res.json({ hello: "world" });
});

export const handler = app;