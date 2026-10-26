// -------------------------------------------------------------
// Interactive 2D Board Games Engine for Endlessync
// Supports Tic-Tac-Toe, Dots & Boxes, and Connect 4
// Real-time synchronization, alternating turns & area physics
// -------------------------------------------------------------

export type GameType = 'tictactoe' | 'dotsboxes' | 'connect4';

export interface TicTacToeState {
  board: (string | null)[]; // 9 cells: 'O' | 'X' | null
  winningLine: number[] | null; // e.g. [0, 1, 2]
}

export interface DotsBoxesState {
  dotGridSize: number; // e.g. 3, 4, 5, 6
  horizontalLines: (string | null)[]; // 'A' | 'B' | null, length: N * (N - 1)
  verticalLines: (string | null)[]; // 'A' | 'B' | null, length: (N - 1) * N
  boxes: (string | null)[]; // 'A' | 'B' | null, length: (N - 1) * (N - 1)
  scoreA: number;
  scoreB: number;
}

export interface Connect4State {
  cols: number; // 7
  rows: number; // 6
  board: (string | null)[][]; // 7 cols x 6 rows ('cyan' | 'pink' | null)
  winningCells: [number, number][] | null;
}

export interface GameElementData {
  gameType: GameType;
  title: string;
  status: 'playing' | 'ended';
  winner: string | null; // 'O' | 'X' | 'draw' | 'A' | 'B' | 'cyan' | 'pink'
  winnerText?: string;
  currentTurn: string; // 'O' | 'X' for ttt; 'A' | 'B' for dots; 'cyan' | 'pink' for c4
  lastPlayerId?: string;
  lastMoveTimestamp?: number;
  mode: 'multiplayer' | 'pass-and-play';
  ttt?: TicTacToeState;
  dots?: DotsBoxesState;
  c4?: Connect4State;
}

export interface Point {
  x: number;
  y: number;
}

export interface GameHoverTarget {
  gameId: string;
  action: 'cell' | 'hline' | 'vline' | 'col' | 'reset' | 'mode' | 'delete';
  index?: number;
  row?: number;
  col?: number;
}

