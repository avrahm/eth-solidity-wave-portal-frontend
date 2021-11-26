import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./util/WavePortal.json";
import GM from "./component/GM";
import moment from "moment";

export default function App() {

  // contract address from deployment on etherscan
  const contractAddress = "0x346509B58AA8F550a687331b4Ea5bcd8F14b9471";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaveMsgs, setAllWaveMsgs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [waveCount, setWaveCount] = useState(0);
  const [gmTextArea, setgmTextArea] = useState("");

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
        await getData();
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

  const wave = async (message) => {
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
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Mining...", waveTxn.hash);

        const mineTxn = await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        if (mineTxn) {
          setIsLoading(false);
          setgmTextArea("");
        }

        // refresh data
        await getData();

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

  const getAllWaveMsgs = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        // get the messages from the contract
        const waves = await wavePortalContract.getAllWaveMsgs();

        // loop through the array of messages and store them in an array
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        // set the state of the array
        setAllWaveMsgs(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getData = async () => {
    await getTotalWaves();
    await getAllWaveMsgs();
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

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
          Let's connect! Visit me at <a href="https://avrahm.com" rel="noopener noreferrer" target="_blank">Avrahm.com</a> or <a href="https://twitter.com/avrahm" rel="noopener noreferrer" target="_blank">@avrahm</a> on Twitter.
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
              {/* show the total gm count */}
              <div className="gmCount">
                {waveCount} <GM />'s
              </div>
              {!isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center', width: '340px', marginTop: '20px' }}>
                  <textarea className="gmTextArea" placeholder="Say something..."
                    onChange={e => setgmTextArea(e.target.value)}
                    value={gmTextArea} />
                  <button disabled={!gmTextArea} className="gmButton" onClick={() => wave(gmTextArea)}>
                    Say <GM /> to me
                  </button>
                </div>
              ) : (
                <button disabled className="gmButton">Sending your <span className="gm">gm</span>, please wait...</button>
              )}

              {/* display wave msgs */}
              {allWaveMsgs.map((wave, index) => {
                return (
                  <div key={index} className="gmMessage">
                    <div className="msgInfo">
                      <div className="msgAvatar">
                        {wave.address.substring(0, 4)}
                      </div>
                      <div className="msgTime">
                        {moment(wave.timestamp, "YYYYMMDD").fromNow()}
                      </div>
                    </div>
                    <div className="msgBody">
                      <div className="msgAddress">
                        From: {wave.address}
                      </div>
                      <div className="msg">
                        {wave.message}
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
