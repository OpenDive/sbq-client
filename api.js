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

    const client = new SuiClient({
        url: getFullnodeUrl('mainnet'),
    })

    const kioskClient = new KioskClient({
        client,
        network: Network.MAINNET,
    });

    // You can perform actions, like querying the owned kiosks for an address.
    const { _, kioskIds } = await kioskClient.getOwnedKiosks({ address: address });

    const suiFrensKioskIds = [];
    kioskIds.forEach(async (id) => {
        const res = await kioskClient.getKiosk({ id });
        res.items.forEach((itm) => {
            if (itm.type.includes(suiFrensPackage)) {
                suiFrensKioskIds.push(itm.objectId);
            }
        });
    });
    await new Promise(r => setTimeout(r, (250 * (kioskIds.length * 2))));

    var frens = [];
    if (suiFrensKioskIds.length <= 50) {
        frens = await client.multiGetObjects({
            ids: suiFrensKioskIds,
            options: {
                showContent: true,
                showDisplay: true
            }
        });
        await new Promise(r => setTimeout(r, 250));
    } else {
        var suiFrensIdChunk = chunkArray(suiFrensKioskIds, 50);
        suiFrensIdChunk = suiFrensIdChunk.map(arr => {
            return arr.filter(i => i !== undefined);
        });
        suiFrensIdChunk.forEach(async (ids) => {
            const res = await client.multiGetObjects({
                ids: ids,
                options: {
                    showContent: true,
                    showDisplay: true
                }
            });
            frens.push(res);
        });
        await new Promise(r => setTimeout(r, (250 * suiFrensIdChunk.length)));
        frens = frens.flat();
    }

    var returnFrensObjects = []

    frens.forEach(fren => {
        const display = fren.data.display.data
        const fields = fren.data.content.fields
        returnFrensObjects.push({
            id: fren.data.objectId,
            image: display.image_url,
            attributes: fields.attributes,
            genes: fields.genes
        });
    });

    res.json({ 
        frens: returnFrensObjects,
    });
});

export const handler = app;