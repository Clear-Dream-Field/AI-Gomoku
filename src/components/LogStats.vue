<template>
  <div>
    <div class="log-container" id="gameLog">
      <h2>游戏日志</h2>
      <p v-for="(entry, index) in logEntries" 
         :key="index" 
         class="log-entry"
         :style="{ animation: 'fadeIn 0.3s ease-out forwards' }">
        {{ entry }}
      </p>
    </div>
    <div class="stats">
      <h2>统计信息</h2>
      <p>总步数：<span>{{ totalMoves }}</span></p>
      <p>平均步时：<span>{{ avgMoveTime }}</span>秒</p>
      <p>最长步时：<span>{{ maxMoveTime }}</span>秒</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'LogStats',
  
  setup() {
    const store = useStore()
    
    const logEntries = computed(() => store.state.logEntries)
    const totalMoves = computed(() => store.state.moveHistory.length)
    
    const avgMoveTime = computed(() => {
      if (totalMoves.value === 0) return '0.0'
      return (store.state.totalMoveTime / totalMoves.value).toFixed(1)
    })
    
    const maxMoveTime = computed(() => store.state.maxMoveTime.toFixed(1))
    
    const addLogEntry = (entry) => {
      const time = new Date().toLocaleTimeString()
      logEntries.value.push(`[${time}] ${entry}`)
    }
    
    // 监听游戏状态变化并添加日志
    // 这里需要实现日志记录的逻辑
    
    return {
      logEntries,
      totalMoves,
      avgMoveTime,
      maxMoveTime,
      addLogEntry
    }
  }
}
</script>

<style scoped>
.log-container { 
  flex: 1; 
  min-width: 240px; 
  background: white; 
  border-radius: var(--radius-md); 
  box-shadow: var(--shadow-md); 
  padding: 12px 15px; 
  margin-top: -10px;
  height: 200px; 
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-light) transparent;
  border: 1px solid rgba(0,0,0,0.05);
  transition: var(--transition-fast);
}

.stats {
  flex: 1; 
  min-width: 240px; 
  background: white; 
  border-radius: var(--radius-md); 
  box-shadow: var(--shadow-md); 
  padding: 12px 15px; 
  margin-top: 20px;  /* 添加正边距使其下移 */
  height: 200px; 
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--primary-light) transparent;
  border: 1px solid rgba(0,0,0,0.05);
  transition: var(--transition-fast);
}

.log-container:hover, .stats:hover {
  box-shadow: var(--shadow-lg);
}

.log-container::-webkit-scrollbar, .stats::-webkit-scrollbar {
  width: 5px;
}

.log-container::-webkit-scrollbar-thumb, .stats::-webkit-scrollbar-thumb {
  background-color: var(--primary-light);
  border-radius: 3px;
}

.log-container h2, .stats h2 { 
  font-size: 18px; 
  color: var(--primary); 
  margin: 0 0 12px 0; 
  padding-bottom: 8px; 
  border-bottom: 2px solid rgba(67, 97, 238, 0.2);
  font-weight: 700;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.log-entry { 
  font-size: 13px; 
  margin: 5px 0; 
  padding: 6px 8px; 
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  border-left: 3px solid transparent;
  line-height: 1.4;
}

.log-entry:hover {
  background-color: rgba(67, 97, 238, 0.05);
  border-left-color: var(--primary);
}

.stats p { 
  display: flex; 
  justify-content: space-between; 
  margin: 10px 0; 
  font-size: 14px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background-color: var(--light);
  transition: var(--transition-fast);
  border-left: 3px solid transparent;
}

.stats p:hover {
  background-color: rgba(67, 97, 238, 0.05);
  border-left-color: var(--primary);
  transform: translateX(2px);
}

.stats span {
  font-weight: 600;
  color: var(--primary);
  background: rgba(67, 97, 238, 0.1);
  padding: 1px 6px;
  border-radius: 10px;
}

@media (max-width: 768px) {
  .log-container, .stats { 
    min-width: 100%; 
    height: 160px;
    padding: 12px;
  }
}
</style> 