import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./util/WavePortal.json"

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  // contract address from deployment on etherscan
  const contractAddress = "0x6D8C1B881Fac8DeBD2cb4819c69A83069E85F05D";
  const contractABI = abi.abi;

  const [isLoading, setIsLoading] = useState(false);

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

  const wave = async () => {
    setIsLoading(true);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        // execute the wave() transaction on the contract
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        const mineTxn = await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        if (mineTxn) setIsLoading(false);

        // get the new total wave count
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
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
          <br />
          <br />
          Let's connect! Visit me at <a href="https://avrahm.com">Avrahm.com</a> or <a href="https://twitter.com/avrahm">Twitter</a>
        </div>

        {!isLoading ? (
          <button className="waveButton" onClick={wave}>
            Wave at Me
          </button>
        ) : (<div className="waveButton">Sending your wave, please wait...</div>)}

        {/* if there is no currentAccount show this button */}
        {!currentAccount && (
          <>
            <p>Connect your Ethereum wallet and wave at me! </p>
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          </>
        )}

      </div>
    </div>
  );
}
