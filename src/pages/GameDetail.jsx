import React, { useEffect, useRef } from "react";

const GameDetail = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let ballRadius = 9;
    let x = canvas.width / (Math.floor(Math.random() * Math.random() * 10) + 3);
    let y = canvas.height - 40;
    let dx = 2;
    let dy = -2;

    let paddleHeight = 12;
    let paddleWidth = 72;
    let paddleX = (canvas.width - paddleWidth) / 2;

    let rowCount = 5;
    let columnCount = 9;
    let brickWidth = 54;
    let brickHeight = 18;
    let brickPadding = 12;
    let topOffset = 40;
    let leftOffset = 33;
    let score = 0;

    let bricks = [];
    for (let c = 0; c < columnCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < rowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }

    function mouseMoveHandler(e) {
      const relativeX = e.clientX - canvas.offsetLeft;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
      }
    }

    document.addEventListener("mousemove", mouseMoveHandler);

    function drawPaddle() {
      ctx.beginPath();
      ctx.roundRect(
        paddleX,
        canvas.height - paddleHeight,
        paddleWidth,
        paddleHeight,
        30
      );
      ctx.fillStyle = "#333";
      ctx.fill();
      ctx.closePath();
    }

    function drawBall() {
      ctx.beginPath();
      ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#333";
      ctx.fill();
      ctx.closePath();
    }

    function drawBricks() {
      for (let c = 0; c < columnCount; c++) {
        for (let r = 0; r < rowCount; r++) {
          if (bricks[c][r].status === 1) {
            let brickX = c * (brickWidth + brickPadding) + leftOffset;
            let brickY = r * (brickHeight + brickPadding) + topOffset;
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 30);
            ctx.fillStyle = "#333";
            ctx.fill();
            ctx.closePath();
          }
        }
      }
    }

    function trackScore() {
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = "#333";
      ctx.fillText("Score : " + score, 8, 24);
    }

    function hitDetection() {
      for (let c = 0; c < columnCount; c++) {
        for (let r = 0; r < rowCount; r++) {
          let b = bricks[c][r];
          if (b.status === 1) {
            if (
              x > b.x &&
              x < b.x + brickWidth &&
              y > b.y &&
              y < b.y + brickHeight
            ) {
              dy = -dy;
              b.status = 0;
              score++;
              if (score === rowCount * columnCount) {
                alert("You Win!");
                document.location.reload();
              }
            }
          }
        }
      }
    }

    function init() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      trackScore();
      drawBricks();
      drawBall();
      drawPaddle();
      hitDetection();

      if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
      }

      if (y + dy < ballRadius) {
        dy = -dy;
      } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
          dy = -dy;
        } else {
          alert("Game Over!");
          document.location.reload();
        }
      }

      if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
        dy = -dy;
      }

      x += dx;
      y += dy;
    }

    const interval = setInterval(init, 10);

    // Cleanup saat komponen unmount
    return () => {
      clearInterval(interval);
      document.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, []);

  return (
    <section className="h-screen flex justify-center items-center bg-[#00000069]">
      <canvas
        ref={canvasRef}
        width={650}
        height={450}
        className="bg-[#ccc] mt-40 border-2 border-black"
      ></canvas>
    </section>
  );
};

export default GameDetail;
