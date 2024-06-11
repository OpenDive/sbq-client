import { useState, useEffect, Fragment } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

// import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

import {
  CLIENT_ID,
  FULLNODE_URL,
  KEY_PAIR_SESSION_STORAGE_KEY,
  MAX_EPOCH_LOCAL_STORAGE_KEY,
  RANDOMNESS_SESSION_STORAGE_KEY,
  REDIRECT_URI
} from "./constant.tsx";
import {
  generateNonce,
  generateRandomness,
} from "@mysten/zklogin";
import { SuiClient } from "@mysten/sui.js/client";

function App() {
  const [nonce, setNonce] = useState("");
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair>();
  const [maxEpoch, setMaxEpoch] = useState(0);
  const [randomness, setRandomness] = useState("");

  const suiClient = new SuiClient({ url: FULLNODE_URL });

  // Get Randomness
  useEffect(() => {
    const randomness = generateRandomness();
    window.sessionStorage.setItem(
      RANDOMNESS_SESSION_STORAGE_KEY,
      randomness
    );
    setRandomness(randomness);
  }, []);

  // Get Epoch
  useEffect(() => {
    async function epochFetch() {
      const { epoch } = await suiClient.getLatestSuiSystemState();
      window.localStorage.setItem(
        MAX_EPOCH_LOCAL_STORAGE_KEY,
        String(Number(epoch) + 10)
      );
      setMaxEpoch(Number(epoch) + 10);
    }
    epochFetch();
  }, []);

  // Generate Ephemeral Keypair
  useEffect(() => {
    const ephemeralKeyPair = Ed25519Keypair.generate();
    window.sessionStorage.setItem(
      KEY_PAIR_SESSION_STORAGE_KEY,
      ephemeralKeyPair.getSecretKey()
    );
    setEphemeralKeyPair(ephemeralKeyPair);
  }, []);

  // Generate Nonce
  useEffect(() => {
    if (!ephemeralKeyPair) { return; }
    const nonce = generateNonce(
      ephemeralKeyPair.getPublicKey(),
      maxEpoch,
      randomness
    );
    setNonce(nonce);
  }, [ephemeralKeyPair, maxEpoch, randomness]);

  function loginZK() {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "id_token",
        scope: "openid",
        nonce: nonce,
      });
      const loginURL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      window.location.replace(loginURL);
  }

  return (
    <Fragment>
      <button onClick={loginZK}>SIGN IN WITH GOOGLE</button>
    </Fragment>
  )
}

export default App
