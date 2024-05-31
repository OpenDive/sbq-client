import React, { useEffect, Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import {
    computeZkLoginAddress
  } from "@mysten/zklogin";
import { Unity, useUnityContext } from "react-unity-webgl";


function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  const { unityProvider, loadingProgression, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "../public/UnityWeb3-WebGL.loader.js",
    dataUrl: "../public/UnityWeb3-WebGL.data",
    frameworkUrl: "../public/UnityWeb3-WebGL.framework.js",
    codeUrl: "../public/UnityWeb3-WebGL.wasm",
  });

  function handleOnZkLogin() {
    sendMessage("Web3Controller", "OnZkLogin", "true");
  }


  useEffect(() => {
    const hash = location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // Remove the leading '#'
      const idToken = params.get('id_token');
      const jwt = jwtDecode(idToken!);
      const login_address = computeZkLoginAddress({
        userSalt: "",
        claimName: "sub",
        claimValue: jwt.sub!,
        aud: jwt.aud,
        iss: jwt.iss!
      });
      console.log(`LOGIN ADDR - ${login_address}`);
    }
  }, [location, navigate]);

  return (
    <Fragment>
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
  );
}

export default OAuthCallback;