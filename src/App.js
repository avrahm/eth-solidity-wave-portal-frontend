import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./util/WavePortal.json";
import GM from "./component/GM";
import moment from "moment";

export default function App() {

  // contract address from deployment on etherscan
  const contractAddress = "0x0c95E3F9b9f50E8118990EFC172d6B7B71E22f71";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaveMsgs, setAllWaveMsgs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [waveCount, setWaveCount] = useState(0);
  const [gmTextArea, setgmTextArea] = useState("");

  const [buttonText, setButtonText] = useState("Connect Wallet");

  const [status, setStatus] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      // extract ethereum object from the window
      const { ethereum } = window;

      if (!ethereum) {
        //if ethereum is not available, then MetaMask is not installed
        setButtonText("MetaMask not installed!");
        return;
      } else {
        setStatus("Wallet connected!");
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        //set the current account
        setCurrentAccount(account);
        await getData();
      } else {
        setCurrentAccount("");
        setStatus("No authorized accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setButtonText("MetaMask not installed!");
        checkIfWalletIsConnected();
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      setCurrentAccount(accounts[0]);
      checkIfWalletIsConnected();
    } catch (error) {
      setStatus("Unable to connect wallet! Make sure you're using MetaMask and try again.");

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

        // execute the wave() transaction on the contract
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        setStatus(`Mining... ${waveTxn.hash}`);

        const mineTxn = await waveTxn.wait();
        setStatus(`Mined! -- ${waveTxn.hash}`);

        if (mineTxn) {
          setIsLoading(false);
          setgmTextArea("");
        }

        // refresh data
        await getData();

      } else {
        setButtonText("MetaMask not installed!");
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      setStatus("Application failed, please try again.");

      checkIfWalletIsConnected();
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

  let sortAllWaveMsgs = allWaveMsgs.sort((a, b) => new moment(b.timestamp) - new moment(a.timestamp));

  /*
   * Listen in for emitter events!
   */
  useEffect(() => {
    checkIfWalletIsConnected();

    let wavePortalContract;

    const onNewWave = async (from, timestamp, message) => {
      setStatus(`Incoming message...`);
      setAllWaveMsgs(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        }
      ]);
      await getData();
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on('NewWave', onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave);
      }
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setStatus(`Wallet connected: ${currentAccount}`);
    }, 8000);
  }, [status])

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
                {buttonText}
              </button>
            </>
          ) : (
            <>
              {/* show the total gm count */}
              <div className="gmCount">
                {waveCount} <GM />'s
              </div>
              {!isLoading ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column', alignContent: 'center',
                  width: '340px', marginTop: '20px'
                }}>
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


              <div className="status" >
                {status}
              </div>

              {/* display wave msgs */}
              {
                sortAllWaveMsgs.map((wave, index) => {
                  return (
                    <div key={index} className="gmMessage">
                      <div className="msgInfo">
                        <div className="msgAvatar">
                          {wave.address.substring(0, 5)}
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
                })
              }

            </>
          )}

        </div>

      </div>
    </div>
  );
}
