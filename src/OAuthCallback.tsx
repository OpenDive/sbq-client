import { useEffect, Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import {
    computeZkLoginAddress
  } from "@mysten/zklogin";
import { Unity, useUnityContext } from "react-unity-webgl";
import { USER_SUI_ADDRESS_STORAGE_KEY } from './constant';


function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  const { unityProvider, loadingProgression, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "../public/SuiBattleQuest.loader.js",
    dataUrl: "../public/SuiBattleQuest.data",
    frameworkUrl: "../public/SuiBattleQuest.framework.js",
    codeUrl: "../public/SuiBattleQuest.wasm",
  });

  function handleSuiAddress(address: string) {
    sendMessage("Web3Controller", "OnSuiAddress", address);
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
        aud: jwt.aud as string,
        iss: jwt.iss!
      });
      window.localStorage.setItem(
        USER_SUI_ADDRESS_STORAGE_KEY,
        login_address
      );
      console.log(`DEBUG: SUI ADDRESS BEFORE LOADED - ${login_address}`);
    }
  }, [location, navigate]);

  useEffect(() => {
    const login_address = window.localStorage.getItem(USER_SUI_ADDRESS_STORAGE_KEY)!;
    console.log(`DEBUG: SUI ADDRESS ON LOADED - ${login_address}`);
    handleSuiAddress(login_address);
  }, [isLoaded]);

  return (
    <Fragment>
        <p>Loading Game... {Math.round(loadingProgression * 100)}%</p>
        <Unity 
        unityProvider={unityProvider} 
        style={{ 
            width: 800, 
            height: 600,
            visibility: isLoaded ? "visible" : "hidden"
        }}
        />
  </Fragment>
  );
}

export default OAuthCallback;