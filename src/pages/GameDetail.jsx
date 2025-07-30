import React, { useEffect, useRef, useState } from "react";

const GameDetail = () => {
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const game = useRef({});

  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [message, setMessage] = useState(""); // Untuk Game Over / Win

  // Fungsi untuk menggambar dan update game
  const drawPaddle = (g, ctx) => {
    ctx.beginPath();
    ctx.roundRect(
      g.paddleX,
      g.canvas.height - g.paddleHeight,
      g.paddleWidth,
      g.paddleHeight,
      30
    );
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.closePath();
  };

  const drawBall = (g, ctx) => {
    ctx.beginPath();
    ctx.arc(g.x, g.y, g.ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.closePath();
  };

  const drawBricks = (g, ctx) => {
    for (let c = 0; c < g.columnCount; c++) {
      for (let r = 0; r < g.rowCount; r++) {
        if (g.bricks[c][r].status === 1) {
          const brickX = c * (g.brickWidth + g.brickPadding) + g.leftOffset;
          const brickY = r * (g.brickHeight + g.brickPadding) + g.topOffset;
          g.bricks[c][r].x = brickX;
          g.bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.roundRect(brickX, brickY, g.brickWidth, g.brickHeight, 10);
          ctx.fillStyle = "#333";
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  };

  const drawScore = (g, ctx) => {
    ctx.font = "bold 16px sans-serif";
    ctx.fillStyle = "#333";
    ctx.fillText("Score : " + g.score, 8, 24);
  };

  const detectCollision = (g) => {
    for (let c = 0; c < g.columnCount; c++) {
      for (let r = 0; r < g.rowCount; r++) {
        const b = g.bricks[c][r];
        if (b.status === 1) {
          if (
            g.x > b.x &&
            g.x < b.x + g.brickWidth &&
            g.y > b.y &&
            g.y < b.y + g.brickHeight
          ) {
            g.dy = -g.dy;
            b.status = 0;
            g.score++;
            if (g.score === g.rowCount * g.columnCount) {
              setMessage("You Win!");
              setIsGameOver(true);
              setIsStarted(false);
              clearInterval(intervalRef.current);
            }
          }
        }
      }
    }
  };

  const update = () => {
    const g = game.current;
    const ctx = g.ctx;

    ctx.clearRect(0, 0, g.canvas.width, g.canvas.height);
    drawScore(g, ctx);
    drawBricks(g, ctx);
    drawBall(g, ctx);
    drawPaddle(g, ctx);
    detectCollision(g);

    if (
      g.x + g.dx > g.canvas.width - g.ballRadius ||
      g.x + g.dx < g.ballRadius
    ) {
      g.dx = -g.dx;
    }

    if (g.y + g.dy < g.ballRadius) {
      g.dy = -g.dy;
    } else if (g.y + g.dy > g.canvas.height - g.ballRadius) {
      if (g.x > g.paddleX && g.x < g.paddleX + g.paddleWidth) {
        g.dy = -g.dy;
      } else {
        setMessage("Game Over!");
        setIsGameOver(true);
        setIsStarted(false);
        clearInterval(intervalRef.current);
      }
    }

    g.x += g.dx;
    g.y += g.dy;
  };

  useEffect(() => {
    if (!isStarted || isPaused || isGameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const g = {
      ctx,
      canvas,
      ballRadius: 9,
      x: canvas.width / (Math.floor(Math.random() * Math.random() * 10) + 3),
      y: canvas.height - 40,
      dx: 2,
      dy: -2,
      paddleHeight: 12,
      paddleWidth: 72,
      paddleX: (canvas.width - 72) / 2,
      rowCount: 5,
      columnCount: 9,
      brickWidth: 54,
      brickHeight: 18,
      brickPadding: 12,
      topOffset: 40,
      leftOffset: 33,
      score: 0,
      bricks: [],
    };

    // Setup bricks hanya jika game baru dimulai
    if (!game.current.bricks || game.current.bricks.length === 0) {
      for (let c = 0; c < g.columnCount; c++) {
        g.bricks[c] = [];
        for (let r = 0; r < g.rowCount; r++) {
          g.bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
      }
      game.current = g;
    }

    const move = (e) => {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        game.current.paddleX = relativeX - game.current.paddleWidth / 2;
      }
    };
    document.addEventListener("mousemove", move);

    intervalRef.current = setInterval(update, 10);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("mousemove", move);
    };
  }, [isStarted, isPaused]);

  const startGame = () => {
    setMessage("");
    setIsStarted(true);
    setIsPaused(false);
    setIsGameOver(false);
    // Reset game state
    game.current = {};
  };

  const pauseGame = () => {
    clearInterval(intervalRef.current);
    setIsPaused(true);
  };

  const resumeGame = () => {
    setIsPaused(false);
    // Game akan dilanjutkan oleh useEffect
  };

  const resetGame = () => {
    clearInterval(intervalRef.current);
    setMessage("");
    setIsGameOver(false);
    setIsStarted(false);
    setIsPaused(false);
    game.current = {}; // Reset game state
    setTimeout(() => startGame(), 100);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-[#00000059]">
      <canvas
        ref={canvasRef}
        width={650}
        height={450}
        className="bg-[#ccc] border-2 border-black"
      />
      <div className="mt-6 space-x-4">
        {!isStarted && !isGameOver && (
          <button
            onClick={startGame}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Start
          </button>
        )}
        {isStarted && !isPaused && !isGameOver && (
          <button
            onClick={pauseGame}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Pause
          </button>
        )}
        {isStarted && isPaused && !isGameOver && (
          <button
            onClick={resumeGame}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Resume
          </button>
        )}
        {isGameOver && (
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Reset
          </button>
        )}
      </div>

      {message && (
        <p className="mt-4 text-lg font-bold text-red-600">{message}</p>
      )}
    </section>
  );
};

export default GameDetail;
