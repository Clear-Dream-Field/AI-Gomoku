<template>
  <div class="board-container">
    <canvas ref="canvas" @click="handleClick" @mousemove="handleMouseMove" @mouseout="handleMouseOut"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'GomokuBoard',
  
  setup() {
    const store = useStore()
    const canvas = ref(null)
    const ctx = ref(null)
    const boardSize = 15
    const boardMargin = 30
    const gridThickness = 2
    const cellSize = ref(0)
    const hoverPos = ref(null)
    const pulseAngle = ref(0)
    const dpr = window.devicePixelRatio || 1
    
    // 计算属性
    const board = computed(() => store.state.board)
    const gameOver = computed(() => store.state.gameOver)
    const waitingForComputer = computed(() => store.state.waitingForComputer)
    const lastMove = computed(() => store.state.lastMove)
    const winLine = computed(() => store.state.winLine)
    
    // 方法
    const fixCanvasBlur = () => {
      const rect = canvas.value.getBoundingClientRect()
      canvas.value.width = rect.width * dpr
      canvas.value.height = rect.height * dpr
      ctx.value.scale(dpr, dpr)
      canvas.value.style.width = rect.width + 'px'
      canvas.value.style.height = rect.height + 'px'
      cellSize.value = (rect.width - 2 * boardMargin) / (boardSize - 1)
    }
    
    const setCanvasSize = () => {
      const container = canvas.value.parentElement
      const containerWidth = container.clientWidth
      canvas.value.style.width = containerWidth + 'px'
      canvas.value.style.height = containerWidth + 'px'
      fixCanvasBlur()
    }
    
    const drawGrid = () => {
      ctx.value.strokeStyle = '#8b4513'
      ctx.value.lineWidth = gridThickness
      
      for (let i = 0; i < boardSize; i++) {
        const pos = Math.floor(boardMargin + i * cellSize.value) + 0.5
        
        // 水平线
        ctx.value.beginPath()
        ctx.value.moveTo(boardMargin, pos)
        ctx.value.lineTo(canvas.value.width / dpr - boardMargin, pos)
        ctx.value.stroke()
        
        // 垂直线
        ctx.value.beginPath()
        ctx.value.moveTo(pos, boardMargin)
        ctx.value.lineTo(pos, canvas.value.height / dpr - boardMargin)
        ctx.value.stroke()
      }
      
      // 星位点
      const starPoints = [{x: 3, y: 3}, {x: 11, y: 3}, {x: 3, y: 11}, {x: 11, y: 11}, {x: 7, y: 7}]
      ctx.value.fillStyle = '#5a3e2b'
      for (const point of starPoints) {
        ctx.value.beginPath()
        const x = Math.floor(boardMargin + point.x * cellSize.value) + 0.5
        const y = Math.floor(boardMargin + point.y * cellSize.value) + 0.5
        ctx.value.arc(x, y, Math.floor(cellSize.value * 0.12), 0, 2 * Math.PI)
        ctx.value.fill()
      }
    }
    
    const drawPiece = (i, j, color) => {
      const x = Math.floor(boardMargin + i * cellSize.value) + 0.5
      const y = Math.floor(boardMargin + j * cellSize.value) + 0.5
      const radius = Math.floor(cellSize.value * 0.38)
      
      // 加深棋子阴影
      ctx.value.beginPath()
      ctx.value.arc(x + 2, y + 2, radius, 0, 2 * Math.PI)
      ctx.value.fillStyle = 'rgba(0,0,0,0.4)'
      ctx.value.fill()
      
      // 棋子主体
      ctx.value.beginPath()
      ctx.value.arc(x, y, radius, 0, 2 * Math.PI)
      const gradient = ctx.value.createRadialGradient(
        x - radius/3, y - radius/3, radius * 0.1,
        x, y, radius
      )
      
      if (color === 1) {
        // 加深黑棋的颜色
        gradient.addColorStop(0, '#333')
        gradient.addColorStop(1, '#000')
      } else {
        // 增加白棋的对比度
        gradient.addColorStop(0, '#fff')
        gradient.addColorStop(1, '#ddd')
      }
      
      ctx.value.fillStyle = gradient
      ctx.value.fill()
      
      // 增强棋子高光效果
      ctx.value.beginPath()
      ctx.value.arc(x - radius*0.2, y - radius*0.2, radius * 0.15, 0, 2 * Math.PI)
      ctx.value.fillStyle = color === 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)'
      ctx.value.fill()
      
      // 最后一步标记
      if (lastMove.value && lastMove.value.x === i && lastMove.value.y === j) {
        const pulse = 3 + Math.sin(pulseAngle.value) * 2
        ctx.value.strokeStyle = 'rgba(255,0,0,0.7)'
        ctx.value.lineWidth = 2
        ctx.value.beginPath()
        ctx.value.arc(x, y, radius + pulse, 0, 2 * Math.PI)
        ctx.value.stroke()
      }
      
      // 胜利线标记
      if (winLine.value && winLine.value.some(pt => pt.x === i && pt.y === j)) {
        ctx.value.strokeStyle = 'rgba(255,215,0,0.8)'
        ctx.value.lineWidth = 3
        ctx.value.beginPath()
        ctx.value.arc(x, y, radius * 1.2, 0, 2 * Math.PI)
        ctx.value.stroke()
        
        const flashIntensity = 0.5 + Math.sin(pulseAngle.value * 2) * 0.3
        ctx.value.fillStyle = `rgba(255,215,0,${flashIntensity})`
        ctx.value.beginPath()
        ctx.value.arc(x, y, radius * 0.6, 0, 2 * Math.PI)
        ctx.value.fill()
      }
    }
    
    const drawBoard = () => {
      if (!ctx.value) return
      
      ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
      
      // 修改棋盘背景色为浅木色
      ctx.value.fillStyle = '#e9c088'
      ctx.value.fillRect(0, 0, canvas.value.width / dpr, canvas.value.height / dpr)
      
      // 修改网格线颜色
      ctx.value.strokeStyle = '#8b4513'
      drawGrid()
      
      // 绘制棋子
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (board.value[i][j] !== 0) {
            drawPiece(i, j, board.value[i][j])
          }
        }
      }
      
      // 悬浮效果
      if (!gameOver.value && !waitingForComputer.value && hoverPos.value) {
        const hx = Math.floor(boardMargin + hoverPos.value.x * cellSize.value) + 0.5
        const hy = Math.floor(boardMargin + hoverPos.value.y * cellSize.value) + 0.5
        ctx.value.beginPath()
        ctx.value.arc(hx, hy, Math.floor(cellSize.value * 0.38), 0, 2 * Math.PI)
        ctx.value.fillStyle = 'rgba(0,0,0,0.15)'
        ctx.value.fill()
        ctx.value.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.value.lineWidth = 1
        ctx.value.stroke()
      }
    }
    
    const handleClick = (e) => {
      if (gameOver.value || waitingForComputer.value) return
      
      const rect = canvas.value.getBoundingClientRect()
      const scaleX = canvas.value.width / rect.width
      const scaleY = canvas.value.height / rect.height
      const x = (e.clientX - rect.left) * scaleX / dpr
      const y = (e.clientY - rect.top) * scaleY / dpr
      
      if (x < boardMargin || x > canvas.value.width / dpr - boardMargin || 
          y < boardMargin || y > canvas.value.height / dpr - boardMargin) return
      
      const i = Math.round((x - boardMargin) / cellSize.value)
      const j = Math.round((y - boardMargin) / cellSize.value)
      
      if (i < 0 || i >= boardSize || j < 0 || j >= boardSize) return
      if (board.value[i][j] !== 0) return
      
      store.dispatch('makePlayerMove', { x: i, y: j })
    }
    
    const handleMouseMove = (e) => {
      if (gameOver.value || waitingForComputer.value) {
        hoverPos.value = null
        return
      }
      
      const rect = canvas.value.getBoundingClientRect()
      const scaleX = canvas.value.width / rect.width
      const scaleY = canvas.value.height / rect.height
      const x = (e.clientX - rect.left) * scaleX / dpr
      const y = (e.clientY - rect.top) * scaleY / dpr
      
      if (x < boardMargin || x > canvas.value.width / dpr - boardMargin || 
          y < boardMargin || y > canvas.value.height / dpr - boardMargin) {
        hoverPos.value = null
        return
      }
      
      const i = Math.round((x - boardMargin) / cellSize.value)
      const j = Math.round((y - boardMargin) / cellSize.value)
      
      if (i < 0 || i >= boardSize || j < 0 || j >= boardSize || board.value[i][j] !== 0) {
        hoverPos.value = null
      } else {
        hoverPos.value = { x: i, y: j }
      }
    }
    
    const handleMouseOut = () => {
      hoverPos.value = null
    }
    
    let animationFrame = null
    const animate = () => {
      pulseAngle.value += 0.05
      drawBoard()
      animationFrame = requestAnimationFrame(animate)
    }
    
    onMounted(() => {
      ctx.value = canvas.value.getContext('2d')
      setCanvasSize()
      window.addEventListener('resize', setCanvasSize)
      animate()
      store.dispatch('initGame')
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', setCanvasSize)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    })
    
    return {
      canvas,
      handleClick,
      handleMouseMove,
      handleMouseOut
    }
  }
}
</script>

<style scoped>
.board-container { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  margin: 15px 0;
  position: relative;
  padding: 5px;
  width: 100%;
  aspect-ratio: 1/1;
  max-width: 600px;
  animation: slideUp 0.6s ease-out forwards;
}

canvas { 
  width: 100%;
  height: 100%;
  border-radius: var(--radius-lg); 
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  background-color: #e9c088;
  transition: var(--transition-normal);
  border: 2px solid #8b4513;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

canvas:hover {
  transform: scale(1.01);
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
}

@media (max-width: 768px) {
  .board-container {
    max-width: 90vw;
  }
}

@media (min-width: 769px) and (max-width: 1100px) {
  .board-container {
    max-width: 500px;
  }
}
</style> 