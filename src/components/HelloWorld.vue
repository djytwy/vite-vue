<script setup>
import { onMounted } from 'vue'
import { useMainStore } from '../stores'

const mainStore = useMainStore()

onMounted(() => {
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
    <div v-if="mainStore.hash">Transaction Hash: {{ mainStore.hash }}</div>
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
