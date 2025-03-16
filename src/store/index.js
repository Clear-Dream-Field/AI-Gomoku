import { createStore } from 'vuex'

export default createStore({
  state: {
    board: Array(15).fill().map(() => Array(15).fill(0)),
    gameOver: false,
    waitingForComputer: false,
    moveHistory: [],
    lastMove: null,
    winLine: [],
    playerScore: 0,
    computerScore: 0,
    soundEnabled: true,
    playerPiece: 1,  // 黑子
    computerPiece: 2,  // 白子
    totalMoveTime: 0,
    maxMoveTime: 0,
    lastMoveTime: 0,
    moveStartTime: 0,
    logEntries: []
  },
  
  mutations: {
    initBoard(state) {
      state.board = Array(15).fill().map(() => Array(15).fill(0))
      state.gameOver = false
      state.waitingForComputer = false
      state.moveHistory = []
      state.lastMove = null
      state.winLine = []
      state.lastMoveTime = 0
      state.totalMoveTime = 0
      state.maxMoveTime = 0
      state.moveStartTime = 0
    },
    
    makeMove(state, { x, y, piece }) {
      state.board[x][y] = piece
      const moveTime = (Date.now() - state.moveStartTime) / 1000
      state.totalMoveTime += moveTime
      state.maxMoveTime = Math.max(state.maxMoveTime, moveTime)
      state.moveHistory.push({ x, y, color: piece, time: moveTime })
      state.lastMove = { x, y }
      state.lastMoveTime = moveTime
    },
    
    setGameOver(state, value) {
      state.gameOver = value
    },
    
    setWaitingForComputer(state, value) {
      state.waitingForComputer = value
    },
    
    setWinLine(state, line) {
      state.winLine = line
    },
    
    updateScore(state, { player, computer }) {
      if (player !== undefined) state.playerScore = player
      if (computer !== undefined) state.computerScore = computer
    },
    
    toggleSound(state) {
      state.soundEnabled = !state.soundEnabled
    },
    
    undoMove(state) {
      if (state.moveHistory.length === 0) return
      
      state.gameOver = false
      state.winLine = []
      
      // 撤销电脑的移动
      if (state.moveHistory.length > 0 && state.moveHistory[state.moveHistory.length - 1].color === state.computerPiece) {
        const move = state.moveHistory.pop()
        state.board[move.x][move.y] = 0
      }
      
      // 撤销玩家的移动
      if (state.moveHistory.length > 0 && state.moveHistory[state.moveHistory.length - 1].color === state.playerPiece) {
        const move = state.moveHistory.pop()
        state.board[move.x][move.y] = 0
      }
      
      state.lastMove = state.moveHistory.length > 0 ? 
        { x: state.moveHistory[state.moveHistory.length - 1].x, y: state.moveHistory[state.moveHistory.length - 1].y } : null
      
      state.waitingForComputer = false
    },
    
    addLogEntry(state, entry) {
      const time = new Date().toLocaleTimeString()
      state.logEntries.push(`[${time}] ${entry}`)
    },
    
    setTurnOrder(state, { isPlayerFirst }) {
      state.playerPiece = isPlayerFirst ? 1 : 2
      state.computerPiece = isPlayerFirst ? 2 : 1
    },
    
    startMove(state) {
      state.moveStartTime = Date.now()
    },
    
    endMove(state) {
      const moveTime = (Date.now() - state.moveStartTime) / 1000
      state.lastMoveTime = moveTime
      state.totalMoveTime += moveTime
      state.maxMoveTime = Math.max(state.maxMoveTime, moveTime)
    }
  },
  
  actions: {
    initGame({ commit, state, dispatch }) {
      commit('initBoard')
      commit('addLogEntry', '游戏初始化完成')
      
      // 如果电脑先手，自动下在天元
      if (state.playerPiece === 2) {
        dispatch('makeComputerMove')
      }
    },
    
    makePlayerMove({ commit, state, dispatch }, { x, y }) {
      commit('startMove')
      if (state.gameOver || state.waitingForComputer) return
      if (state.board[x][y] !== 0) return
      
      commit('makeMove', { x, y, piece: state.playerPiece })
      commit('addLogEntry', `玩家落子：(${x}, ${y})`)
      
      // 检查获胜
      const line = checkWinningLine(state.board, x, y, state.playerPiece)
      if (line) {
        commit('setWinLine', line)
        commit('setGameOver', true)
        commit('updateScore', { player: state.playerScore + 1 })
        commit('addLogEntry', '玩家获胜！')
        return
      }
      
      // 检查平局
      if (checkDraw(state.board)) {
        commit('setGameOver', true)
        commit('addLogEntry', '平局！')
        return
      }
      
      // 电脑回合
      commit('setWaitingForComputer', true)
      setTimeout(() => {
        dispatch('makeComputerMove')
      }, 800)
      commit('endMove')
    },
    
    makeComputerMove({ commit, state }) {
      commit('startMove')
      const move = getAIMove(state.board, state.computerPiece, state.playerPiece)
      if (!move) return
      
      commit('makeMove', { x: move.x, y: move.y, piece: state.computerPiece })
      commit('addLogEntry', `电脑落子：(${move.x}, ${move.y})`)
      
      // 检查获胜
      const line = checkWinningLine(state.board, move.x, move.y, state.computerPiece)
      if (line) {
        commit('setWinLine', line)
        commit('setGameOver', true)
        commit('updateScore', { computer: state.computerScore + 1 })
        commit('addLogEntry', '电脑获胜！')
      } else if (checkDraw(state.board)) {
        commit('setGameOver', true)
        commit('addLogEntry', '平局！')
      }
      
      commit('setWaitingForComputer', false)
      commit('endMove')
    }
  }
})

