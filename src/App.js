import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./util/WavePortal.json";
import GM from "./component/GM";

export default function App() {

  const [currentAccount, setCurrentAccount] = useState("");
  // contract address from deployment on etherscan
  const contractAddress = "0x6D8C1B881Fac8DeBD2cb4819c69A83069E85F05D";
  const contractABI = abi.abi;

  const [isLoading, setIsLoading] = useState(false);
  const [waveCount, setWaveCount] = useState(0);

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
        setCurrentAccount("");
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
        console.log("Retrieved total gm count...", count.toNumber());

        // execute the wave() transaction on the contract
        const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        const mineTxn = await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        if (mineTxn) setIsLoading(false);

        // get the new total gm count
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total gm count...", count.toNumber());
        setWaveCount(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const getTotalWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        setWaveCount(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getTotalWaves();
  }, [currentAccount]);


  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          <span role="img" aria-label="gm">👋 </span> Welcome to Avrahm's <GM /> Portal!
        </div>

        <div className="bio">
          I'm Avrahm, a father, skydiver, web developer, and now a blockchain developer!
          <br />
          <br />
          This is my <GM /> Portal, a decentralized application that allows users to say <GM />!
          <br />
          <br />
          Let's connect! Visit me at <a href="https://avrahm.com">Avrahm.com</a> or <a href="https://twitter.com/avrahm">@avrahm</a> on Twitter.
        </div>

        <div className="gmBox">

          {/* if there is no currentAccount show this button */}
          {!currentAccount ? (
            <>
              <p>Connect your Ethereum wallet and say <GM /> to me! </p>
              <button className="gmButton" onClick={connectWallet}>
                Connect Wallet
              </button>
            </>
          ) : (
            <>
              <div className="gmCount">
                {waveCount} <GM />'s
              </div>
              {!isLoading ? (
                <button className="gmButton" onClick={wave}>
                  Say <GM /> to me
                </button>
              ) : (
                <button disabled className="gmButton">Sending your <span className="gm">gm</span>, please wait...</button>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
