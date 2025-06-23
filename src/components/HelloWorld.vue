<script setup>
import { ref, onMounted } from 'vue'
import { useMainStore } from '../stores'
import { getWallets } from '@mysten/wallet-standard'

const mainStore = useMainStore()

onMounted(() => {
  // const wallet = getWallets().get().find(e => e.name === "Slush")
  // wallet.features['standard:events'].on('change', (event) => {
  //   if (event.accounts.length === 0 || event.accounts[0] !== mainStore.address) {
  //     console.log('User change or disconnect ...');
  //     // 断开钱包后的业务逻辑
  //     setTimeout(() => {
  //         window.localStorage.removeItem("connectedAddress")
  //         window.localStorage.removeItem("connectedWallet")
  //         window.location.reload()
  //     }, 1000)
  //   }
  // });
  mainStore.initWallet()
  
})
</script>

<template>
  <div v-if="mainStore.address">
    <p>connected wallet: {{ mainStore.address }}</p>
    <input type="text" v-model="mainStore.amount" placeholder="amount" />
    <input type="text" v-model="mainStore.toAddress" placeholder="to address" />
    <button @click="mainStore.transferSui">transfer sui</button>
    <div>
      <button @click="mainStore.disconnectWallet">disconnect</button>
    </div>
  </div>
  <div v-else>
    <button v-for="wallet in mainStore.supportWallets" :key="wallet" @click="mainStore.connectWallet(wallet)">connect with:{{ wallet }}</button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
