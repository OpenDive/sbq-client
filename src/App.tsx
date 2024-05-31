import { useState, useEffect, Fragment } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
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

import { Unity, useUnityContext } from "react-unity-webgl";
import { PublicKey } from '@mysten/sui/cryptography';


function App() {
  // const [count, setCount] = useState(0)
  const [nonce, setNonce] = useState("");
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair>();
  const [maxEpoch, setMaxEpoch] = useState(0);
  const [randomness, setRandomness] = useState("");

  const { unityProvider, loadingProgression, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "public/UnityWeb3-WebGL.loader.js",
    dataUrl: "public/UnityWeb3-WebGL.data",
    frameworkUrl: "public/UnityWeb3-WebGL.framework.js",
    codeUrl: "public/UnityWeb3-WebGL.wasm",
  });

  function handleOnZkLogin() {
    sendMessage("Web3Controller", "OnZkLogin", "true");
  }

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
      ephemeralKeyPair.export().privateKey
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

      <p>Loading Application... {Math.round(loadingProgression * 100)}%</p>
      <Unity 
        unityProvider={unityProvider} 
        style={{ 
          width: 800, 
          height: 600,
          visibility: isLoaded ? "visible" : "hidden"
        }}
      />
      <button onClick={handleOnZkLogin}>Handle ZK Login</button>
    </Fragment>
  )

  // return (
  //   <>
  //     <div>
  //       <a href="https://vitejs.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.tsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //     <Unity unityProvider={unityProvider} />
  //     <button onClick={handleOnZkLogin}>Handle ZK Login</button>
  //   </>
//   )
}

export default App
