import { defineStore } from 'pinia'
import { getWallets } from '@mysten/wallet-standard'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'

const suiClient = new SuiClient({
  url: getFullnodeUrl(import.meta.env.VITE_SUPPORT_NETWORK),
});

export const useMainStore = defineStore('main', {
  state: () => ({
    address: window.localStorage.getItem("connectedAddress") || '',
    supportWallets: import.meta.env.VITE_SUPPORT_WALLETS.split(","),
    connectedWallet: window.localStorage.getItem("connectedWallet") || '',
    amount: 0,
    toAddress: '',
    hash: '',
  }),
  actions: {
    initWallet() {
      const connectedWallet = window.localStorage.getItem("connectedWallet")
      const connectedAddress = window.localStorage.getItem("connectedAddress")
      if (connectedWallet && this.supportWallets.includes(connectedWallet) && connectedAddress) {
        this.connectWallet(connectedWallet)
      }
    },
    // 连接钱包(以 Slush 为例)
    async connectWallet(walletName) {
      try {
        const availableWallets = getWallets().get();
        let wallet = availableWallets.find(e => e.name === walletName)
        await wallet.features['standard:connect'].connect();
        if (wallet.accounts.length > 0) {
          // 通常第一个就是当前 active 的地址
          const address = wallet.accounts[0].address
          this.connectedWallet = wallet.name
          this.address = address
          window.localStorage.setItem("connectedAddress", address)
          window.localStorage.setItem("connectedWallet", wallet.name)
        }
        // 监听钱包地址变化, 断开
        wallet.features['standard:events'].on('change', (event) => {
          // 如果当前钱包的地址与存储的地址不一致或者断开连接的业务逻辑
          if (event.accounts.length === 0 || event.accounts[0].address !== this.address) {
            console.log('User change or disconnect ...');
            setTimeout(() => {
              window.localStorage.removeItem("connectedAddress")
              window.localStorage.removeItem("connectedWallet")
              window.location.reload()
            }, 1000)
          }
        });
      } catch (error) {
        console.log(error);
      }
    },
    // 断开钱包
    async disconnectWallet() {
      try {
        const availableWallets = getWallets().get();
        const walletName = window.localStorage.getItem("connectedWallet")
        let wallet = availableWallets.find(e => e.name === walletName)
        if (wallet === undefined) {
          return
        }
        await wallet.features['standard:disconnect'].disconnect();
        window.localStorage.removeItem("connectedAddress")
        window.localStorage.removeItem("connectedWallet")
        window.location.reload()
      } catch (error) {
        console.log('meet some errors ');
      }
    },
    // 转账
    async transferSui() {
      try {
        const wallet = getWallets().get().find(e => e.name === this.connectedWallet)
        const amount = this.amount
        const toAddress = this.toAddress
        const tx = new Transaction()
        const [coin] = tx.splitCoins(tx.gas, [amount * 1e9])
        tx.transferObjects([coin], toAddress)
        const { bytes, signature } = await wallet.features['sui:signTransaction'].signTransaction({
          transaction: tx,
          account: wallet.accounts[0],
          chain: `sui:${import.meta.env.VITE_SUPPORT_NETWORK}`
        });
        const executeRes = await suiClient.executeTransactionBlock({
          transactionBlock: bytes,
          signature: signature,
          options: {
            showEffects: true,
            showObjectChanges: true,
            showBalanceChanges: true,
            showEvents: true,
            showInput: true
          }
        });
        this.hash = executeRes.digest
      } catch (error) {
        console.log(error);
      }
    }
  },
})