// -------------------------------------------------------------
// Factory: Create New Board Game Element
// -------------------------------------------------------------
export function createGameElement(
  gameType: GameType,
  x: number,
  y: number,
  options?: {
    dotGridSize?: number;
    mode?: 'multiplayer' | 'pass-and-play';
    startingTurn?: string;
  }
) {
  const id = `game_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const mode = options?.mode || 'pass-and-play';

  if (gameType === 'tictactoe') {
    const startTurn = options?.startingTurn || 'O';
    const data: GameElementData = {
      gameType: 'tictactoe',
      title: 'Tic-Tac-Toe',
      status: 'playing',
      winner: null,
      currentTurn: startTurn,
      mode: mode,
      ttt: {
        board: Array(9).fill(null),
        winningLine: null,
      },
    };
    return {
      id,
      type: 'game' as const,
      x: x - 140,
      y: y - 170,
      width: 280,
      height: 340,
      gameData: data,
    };
  }

  if (gameType === 'dotsboxes') {
    // Limit dots to between 3 and 6 to prevent performance issues
    const N = Math.min(Math.max(options?.dotGridSize || 4, 3), 6);
    const hCount = N * (N - 1);
    const vCount = (N - 1) * N;
    const boxCount = (N - 1) * (N - 1);

    const spacing = N === 3 ? 75 : N === 4 ? 60 : N === 5 ? 50 : 42;
    const gridDim = (N - 1) * spacing;
    const width = Math.max(gridDim + 90, 290);
    const height = gridDim + 150;

    const data: GameElementData = {
      gameType: 'dotsboxes',
      title: `Dots & Boxes (${N}x${N})`,
      status: 'playing',
      winner: null,
      currentTurn: 'A',
      mode: mode,
      dots: {
        dotGridSize: N,
        horizontalLines: Array(hCount).fill(null),
        verticalLines: Array(vCount).fill(null),
        boxes: Array(boxCount).fill(null),
        scoreA: 0,
        scoreB: 0,
      },
    };
    return {
      id,
      type: 'game' as const,
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
      gameData: data,
    };
  }

  // Connect Four (7 cols x 6 rows)
  const cols = 7;
  const rows = 6;
  const colArrays: (string | null)[][] = [];
  for (let c = 0; c < cols; c++) {
    colArrays.push(Array(rows).fill(null));
  }
  const width = 310;
  const height = 360;

  const data: GameElementData = {
    gameType: 'connect4',
    title: 'Connect Four',
    status: 'playing',
    winner: null,
    currentTurn: 'cyan',
    mode: mode,
    c4: {
      cols,
      rows,
      board: colArrays,
      winningCells: null,
    },
  };
  return {
    id,
    type: 'game' as const,
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
    gameData: data,
  };
}

// -------------------------------------------------------------
// Hit Testing & Hover Detection
// -------------------------------------------------------------
export function isPointInsideGame(game: { x?: number; y?: number; width?: number; height?: number }, wx: number, wy: number): boolean {
  if (game.x === undefined || game.y === undefined || !game.width || !game.height) return false;
  return wx >= game.x && wx <= game.x + game.width && wy >= game.y && wy <= game.y + game.height;
}

export function getGameActionAtPoint(
  game: { id: string; x?: number; y?: number; width?: number; height?: number; gameData?: GameElementData },
  wx: number,
  wy: number
): GameHoverTarget | null {
  if (!game.x || !game.y || !game.width || !game.height || !game.gameData) return null;
  const gx = game.x;
  const gy = game.y;
  const gw = game.width;
  const gh = game.height;

  // 1. Header controls (Reset, Mode Toggle, Delete)
  // Delete button at top right
  const delX = gx + gw - 32;
  const delY = gy + 12;
  if (Math.hypot(wx - delX, wy - delY) <= 16) {
    return { gameId: game.id, action: 'delete' };
  }

  // Reset button next to delete
  const resX = gx + gw - 64;
  const resY = gy + 12;
  if (Math.hypot(wx - resX, wy - resY) <= 16) {
    return { gameId: game.id, action: 'reset' };
  }

  // Mode button
  if (wx >= gx + 12 && wx <= gx + 110 && wy >= gy + 38 && wy <= gy + 58) {
    return { gameId: game.id, action: 'mode' };
  }

  // If game is ended, check click on "Play Again" raised button
  if (game.gameData.status === 'ended') {
    const bannerH = 100;
    const bannerY = gy + (gh - bannerH) / 2;
    const btnY = bannerY + 62;
    const btnW = 120;
    const btnH = 26;
    const btnX = gx + (gw - btnW) / 2;
    if (wx >= btnX - 10 && wx <= btnX + btnW + 10 && wy >= btnY - 6 && wy <= btnY + btnH + 8) {
      return { gameId: game.id, action: 'reset' };
    }
  }

  // 2. Game specific play interactions
  if (game.gameData.status === 'playing') {
    if (game.gameData.gameType === 'tictactoe' && game.gameData.ttt) {
      const startX = gx + (gw - 228) / 2;
      const startY = gy + 72;
      const cellSize = 76;
      if (wx >= startX && wx <= startX + 228 && wy >= startY && wy <= startY + 228) {
        const c = Math.floor((wx - startX) / cellSize);
        const r = Math.floor((wy - startY) / cellSize);
        const index = r * 3 + c;
        if (index >= 0 && index < 9 && game.gameData.ttt.board[index] === null) {
          return { gameId: game.id, action: 'cell', index, row: r, col: c };
        }
      }
    } else if (game.gameData.gameType === 'dotsboxes' && game.gameData.dots) {
      const N = game.gameData.dots.dotGridSize;
      const spacing = N === 3 ? 75 : N === 4 ? 60 : N === 5 ? 50 : 42;
      const gridDim = (N - 1) * spacing;
      const startX = gx + (gw - gridDim) / 2;
      const startY = gy + 82;

      // Check horizontal lines
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N - 1; c++) {
          const idx = r * (N - 1) + c;
          if (game.gameData.dots.horizontalLines[idx] !== null) continue;
          const lx1 = startX + c * spacing;
          const lx2 = startX + (c + 1) * spacing;
          const ly = startY + r * spacing;
          if (wx >= lx1 + 6 && wx <= lx2 - 6 && Math.abs(wy - ly) <= 12) {
            return { gameId: game.id, action: 'hline', index: idx, row: r, col: c };
          }
        }
      }

      // Check vertical lines
      for (let r = 0; r < N - 1; r++) {
        for (let c = 0; c < N; c++) {
          const idx = r * N + c;
          if (game.gameData.dots.verticalLines[idx] !== null) continue;
          const lx = startX + c * spacing;
          const ly1 = startY + r * spacing;
          const ly2 = startY + (r + 1) * spacing;
          if (wy >= ly1 + 6 && wy <= ly2 - 6 && Math.abs(wx - lx) <= 12) {
            return { gameId: game.id, action: 'vline', index: idx, row: r, col: c };
          }
        }
      }
    } else if (game.gameData.gameType === 'connect4' && game.gameData.c4) {
      const cols = game.gameData.c4.cols;
      const colWidth = 36;
      const startX = gx + (gw - cols * colWidth) / 2;
      const startY = gy + 75;
      const boardH = 6 * 36;

      if (wx >= startX && wx <= startX + cols * colWidth && wy >= startY - 24 && wy <= startY + boardH) {
        const c = Math.floor((wx - startX) / colWidth);
        if (c >= 0 && c < cols) {
          return { gameId: game.id, action: 'col', col: c };
        }
      }
    }
  }

  return null;
}

// -------------------------------------------------------------
// Turn Validation & Move Logic
// -------------------------------------------------------------
export function executeGameMove(
  gameData: GameElementData,
  target: GameHoverTarget,
  playerId: string
): { updated: GameElementData; sound: 'click' | 'win' | 'lock'; message?: string } {
  // Mode lock enforcement
  if (gameData.mode === 'multiplayer' && gameData.lastPlayerId === playerId) {
    return {
      updated: gameData,
      sound: 'lock',
      message: "Waiting for opponent's move! (Alternating turns enforced)",
    };
  }

  // 1. Reset Action
  if (target.action === 'reset') {
    if (gameData.gameType === 'tictactoe') {
      return {
        updated: {
          ...gameData,
          status: 'playing',
          winner: null,
          winnerText: undefined,
          currentTurn: 'O',
          lastPlayerId: undefined,
          ttt: {
            board: Array(9).fill(null),
            winningLine: null,
          },
        },
        sound: 'click',
      };
    } else if (gameData.gameType === 'dotsboxes' && gameData.dots) {
      const N = gameData.dots.dotGridSize;
      return {
        updated: {
          ...gameData,
          status: 'playing',
          winner: null,
          winnerText: undefined,
          currentTurn: 'A',
          lastPlayerId: undefined,
          dots: {
            dotGridSize: N,
            horizontalLines: Array(N * (N - 1)).fill(null),
            verticalLines: Array((N - 1) * N).fill(null),
            boxes: Array((N - 1) * (N - 1)).fill(null),
            scoreA: 0,
            scoreB: 0,
          },
        },
        sound: 'click',
      };
    } else if (gameData.gameType === 'connect4' && gameData.c4) {
      const colArrays: (string | null)[][] = [];
      for (let c = 0; c < 7; c++) colArrays.push(Array(6).fill(null));
      return {
        updated: {
          ...gameData,
          status: 'playing',
          winner: null,
          winnerText: undefined,
          currentTurn: 'cyan',
          lastPlayerId: undefined,
          c4: {
            cols: 7,
            rows: 6,
            board: colArrays,
            winningCells: null,
          },
        },
        sound: 'click',
      };
    }
  }

  // 2. Toggle Mode Action
  if (target.action === 'mode') {
    const nextMode = gameData.mode === 'multiplayer' ? 'pass-and-play' : 'multiplayer';
    return {
      updated: {
        ...gameData,
        mode: nextMode,
      },
      sound: 'click',
      message: nextMode === 'multiplayer' ? 'Multiplayer Turn Lock Enabled' : 'Pass & Play Mode Enabled',
    };
  }

  // 3. Tic-Tac-Toe Play Move
  if (gameData.gameType === 'tictactoe' && gameData.ttt && target.action === 'cell' && target.index !== undefined) {
    if (gameData.status !== 'playing' || gameData.ttt.board[target.index] !== null) {
      return { updated: gameData, sound: 'click' };
    }

    const newBoard = [...gameData.ttt.board];
    const symbol = gameData.currentTurn; // 'O' or 'X'
    newBoard[target.index] = symbol;

    // Check winning conditions
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6],             // Diagonals
    ];

    let winningLine: number[] | null = null;
    for (const [a, b, c] of lines) {
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        winningLine = [a, b, c];
        break;
      }
    }

    if (winningLine) {
      const winnerName = symbol === 'O' ? 'Circle' : 'Cross';
      return {
        updated: {
          ...gameData,
          status: 'ended',
          winner: symbol,
          winnerText: `${winnerName} won here!`,
          lastPlayerId: playerId,
          lastMoveTimestamp: Date.now(),
          ttt: {
            board: newBoard,
            winningLine,
          },
        },
        sound: 'win',
        message: `🏆 ${winnerName} won here!`,
      };
    }

    // Check draw
    if (newBoard.every((cell) => cell !== null)) {
      return {
        updated: {
          ...gameData,
          status: 'ended',
          winner: 'draw',
          winnerText: "It's a Draw!",
          lastPlayerId: playerId,
          lastMoveTimestamp: Date.now(),
          ttt: {
            board: newBoard,
            winningLine: null,
          },
        },
        sound: 'click',
        message: "Game Draw! Nobody won.",
      };
    }

    // Next turn
    const nextTurn = symbol === 'O' ? 'X' : 'O';
    return {
      updated: {
        ...gameData,
        currentTurn: nextTurn,
        lastPlayerId: playerId,
        lastMoveTimestamp: Date.now(),
        ttt: {
          board: newBoard,
          winningLine: null,
        },
      },
      sound: 'click',
    };
  }

  // 4. Dots and Boxes Play Move
  if (gameData.gameType === 'dotsboxes' && gameData.dots && (target.action === 'hline' || target.action === 'vline')) {
    const N = gameData.dots.dotGridSize;
    const hLines = [...gameData.dots.horizontalLines];
    const vLines = [...gameData.dots.verticalLines];
    const boxes = [...gameData.dots.boxes];
    const turn = gameData.currentTurn; // 'A' or 'B'
    let scoreA = gameData.dots.scoreA;
    let scoreB = gameData.dots.scoreB;

    if (target.action === 'hline' && target.index !== undefined) {
      if (hLines[target.index] !== null) return { updated: gameData, sound: 'click' };
      hLines[target.index] = turn;
    } else if (target.action === 'vline' && target.index !== undefined) {
      if (vLines[target.index] !== null) return { updated: gameData, sound: 'click' };
      vLines[target.index] = turn;
    }

    // Check newly completed boxes
    let newlyCompleted = 0;
    for (let br = 0; br < N - 1; br++) {
      for (let bc = 0; bc < N - 1; bc++) {
        const boxIdx = br * (N - 1) + bc;
        if (boxes[boxIdx] !== null) continue;

        const topH = br * (N - 1) + bc;
        const btmH = (br + 1) * (N - 1) + bc;
        const leftV = br * N + bc;
        const rightV = br * N + (bc + 1);

        if (
          hLines[topH] !== null &&
          hLines[btmH] !== null &&
          vLines[leftV] !== null &&
          vLines[rightV] !== null
        ) {
          boxes[boxIdx] = turn;
          newlyCompleted++;
          if (turn === 'A') scoreA++;
          else scoreB++;
        }
      }
    }

    // Check if all boxes completed
    const totalBoxes = (N - 1) * (N - 1);
    const allFilled = boxes.every((b) => b !== null);

    if (allFilled) {
      let winner = 'draw';
      let winnerText = `Tied Game! (${scoreA} - ${scoreB})`;
      if (scoreA > scoreB) {
        winner = 'A';
        winnerText = `Player A won here! (${scoreA} - ${scoreB})`;
      } else if (scoreB > scoreA) {
        winner = 'B';
        winnerText = `Player B won here! (${scoreB} - ${scoreA})`;
      }

      return {
        updated: {
          ...gameData,
          status: 'ended',
          winner,
          winnerText,
          lastPlayerId: playerId,
          lastMoveTimestamp: Date.now(),
          dots: {
            dotGridSize: N,
            horizontalLines: hLines,
            verticalLines: vLines,
            boxes,
            scoreA,
            scoreB,
          },
        },
        sound: 'win',
        message: `🏆 ${winnerText}`,
      };
    }

    // If player made at least 1 square, they get bonus turn!
    const nextTurn = newlyCompleted > 0 ? turn : turn === 'A' ? 'B' : 'A';
    return {
      updated: {
        ...gameData,
        currentTurn: nextTurn,
        lastPlayerId: playerId,
        lastMoveTimestamp: Date.now(),
        dots: {
          dotGridSize: N,
          horizontalLines: hLines,
          verticalLines: vLines,
          boxes,
          scoreA,
          scoreB,
        },
      },
      sound: newlyCompleted > 0 ? 'win' : 'click',
      message: newlyCompleted > 0 ? `Player ${turn} completed a square! Bonus Turn!` : undefined,
    };
  }

  // 5. Connect Four Play Move
  if (gameData.gameType === 'connect4' && gameData.c4 && target.action === 'col' && target.col !== undefined) {
    const colIdx = target.col;
    const board = gameData.c4.board.map((col) => [...col]);
    const colList = board[colIdx];

    // Find first empty row from bottom (index 0)
    let dropRow = -1;
    for (let r = 0; r < 6; r++) {
      if (colList[r] === null) {
        dropRow = r;
        break;
      }
    }

    if (dropRow === -1) {
      return { updated: gameData, sound: 'click', message: 'Column full!' };
    }

    const token = gameData.currentTurn; // 'cyan' or 'pink'
    colList[dropRow] = token;

    // Check 4-in-a-row
    const checkWin = (): [number, number][] | null => {
      // Directions: [dCol, dRow]
      const dirs = [
        [1, 0],  // Horizontal
        [0, 1],  // Vertical
        [1, 1],  // Diagonal /
        [1, -1], // Diagonal \
      ];

      for (let c = 0; c < 7; c++) {
        for (let r = 0; r < 6; r++) {
          const t = board[c][r];
          if (!t) continue;
          for (const [dc, dr] of dirs) {
            const cells: [number, number][] = [[c, r]];
            for (let step = 1; step < 4; step++) {
              const nc = c + dc * step;
              const nr = r + dr * step;
              if (nc >= 0 && nc < 7 && nr >= 0 && nr < 6 && board[nc][nr] === t) {
                cells.push([nc, nr]);
              } else {
                break;
              }
            }
            if (cells.length === 4) return cells;
          }
        }
      }
      return null;
    };

    const winningCells = checkWin();
    if (winningCells) {
      const winnerName = token === 'cyan' ? 'Cyan' : 'Pink';
      return {
        updated: {
          ...gameData,
          status: 'ended',
          winner: token,
          winnerText: `${winnerName} won here!`,
          lastPlayerId: playerId,
          lastMoveTimestamp: Date.now(),
          c4: {
            ...gameData.c4,
            board,
            winningCells,
          },
        },
        sound: 'win',
        message: `🏆 ${winnerName} won here!`,
      };
    }

    // Check full
    let isFull = true;
    for (let c = 0; c < 7; c++) {
      if (board[c][5] === null) {
        isFull = false;
        break;
      }
    }

    if (isFull) {
      return {
        updated: {
          ...gameData,
          status: 'ended',
          winner: 'draw',
          winnerText: "It's a Draw!",
          lastPlayerId: playerId,
          lastMoveTimestamp: Date.now(),
          c4: {
            ...gameData.c4,
            board,
            winningCells: null,
          },
        },
        sound: 'click',
        message: 'Draw! Grid is full.',
      };
    }

    // Next turn
    const nextTurn = token === 'cyan' ? 'pink' : 'cyan';
    return {
      updated: {
        ...gameData,
        currentTurn: nextTurn,
        lastPlayerId: playerId,
        lastMoveTimestamp: Date.now(),
        c4: {
          ...gameData.c4,
          board,
          winningCells: null,
        },
      },
      sound: 'click',
    };
  }

  return { updated: gameData, sound: 'click' };
}

// -------------------------------------------------------------
// Canvas Renderer for 2D Board Games
// -------------------------------------------------------------
export function renderGameElement(
  ctx: CanvasRenderingContext2D,
  element: { id: string; x?: number; y?: number; width?: number; height?: number; gameData?: GameElementData },
  isLight: boolean,
  zoom: number,
  hoverTarget: GameHoverTarget | null,
  myClientId: string
) {
  if (!element.x || !element.y || !element.width || !element.height || !element.gameData) return;
  const gx = element.x;
  const gy = element.y;
  const gw = element.width;
  const gh = element.height;
  const data = element.gameData;
  const isHoveredGame = hoverTarget?.gameId === element.id;

  ctx.save();

  // 1. Sleek Area Board Card Container
  // Glassmorphic board surface with subtle border glow
  ctx.beginPath();
  ctx.roundRect(gx, gy, gw, gh, 18);
  ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(10, 14, 24, 0.94)';
  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = data.status === 'ended'
    ? 'rgba(245, 158, 11, 0.7)'
    : isHoveredGame
    ? 'rgba(56, 189, 248, 0.8)'
    : 'rgba(99, 102, 241, 0.35)';
  ctx.stroke();

  // 2. Header Bar: Title, Mode & Action Buttons
  // Game Title with Icon
  ctx.font = '700 13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillStyle = isLight ? '#0f172a' : '#f8fafc';
  const icon = data.gameType === 'tictactoe' ? '⭕❌ ' : data.gameType === 'dotsboxes' ? '🔲 ' : '🔴 ';
  ctx.fillText(`${icon}${data.title}`, gx + 14, gy + 22);

  // Mode badge (Multiplayer Lock vs Pass & Play)
  const isMulti = data.mode === 'multiplayer';
  const modeBg = isMulti ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.2)';
  const modeBorder = isMulti ? '#818cf8' : '#34d399';
  const modeText = isMulti ? '🌐 Multi Lock' : '👥 Pass & Play';
  ctx.beginPath();
  ctx.roundRect(gx + 12, gy + 36, 92, 18, 9);
  ctx.fillStyle = modeBg;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = modeBorder;
  ctx.stroke();

  ctx.font = '600 10px monospace';
  ctx.fillStyle = modeBorder;
  ctx.fillText(modeText, gx + 20, gy + 49);

  // Turn status badge
  if (data.status === 'playing') {
    const isLocked = isMulti && data.lastPlayerId === myClientId;
    const turnText = isLocked
      ? '⏳ Opponent Turn'
      : data.gameType === 'tictactoe'
      ? `Turn: ${data.currentTurn === 'O' ? '⭕ Circle' : '❌ Cross'}`
      : data.gameType === 'dotsboxes'
      ? `Turn: Player ${data.currentTurn}`
      : `Turn: ${data.currentTurn === 'cyan' ? 'Cyan' : 'Pink'}`;

    const turnCol = isLocked
      ? '#f59e0b'
      : data.gameType === 'tictactoe'
      ? data.currentTurn === 'O'
        ? '#38bdf8'
        : '#ec4899'
      : data.currentTurn === 'A' || data.currentTurn === 'cyan'
      ? '#38bdf8'
      : '#c084fc';

    ctx.font = '600 11px -apple-system, sans-serif';
    ctx.fillStyle = turnCol;
    ctx.fillText(turnText, gx + 112, gy + 49);
  }

  // Header Buttons: Reset (🔄) & Delete (✕)
  // Reset button
  const resX = gx + gw - 64;
  const resY = gy + 12;
  const isHoverRes = isHoveredGame && hoverTarget?.action === 'reset';
  ctx.beginPath();
  ctx.arc(resX, resY + 6, 11, 0, Math.PI * 2);
  ctx.fillStyle = isHoverRes ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.08)';
  ctx.fill();
  ctx.font = '12px sans-serif';
  ctx.fillStyle = isHoverRes ? '#38bdf8' : '#94a3b8';
  ctx.fillText('↻', resX - 5, resY + 10);

  // Delete button
  const delX = gx + gw - 32;
  const delY = gy + 12;
  const isHoverDel = isHoveredGame && hoverTarget?.action === 'delete';
  ctx.beginPath();
  ctx.arc(delX, delY + 6, 11, 0, Math.PI * 2);
  ctx.fillStyle = isHoverDel ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)';
  ctx.fill();
  ctx.font = '12px sans-serif';
  ctx.fillStyle = isHoverDel ? '#ef4444' : '#94a3b8';
  ctx.fillText('✕', delX - 4, delY + 10);

  // -------------------------------------------------------------
  // 3. Render Game Board Internals
  // -------------------------------------------------------------

  // === TIC-TAC-TOE ===
  if (data.gameType === 'tictactoe' && data.ttt) {
    const startX = gx + (gw - 228) / 2;
    const startY = gy + 72;
    const cellSize = 76;

    // Draw 3x3 Grid Lines with Neon Glow
    ctx.strokeStyle = isLight ? 'rgba(15, 23, 42, 0.25)' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // 2 Vertical lines
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(startX + i * cellSize, startY);
      ctx.lineTo(startX + i * cellSize, startY + 228);
      ctx.stroke();
    }
    // 2 Horizontal lines
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(startX, startY + i * cellSize);
      ctx.lineTo(startX + 228, startY + i * cellSize);
      ctx.stroke();
    }

    // Draw Pieces
    data.ttt.board.forEach((val, idx) => {
      const c = idx % 3;
      const r = Math.floor(idx / 3);
      const cx = startX + c * cellSize + cellSize / 2;
      const cy = startY + r * cellSize + cellSize / 2;

      if (val === 'O') {
        // Circle Piece (Neon Cyan)
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();
      } else if (val === 'X') {
        // Cross Piece (Neon Rose / Pink)
        const rad = 18;
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(cx - rad, cy - rad);
        ctx.lineTo(cx + rad, cy + rad);
        ctx.moveTo(cx + rad, cy - rad);
        ctx.lineTo(cx - rad, cy + rad);
        ctx.stroke();
      }
    });

    // Hover Preview for next placement
    if (
      data.status === 'playing' &&
      isHoveredGame &&
      hoverTarget?.action === 'cell' &&
      hoverTarget.index !== undefined &&
      data.ttt.board[hoverTarget.index] === null
    ) {
      const c = hoverTarget.index % 3;
      const r = Math.floor(hoverTarget.index / 3);
      const cx = startX + c * cellSize + cellSize / 2;
      const cy = startY + r * cellSize + cellSize / 2;

      ctx.save();
      ctx.globalAlpha = 0.38;
      if (data.currentTurn === 'O') {
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#38bdf8';
        ctx.stroke();
      } else {
        const rad = 18;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(cx - rad, cy - rad);
        ctx.lineTo(cx + rad, cy + rad);
        ctx.moveTo(cx + rad, cy - rad);
        ctx.lineTo(cx - rad, cy + rad);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Winning Strike Line
    if (data.ttt.winningLine) {
      const [a, , c] = data.ttt.winningLine;
      const ax = startX + (a % 3) * cellSize + cellSize / 2;
      const ay = startY + Math.floor(a / 3) * cellSize + cellSize / 2;
      const cx = startX + (c % 3) * cellSize + cellSize / 2;
      const cy = startY + Math.floor(c / 3) * cellSize + cellSize / 2;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(cx, cy);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  // === DOTS & BOXES ===
  else if (data.gameType === 'dotsboxes' && data.dots) {
    const N = data.dots.dotGridSize;
    const spacing = N === 3 ? 75 : N === 4 ? 60 : N === 5 ? 50 : 42;
    const gridDim = (N - 1) * spacing;
    const startX = gx + (gw - gridDim) / 2;
    const startY = gy + 82;

    // Score pill in header
    ctx.font = '700 12px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Player A: ${data.dots.scoreA}`, gx + 14, gy + 72);
    ctx.fillStyle = '#c084fc';
    ctx.fillText(`Player B: ${data.dots.scoreB}`, gx + 110, gy + 72);

    // 1. Draw Completed Boxes (with bold 'A' or 'B' letter in center)
    for (let br = 0; br < N - 1; br++) {
      for (let bc = 0; bc < N - 1; bc++) {
        const idx = br * (N - 1) + bc;
        const owner = data.dots.boxes[idx];
        const bx = startX + bc * spacing;
        const by = startY + br * spacing;

        if (owner) {
          ctx.beginPath();
          ctx.roundRect(bx + 4, by + 4, spacing - 8, spacing - 8, 8);
          ctx.fillStyle = owner === 'A' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(192, 132, 252, 0.22)';
          ctx.fill();

          ctx.font = '800 18px -apple-system, sans-serif';
          ctx.fillStyle = owner === 'A' ? '#38bdf8' : '#c084fc';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(owner, bx + spacing / 2, by + spacing / 2);
          ctx.textAlign = 'start';
          ctx.textBaseline = 'alphabetic';
        }
      }
    }

    // 2. Draw Horizontal Lines
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N - 1; c++) {
        const idx = r * (N - 1) + c;
        const owner = data.dots.horizontalLines[idx];
        const x1 = startX + c * spacing;
        const x2 = startX + (c + 1) * spacing;
        const y = startY + r * spacing;

        const isHoverLine =
          data.status === 'playing' &&
          isHoveredGame &&
          hoverTarget?.action === 'hline' &&
          hoverTarget.index === idx;

        if (owner || isHoverLine) {
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.lineWidth = isHoverLine ? 4 : 5;
          ctx.strokeStyle = owner === 'A' ? '#38bdf8' : owner === 'B' ? '#c084fc' : data.currentTurn === 'A' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(192, 132, 252, 0.5)';
          ctx.lineCap = 'round';
          ctx.stroke();
        } else {
          // Subtle faint grid guide
          ctx.beginPath();
          ctx.moveTo(x1 + 6, y);
          ctx.lineTo(x2 - 6, y);
          ctx.lineWidth = 1;
          ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
          ctx.stroke();
        }
      }
    }

    // 3. Draw Vertical Lines
    for (let r = 0; r < N - 1; r++) {
      for (let c = 0; c < N; c++) {
        const idx = r * N + c;
        const owner = data.dots.verticalLines[idx];
        const x = startX + c * spacing;
        const y1 = startY + r * spacing;
        const y2 = startY + (r + 1) * spacing;

        const isHoverLine =
          data.status === 'playing' &&
          isHoveredGame &&
          hoverTarget?.action === 'vline' &&
          hoverTarget.index === idx;

        if (owner || isHoverLine) {
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.lineWidth = isHoverLine ? 4 : 5;
          ctx.strokeStyle = owner === 'A' ? '#38bdf8' : owner === 'B' ? '#c084fc' : data.currentTurn === 'A' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(192, 132, 252, 0.5)';
          ctx.lineCap = 'round';
          ctx.stroke();
        } else {
          // Subtle faint grid guide
          ctx.beginPath();
          ctx.moveTo(x, y1 + 6);
          ctx.lineTo(x, y2 - 6);
          ctx.lineWidth = 1;
          ctx.strokeStyle = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
          ctx.stroke();
        }
      }
    }

    // 4. Draw Glowing Dots
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const dx = startX + c * spacing;
        const dy = startY + r * spacing;

        ctx.beginPath();
        ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? '#0f172a' : '#ffffff';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dx, dy, 7, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.stroke();
      }
    }
  }

  // === CONNECT FOUR ===
  else if (data.gameType === 'connect4' && data.c4) {
    const cols = data.c4.cols;
    const colWidth = 36;
    const startX = gx + (gw - cols * colWidth) / 2;
    const startY = gy + 75;
    const boardH = 6 * 36;

    // Outer Connect 4 Cabinet Mesh
    ctx.beginPath();
    ctx.roundRect(startX - 6, startY - 6, cols * colWidth + 12, boardH + 12, 12);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4f46e5';
    ctx.stroke();

    // Hover column arrow indicator
    if (data.status === 'playing' && isHoveredGame && hoverTarget?.action === 'col' && hoverTarget.col !== undefined) {
      const hc = hoverTarget.col;
      const arrowX = startX + hc * colWidth + colWidth / 2;
      const arrowY = startY - 14;

      ctx.beginPath();
      ctx.moveTo(arrowX - 8, arrowY - 4);
      ctx.lineTo(arrowX + 8, arrowY - 4);
      ctx.lineTo(arrowX, arrowY + 6);
      ctx.closePath();
      ctx.fillStyle = data.currentTurn === 'cyan' ? '#38bdf8' : '#ec4899';
      ctx.fill();
    }

    // Draw slots & tokens
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < 6; r++) {
        // Row 0 is at bottom
        const cx = startX + c * colWidth + colWidth / 2;
        const cy = startY + (5 - r) * 36 + 18;
        const token = data.c4.board[c][r];

        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);

        if (token === 'cyan') {
          ctx.fillStyle = '#06b6d4';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#38bdf8';
          ctx.stroke();
        } else if (token === 'pink') {
          ctx.fillStyle = '#db2777';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#f472b6';
          ctx.stroke();
        } else {
          // Empty slot cutout
          ctx.fillStyle = isLight ? '#f1f5f9' : '#0a0f1d';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.stroke();
        }
      }
    }

    // Winning Cells Glow Halo
    if (data.c4.winningCells) {
      data.c4.winningCells.forEach(([wc, wr]) => {
        const cx = startX + wc * colWidth + colWidth / 2;
        const cy = startY + (5 - wr) * 36 + 18;

        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();
      }
      );
    }
  }

  // -------------------------------------------------------------
  // 4. Raised Victory Trophy Banner (As Requested by User)
  // "when the game ends, that game area automatically raises
  // and becomes a text 'Circle won here' (or X won)"
  // -------------------------------------------------------------
  if (data.status === 'ended') {
    const bannerW = Math.min(gw - 28, 250);
    const bannerH = 100;
    const bannerX = gx + (gw - bannerW) / 2;
    const bannerY = gy + (gh - bannerH) / 2;

    // Raised 3D Card Backdrop with Gold / Cyan Glow
    ctx.save();
    ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
    ctx.shadowBlur = 24;

    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 16);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
    ctx.stroke();
    ctx.restore();

    // Victory Title
    ctx.font = '800 16px -apple-system, sans-serif';
    ctx.fillStyle = '#fbbf24';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 VICTORY', bannerX + bannerW / 2, bannerY + 28);

    // "Circle won here!" / "Player A won here!"
    ctx.font = '700 13px -apple-system, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(data.winnerText || 'Game Ended', bannerX + bannerW / 2, bannerY + 50);

    // "Play Again / Rematch" Raised Button
    const btnW = 120;
    const btnH = 26;
    const btnX = bannerX + (bannerW - btnW) / 2;
    const btnY = bannerY + 62;

    const isHoverBtn = isHoveredGame && hoverTarget?.action === 'reset';

    ctx.beginPath();
    ctx.roundRect(btnX, btnY, btnW, btnH, 13);
    ctx.fillStyle = isHoverBtn ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#f59e0b';
    ctx.fill();

    ctx.font = '700 11px -apple-system, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('🔄 Play Again', btnX + btnW / 2, btnY + 17);

    ctx.textAlign = 'start';
  }

  ctx.restore();
}
