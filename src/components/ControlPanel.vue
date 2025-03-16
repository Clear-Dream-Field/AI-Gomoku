<template>
  <div class="panel-card">
    <div class="controls">
      <select id="turnOrder" v-model="selectedTurnOrder" @change="handleTurnOrderChange">
        <option value="player">玩家先手</option>
        <option value="computer">机器人先手</option>
      </select>
      <button id="restart" @click="restart">
        <span class="btn-icon">🔄</span>重新开始
      </button>
      <button id="undo" @click="undo">
        <span class="btn-icon">↩️</span>悔棋
      </button>
      <button id="toggleSound" @click="toggleSound">
        <span class="btn-icon">{{ soundEnabled ? '🔊' : '🔇' }}</span>
        {{ soundEnabled ? '声音' : '静音' }}
      </button>
    </div>
    <div class="extra-controls">
      <button id="saveGame" @click="saveGame">
        <span class="btn-icon">💾</span>保存
      </button>
      <button id="loadGame" @click="loadGame">
        <span class="btn-icon">📂</span>载入
      </button>
      <button id="replayGame" @click="replayGame">
        <span class="btn-icon">▶️</span>重放
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'ControlPanel',
  
  setup() {
    const store = useStore()
    const selectedTurnOrder = ref('player')
    
    const soundEnabled = computed(() => store.state.soundEnabled)
    
    const restart = () => {
      store.commit('setTurnOrder', { isPlayerFirst: selectedTurnOrder.value === 'player' })
      store.dispatch('initGame')
    }
    
    const undo = () => {
      store.commit('undoMove')
    }
    
    const toggleSound = () => {
      store.commit('toggleSound')
    }
    
    const handleTurnOrderChange = () => {
      restart()
    }
    
    const saveGame = () => {
      const state = {
        board: store.state.board,
        moveHistory: store.state.moveHistory,
        playerScore: store.state.playerScore,
        computerScore: store.state.computerScore,
        lastMove: store.state.lastMove,
        totalMoveTime: store.state.totalMoveTime,
        maxMoveTime: store.state.maxMoveTime,
        playerPiece: store.state.playerPiece,
        computerPiece: store.state.computerPiece
      }
      localStorage.setItem("gomoku_gameState", JSON.stringify(state))
      store.commit('addLogEntry', '游戏状态已保存')
    }
    
    const loadGame = () => {
      const stateStr = localStorage.getItem("gomoku_gameState")
      if (!stateStr) {
        store.commit('addLogEntry', '没有找到保存的游戏状态')
        return
      }
      
      try {
        const state = JSON.parse(stateStr)
        store.commit('updateScore', { 
          player: state.playerScore, 
          computer: state.computerScore 
        })
        store.state.board = state.board
        store.state.moveHistory = state.moveHistory
        store.state.lastMove = state.lastMove
        store.state.totalMoveTime = state.totalMoveTime
        store.state.maxMoveTime = state.maxMoveTime
        store.state.playerPiece = state.playerPiece
        store.state.computerPiece = state.computerPiece
        store.commit('addLogEntry', '游戏状态已加载')
      } catch (e) {
        store.commit('addLogEntry', '加载游戏状态失败')
      }
    }
    
    const replayGame = () => {
      if (store.state.moveHistory.length === 0) {
        store.commit('addLogEntry', '没有可重放的记录')
        return
      }
      
      const savedHistory = [...store.state.moveHistory]
      store.dispatch('initGame')
      
      let moveIndex = 0
      const playNextMove = () => {
        if (moveIndex >= savedHistory.length) {
          store.commit('addLogEntry', '重放结束')
          return
        }
        
        const move = savedHistory[moveIndex]
        store.commit('makeMove', {
          x: move.x,
          y: move.y,
          piece: move.color
        })
        moveIndex++
        
        setTimeout(playNextMove, 800)
      }
      
      store.commit('addLogEntry', '开始重放游戏')
      playNextMove()
    }
    
    return {
      selectedTurnOrder,
      soundEnabled,
      restart,
      undo,
      toggleSound,
      handleTurnOrderChange,
      saveGame,
      loadGame,
      replayGame
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

.controls, .extra-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-bottom: 10px;
}

.extra-controls {
  margin-bottom: 0;
}

button, select { 
  background: var(--primary); 
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
}

button:hover { 
  background: var(--primary-dark); 
  transform: translateY(-2px); 
  box-shadow: var(--shadow-md);
}

button:active { 
  transform: translateY(-1px);
}

select { 
  background-color: white; 
  color: var(--dark); 
  border: 1px solid #ddd;
  padding-right: 30px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 14px;
}

select:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  transform: translateY(-2px);
}

#undo { 
  background-color: var(--warning);
}

#undo:hover { 
  background-color: #e67e22;
}

#saveGame, #loadGame, #replayGame {
  background-color: var(--success);
}

#saveGame:hover, #loadGame:hover, #replayGame:hover {
  background-color: #3db4ed;
}

#toggleSound {
  background-color: var(--secondary);
}

#toggleSound:hover {
  background-color: #2c0a7a;
}

.btn-icon {
  margin-right: 4px;
}

@media (max-width: 768px) {
  button, select { 
    flex-grow: 1; 
    font-size: 13px; 
    padding: 6px 10px;
    min-width: 75px;
  }
}
</style> 