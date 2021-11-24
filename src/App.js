import React, { useEffect, useState } from "react";
import './App.css';

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("")

  const checkIfWalletIsConnected = async () => {
    try {
      // extract ethereum object from the window
      const { ethereum } = window;

      if (!ethereum) {
        //if ethereum is not available, then metamask is not installed
        console.log("No ethereum object found in window");
        return;
      } else {
        console.log(`Ethereum`, ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log(`Authorized account: `, account);
        //set the current account
        setCurrentAccount(account);
      } else {
        console.log("No authorized accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("No ethereum object found in window");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log(`Connected`, accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const wave = () => {

  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="Wave">👋 </span> Welcome to Avrahm's Wave Portal!
        </div>

        <div className="bio">
          I'm Avrahm, a father, skydiver, web developer, and now a blockchain developer!
          <br />
          <br />
          This is my Wave Portal, a decentralized application that allows users to create and manage their own waves.
          <p>Connect your Ethereum wallet and wave at me! </p>
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {/* if there is no currentAccount show this button */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

      </div>
    </div>
  );
}
