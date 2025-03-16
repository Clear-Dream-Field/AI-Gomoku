<template>
  <div class="app-container">
    <header>
      <h1>AI 五子棋 | Gomoku</h1>
    </header>
    
    <button id="fullScreenButton" @click="toggleFullscreen">
      {{ isFullscreen ? '退出全屏' : '全屏模式' }}
    </button>
    
    <div class="main-content">
      <!-- 左侧：棋盘和计时器 -->
      <div class="left-panel">
        <GomokuBoard />
        <div class="timer" id="moveTimer">
          距离上一步：{{ elapsedTime }}秒
        </div>
      </div>
      
      <!-- 右侧：分数、控制、状态、日志和统计 -->
      <div class="right-panel">
        <ScoreBoard />
        <ControlPanel />
        <StatusPanel />
        <LogStats />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex'
import GomokuBoard from './components/GomokuBoard.vue'
import ScoreBoard from './components/ScoreBoard.vue'
import ControlPanel from './components/ControlPanel.vue'
import StatusPanel from './components/StatusPanel.vue'
import LogStats from './components/LogStats.vue'

export default {
  name: 'App',
  
  components: {
    GomokuBoard,
    ScoreBoard,
    ControlPanel,
    StatusPanel,
    LogStats
  },
  
  setup() {
    const store = useStore()
    const isFullscreen = ref(false)
    const elapsedTime = ref(0)
    let timerInterval = null
    let lastMoveTimestamp = Date.now()
    
    const lastMoveTimeStr = computed(() => {
      return store.state.lastMoveTime.toFixed(1)
    })

    const startTimer = () => {
      lastMoveTimestamp = Date.now()
      elapsedTime.value = 0
      
      if (timerInterval) {
        clearInterval(timerInterval)
      }
      
      timerInterval = setInterval(() => {
        elapsedTime.value = ((Date.now() - lastMoveTimestamp) / 1000).toFixed(1)
      }, 100)
    }

    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval)
        timerInterval = null
      }
    }

    // 游戏开始时启动计时器
    onMounted(() => {
      document.addEventListener('fullscreenchange', handleFullscreenChange)
      startTimer()
    })

    // 每次有新的移动时重置计时器
    watch(() => store.state.moveHistory.length, () => {
      startTimer()
    })
    
    const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        isFullscreen.value = true
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
          isFullscreen.value = false
        }
      }
    }
    
    const handleFullscreenChange = () => {
      isFullscreen.value = !!document.fullscreenElement
    }
    
    onMounted(() => {
      document.addEventListener('fullscreenchange', handleFullscreenChange)
    })
    
    onUnmounted(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      stopTimer()
    })
    
    return {
      isFullscreen,
      toggleFullscreen,
      lastMoveTimeStr,
      elapsedTime
    }
  }
}
</script>

<style>
header { 
  text-align: center; 
  padding: 15px; 
  margin-bottom: 20px; 
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white; 
  border-radius: var(--radius-md); 
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  animation: fadeIn 0.9s ease-out forwards;
}

header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 60%);
  z-index: 0;
  animation: rotateGradient 20s linear infinite;
}

header h1 { 
  margin: 0; 
  font-size: 28px; 
  position: relative;
  z-index: 1;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  font-weight: 700;
  letter-spacing: 1px;
}

.main-content { 
  display: flex; 
  flex-direction: row; 
  gap: 20px;
  flex: 1;
}

.left-panel { 
  flex: 3; 
  display: flex; 
  flex-direction: column; 
  align-items: center;
}

.right-panel { 
  flex: 2; 
  display: flex; 
  flex-direction: column; 
  gap: 15px;
}

#fullScreenButton {
  position: fixed;
  top: 15px;
  right: 15px;
  z-index: 1000;
  background: var(--primary);
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: var(--transition-normal);
  font-family: var(--font-main);
  font-weight: 600;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

#fullScreenButton::before {
  content: "⛶";
  font-size: 15px;
}

#fullScreenButton:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.timer {
  background: linear-gradient(to right, rgba(67, 97, 238, 0.05), rgba(76, 201, 240, 0.1));
  padding: 8px 15px;
  border-radius: 20px;
  margin-top: 10px;
  font-weight: 600;
  display: inline-flex;
  box-shadow: var(--shadow-sm);
  color: var(--primary);
  border: 1px solid rgba(67, 97, 238, 0.1);
  min-width: 160px;
  justify-content: center;
}

@media (max-width: 768px) {
  .main-content { 
    flex-direction: column;
    gap: 15px;
  }
  
  header {
    padding: 12px;
    margin-bottom: 15px;
  }
  
  header h1 {
    font-size: 22px;
  }
  
  #fullScreenButton {
    top: 8px;
    right: 8px;
    padding: 5px 10px;
    font-size: 12px;
  }
}
</style> 