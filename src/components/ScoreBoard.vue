<template>
  <div class="panel-card">
    <div class="scoreboard">
      <div class="score-box">
        <span class="score-label">玩家胜：</span>
        <span class="player-score">{{ playerScore }}</span>
      </div>
      <div class="score-box">
        <span class="score-label">电脑胜：</span>
        <span class="computer-score">{{ computerScore }}</span>
      </div>
      <button id="resetScore" @click="resetScore">
        <span class="btn-icon">🔄</span>重置
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ScoreBoard',
  
  setup() {
    const store = useStore()
    
    const playerScore = computed(() => store.state.playerScore)
    const computerScore = computed(() => store.state.computerScore)
    
    const resetScore = () => {
      store.commit('updateScore', { player: 0, computer: 0 })
      store.dispatch('initGame')
    }
    
    return {
      playerScore,
      computerScore,
      resetScore
    }
  }
}
</script>

<style scoped>
.panel-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 15px;
  box-shadow: var(--shadow-md);
  transition: var(--transition-fast);
  border: 1px solid rgba(0,0,0,0.05);
}

.panel-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.scoreboard { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  gap: 10px; 
  font-size: 15px;
  flex-wrap: wrap; 
  padding: 10px;
}

.score-box { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  background: var(--light); 
  padding: 8px 14px; 
  border-radius: 20px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-fast);
  border: 1px solid rgba(0,0,0,0.05);
}

.score-box:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.score-label {
  color: var(--dark);
  font-weight: 600;
}

.player-score, .computer-score { 
  font-weight: bold; 
  font-size: 18px;
  min-width: 28px;
  text-align: center;
  text-shadow: 0 1px 1px rgba(0,0,0,0.1);
}

.player-score {
  color: var(--primary);
  background: rgba(67, 97, 238, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}

.computer-score {
  color: var(--secondary);
  background: rgba(58, 12, 163, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
}

#resetScore { 
  background-color: var(--danger);
  color: white; 
  border: none; 
  padding: 7px 12px; 
  border-radius: 20px; 
  font-size: 14px; 
  cursor: pointer; 
  transition: var(--transition-normal); 
  box-shadow: var(--shadow-sm);
  font-family: var(--font-main);
  font-weight: 600;
  outline: none;
  min-width: 80px;
  text-align: center;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

#resetScore:hover { 
  background-color: #e41b23;
  transform: translateY(-2px); 
  box-shadow: var(--shadow-md);
}

.btn-icon {
  font-size: 14px;
}

@media (max-width: 768px) {
  .scoreboard {
    padding: 8px;
  }
  
  #resetScore {
    font-size: 13px;
    padding: 6px 10px;
    min-width: 75px;
  }
}
</style> 