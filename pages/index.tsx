import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Web3Modal from 'web3modal';
import { providers, Contract, ethers } from 'ethers';
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { WHITELIST_CONTRACT_ADDRESS, abi } from '../constants';
import Core from 'web3modal';
import svg from '../img/crypto-devs.svg';
import { type } from 'os';

type walletConnectedState = {
  walletConnected: [boolean, Dispatch<SetStateAction<boolean>>];
};

type numberOfWhitelisted = {};

export default function Home() {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);

  const [joinedWhiteList, setJoinedWhitelist] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState<any>(0);

  const web3ModalRef = useRef<Core | any>();

  const getProviderOrSigner = async (needSigner: boolean = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert('Change the network to Goreli');
      throw new Error('Change network to Goerli');
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  //addAddressToWhitelist

  const addAddressToWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      //call the addAddressTo WhiteList
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      //wait for transaction to get mined
      await tx.wait();
      setLoading(false);

      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.log(err);
    }
  };

  //getNumber of Whilisted

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );

      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.log(err);
    }
  };

  //checkAddressInWhitelist

  const checkIfAddressInWhitelist = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();

      const _joinedWhitelist = await whitelistContract.whitelistedAddress(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
    } catch (err) {
      console.log(err);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);

      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();
    } catch (err) {
      console.error(err);
    }
  };

  //renderBtn

  const renderButton = () => {
    if (walletConnected) {
      if (joinedWhiteList) {
        return (
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className={styles.button}>Loading</button>;
      } else {
        return (
          <button className={styles.button} onClick={addAddressToWhitelist}>
            Join the Whitelist
          </button>
        );
      }
    } else {
      return <button onClick={connectWallet}>Connect your wallet</button>;
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name='description' content='Whitelist-Dapp' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            {/* Using HTML Entities for the apostrophe */}
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src='./crypto-devs.svg' alt='bg' />
        </div>
      </div>
      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
