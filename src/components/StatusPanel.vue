<template>
  <div id="statusContainer">
    <span id="statusText">{{ statusText }}</span>
    <span id="spinner" v-show="waitingForComputer">⏳</span>
    <span id="coordDisplay">{{ coordText }}</span>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'StatusPanel',
  
  setup() {
    const store = useStore()
    const coordText = ref('')
    
    const waitingForComputer = computed(() => store.state.waitingForComputer)
    const gameOver = computed(() => store.state.gameOver)
    
    const statusText = computed(() => {
      if (gameOver.value) {
        if (store.state.winLine.length > 0) {
          return store.state.lastMove.color === store.state.playerPiece ? 
            "🎉 玩家获胜！" : "💻 电脑获胜！"
        }
        return "⚖️ 平局！"
      }
      return waitingForComputer.value ? "电脑正在思考..." : "请玩家落子"
    })
    
    return {
      statusText,
      waitingForComputer,
      coordText
    }
  }
}
</script>

<style scoped>
#statusContainer { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 8px; 
  background: var(--light); 
  padding: 12px; 
  border-radius: var(--radius-md); 
  font-size: 15px;
  margin: 8px 0;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
  min-height: 50px;
  border-left: 4px solid var(--primary);
}

#statusText {
  font-weight: 600;
  color: var(--dark);
}

#spinner { 
  animation: spin 1s linear infinite;
  font-size: 18px;
}

@keyframes spin { 
  0% { transform: rotate(0deg); } 
  100% { transform: rotate(360deg); }
}

#coordDisplay {
  color: var(--primary);
  font-size: 14px;
  font-weight: 500;
}
</style> 