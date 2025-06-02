import React, { useRef, useEffect } from 'react';

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let paddle1Y = 100, paddle2Y = 100;
    let ballX = 250, ballY = 150, ballVX = 3, ballVY = 2;
    const paddleHeight = 60, paddleWidth = 10, canvasWidth = 500, canvasHeight = 300;
    const paddleSpeed = 6;

    const draw = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#fff";
      ctx.fillRect(10, paddle1Y, paddleWidth, paddleHeight);
      ctx.fillRect(canvasWidth - 20, paddle2Y, paddleWidth, paddleHeight);
      ctx.beginPath();
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
      ctx.fill();
    };

    const update = () => {
      // Move paddles based on keys pressed
      if (keysPressed.current['w']) paddle1Y = Math.max(0, paddle1Y - paddleSpeed);
      if (keysPressed.current['s']) paddle1Y = Math.min(canvasHeight - paddleHeight, paddle1Y + paddleSpeed);
      if (keysPressed.current['ArrowUp']) paddle2Y = Math.max(0, paddle2Y - paddleSpeed);
      if (keysPressed.current['ArrowDown']) paddle2Y = Math.min(canvasHeight - paddleHeight, paddle2Y + paddleSpeed);

      ballX += ballVX;
      ballY += ballVY;

      // Ball collision with top/bottom walls
      if (ballY < 8) {
        ballY = 8;
        ballVY *= -1;
      }
      if (ballY > canvasHeight - 8) {
        ballY = canvasHeight - 8;
        ballVY *= -1;
      }

      // Ball collision with left paddle
      if (
        ballX - 8 < 20 && ballX - 8 > 10 &&
        ballY > paddle1Y && ballY < paddle1Y + paddleHeight
      ) {
        // Move ball outside paddle to prevent sticking
        ballX = 20 + 8;
        // Calculate hit position
        const hitPos = (ballY - paddle1Y) / paddleHeight;
        // If hit near top or bottom edge, reverse both velocities
        if (hitPos < 0.15 || hitPos > 0.85) {
          ballVX = Math.abs(ballVX);
          ballVY *= -1;
        } else {
          ballVX = Math.abs(ballVX);
          ballVY = (hitPos - 0.5) * 10;
        }
      }

      // Ball collision with right paddle
      if (
        ballX + 8 > canvasWidth - 20 && ballX + 8 < canvasWidth - 10 &&
        ballY > paddle2Y && ballY < paddle2Y + paddleHeight
      ) {
        // Move ball outside paddle to prevent sticking
        ballX = canvasWidth - 20 - 8;
        const hitPos = (ballY - paddle2Y) / paddleHeight;
        if (hitPos < 0.15 || hitPos > 0.85) {
          ballVX = -Math.abs(ballVX);
          ballVY *= -1;
        } else {
          ballVX = -Math.abs(ballVX);
          ballVY = (hitPos - 0.5) * 10;
        }
      }

      // Ball out of bounds (reset)
      if (ballX < 0 || ballX > canvasWidth) {
        ballX = canvasWidth / 2;
        ballY = canvasHeight / 2;
        ballVX = (Math.random() > 0.5 ? 3 : -3);
        ballVY = (Math.random() - 0.5) * 4;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let animationFrameId: number;
    const gameLoop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} width={500} height={300} style={{ background: '#222', display: 'block', margin: '0 auto' }} />
  );
};

export default PongGame;