import {BrowserRouter, Routes, Route} from "react-router-dom";
import Navigation from './Navbar';
import Home from './Home.js'
import Create from './Create.js'
import MyListedItems from './MyListedItems.js'
import MyPurchases from './MyPurchases.js'
import MarketPlaceAbi from '../contractsData/MarketPlace.json'
import MarketPlaceAddress from '../contractsData/MarketPlace-address.json'
import NFTAbi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'
import { useState } from 'react'
import { ethers } from "ethers"
import { Spinner } from 'react-bootstrap'

import './App.css';

function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [marketPlace, setMarketPlace] = useState({})

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log(accounts[0])
    setAccount(accounts[0])
    // console.log(account)
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()
    console.log(signer)
    //const signer = "0x691721E909f0C10533E7359C3d9f7145C07AF590";

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
    loadContracts(signer)
  }
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketPlace = new ethers.Contract(MarketPlaceAddress.address, MarketPlaceAbi.abi, signer)
    setMarketPlace(marketPlace)
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer)
    setNFT(nft)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
            <Route path="/" element={
              <Home marketPlace={marketPlace} nft={nft} />
            } />
            <Route path="/create" element={
              <Create marketplace={marketPlace} nft={nft} />
            } />
            <Route path="/my-listed-items" element={
              <MyListedItems marketplace={marketPlace} nft={nft} account={account} />
            } />
            <Route path="/my-purchases" element={
              <MyPurchases marketplace={marketPlace} nft={nft} account={account} />
            } />
          </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>

  );
}

export default App;