// 辅助函数
function checkWinningLine(board, x, y, piece) {
  const directions = [
    { dx: 1, dy: 0 },  // 水平
    { dx: 0, dy: 1 },  // 垂直
    { dx: 1, dy: 1 },  // 对角线
    { dx: 1, dy: -1 }  // 反对角线
  ]
  
  for (const { dx, dy } of directions) {
    let count = 1
    let line = [{ x, y }]
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
      const nx = x + dx * i
      const ny = y + dy * i
      if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15 || board[nx][ny] !== piece) break
      count++
      line.push({ x: nx, y: ny })
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
      const nx = x - dx * i
      const ny = y - dy * i
      if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15 || board[nx][ny] !== piece) break
      count++
      line.unshift({ x: nx, y: ny })
    }
    
    if (count >= 5) return line
  }
  return null
}

function checkDraw(board) {
  return board.every(row => row.every(cell => cell !== 0))
}

function getAIMove(board, computerPiece, playerPiece) {
  // 获取所有可能的落子点
  const candidates = []
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if (board[i][j] === 0) {
        const score = evaluatePosition(board, i, j, computerPiece, playerPiece)
        candidates.push({ x: i, y: j, score })
      }
    }
  }
  
  // 按分数排序
  candidates.sort((a, b) => b.score - a.score)
  
  // 返回最佳落子点
  return candidates[0]
}

function evaluatePosition(board, x, y, computerPiece, playerPiece) {
  let score = 0
  
  // 评估进攻分数
  score += evaluateDirection(board, x, y, computerPiece, 1, 0)  // 水平
  score += evaluateDirection(board, x, y, computerPiece, 0, 1)  // 垂直
  score += evaluateDirection(board, x, y, computerPiece, 1, 1)  // 对角线
  score += evaluateDirection(board, x, y, computerPiece, 1, -1) // 反对角线
  
  // 评估防守分数
  score += evaluateDirection(board, x, y, playerPiece, 1, 0) * 0.8
  score += evaluateDirection(board, x, y, playerPiece, 0, 1) * 0.8
  score += evaluateDirection(board, x, y, playerPiece, 1, 1) * 0.8
  score += evaluateDirection(board, x, y, playerPiece, 1, -1) * 0.8
  
  return score
}

function evaluateDirection(board, x, y, piece, dx, dy) {
  let score = 0
  let count = 1
  let blocked = 0
  
  // 正向检查
  for (let i = 1; i < 5; i++) {
    const nx = x + dx * i
    const ny = y + dy * i
    if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15) {
      blocked++
      break
    }
    if (board[nx][ny] === piece) count++
    else if (board[nx][ny] !== 0) {
      blocked++
      break
    }
    else break
  }
  
  // 反向检查
  for (let i = 1; i < 5; i++) {
    const nx = x - dx * i
    const ny = y - dy * i
    if (nx < 0 || nx >= 15 || ny < 0 || ny >= 15) {
      blocked++
      break
    }
    if (board[nx][ny] === piece) count++
    else if (board[nx][ny] !== 0) {
      blocked++
      break
    }
    else break
  }
  
  // 计算分数
  if (count >= 5) score = 100000
  else if (count === 4) score = blocked === 0 ? 10000 : 1000
  else if (count === 3) score = blocked === 0 ? 1000 : 100
  else if (count === 2) score = blocked === 0 ? 100 : 10
  else score = 1
  
  return score
} 