export class StockfishWorker {
  private worker: Worker | null = null
  private ready = false
  private resolvers: Map<string, (line: string) => boolean> = new Map()
  private messageHandlers: ((line: string) => void)[] = []

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker('/stockfish/stockfish.js')
        this.worker.onmessage = (e: MessageEvent) => {
          const line: string = e.data
          this.messageHandlers.forEach((h) => h(line))
          if (line === 'uciok') {
            this.send('isready')
          }
          if (line === 'readyok') {
            this.ready = true
            resolve()
          }
        }
        this.worker.onerror = reject
        this.send('uci')
      } catch (err) {
        reject(err)
      }
    })
  }

  send(cmd: string) {
    this.worker?.postMessage(cmd)
  }

  onMessage(handler: (line: string) => void) {
    this.messageHandlers.push(handler)
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler)
    }
  }

  async getBestMove(fen: string, skillLevel = 10, moveTimeMs = 1000): Promise<string> {
    if (!this.ready) throw new Error('Stockfish not ready')
    return new Promise((resolve) => {
      const handler = (line: string) => {
        if (line.startsWith('bestmove')) {
          const move = line.split(' ')[1]
          off()
          resolve(move)
        }
      }
      const off = this.onMessage(handler)
      this.send(`setoption name Skill Level value ${skillLevel}`)
      this.send(`position fen ${fen}`)
      this.send(`go movetime ${moveTimeMs}`)
    })
  }

  async getEval(fen: string, depth = 18): Promise<{ score: number; bestMove: string }> {
    if (!this.ready) throw new Error('Stockfish not ready')
    return new Promise((resolve) => {
      let bestScore = 0
      let bestMove = ''
      const handler = (line: string) => {
        if (line.startsWith('info') && line.includes('score cp') && line.includes(`depth ${depth}`)) {
          const cpMatch = line.match(/score cp (-?\d+)/)
          const pvMatch = line.match(/pv (\S+)/)
          if (cpMatch) bestScore = parseInt(cpMatch[1])
          if (pvMatch) bestMove = pvMatch[1]
        }
        if (line.startsWith('bestmove')) {
          const mv = line.split(' ')[1]
          if (!bestMove) bestMove = mv
          off()
          resolve({ score: bestScore, bestMove })
        }
      }
      const off = this.onMessage(handler)
      this.send('setoption name Skill Level value 20')
      this.send(`position fen ${fen}`)
      this.send(`go depth ${depth}`)
    })
  }

  terminate() {
    this.worker?.terminate()
    this.worker = null
    this.ready = false
  }

  isReady() {
    return this.ready
  }
}
