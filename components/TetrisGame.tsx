import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TetrisEngine } from '../utils/tetrisEngine';
import { COLORS, ZOOM, BOARD_HEIGHT, BOARD_WIDTH } from '../constants';
import { GameState } from '../types';
import { GameControls } from './GameControls';

export const TetrisGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TetrisEngine>(new TetrisEngine(BOARD_HEIGHT, BOARD_WIDTH));
  const requestRef = useRef<number>(0);
  
  // React state for UI synchronization
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Input state tracking to match original "pressingDown" logic
  const inputState = useRef({
    pressingDown: false,
    lastTime: 0,
    counter: 0,
  });

  // --- Drawing Logic ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const game = engineRef.current;

    // Clear
    ctx.fillStyle = '#111827'; // Tailwind gray-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center the board
    const totalWidth = BOARD_WIDTH * ZOOM;
    const totalHeight = BOARD_HEIGHT * ZOOM;
    const offsetX = (canvas.width - totalWidth) / 2;
    const offsetY = (canvas.height - totalHeight) / 2;

    // Draw Background Grid
    ctx.strokeStyle = '#374151'; // Tailwind gray-700
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX - 1, offsetY - 1, totalWidth + 2, totalHeight + 2);

    // Draw Field
    for (let i = 0; i < game.height; i++) {
      for (let j = 0; j < game.width; j++) {
        if (game.field[i][j] > 0) {
          ctx.fillStyle = COLORS[game.field[i][j]];
          // Add a slight glow/shadow effect
          ctx.shadowColor = COLORS[game.field[i][j]];
          ctx.shadowBlur = 0;
          
          ctx.fillRect(offsetX + ZOOM * j + 1, offsetY + ZOOM * i + 1, ZOOM - 2, ZOOM - 2);
          
          // Reset shadow
          ctx.shadowBlur = 0;
        } else {
            // Subtle grid
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fillRect(offsetX + ZOOM * j + 1, offsetY + ZOOM * i + 1, ZOOM - 2, ZOOM - 2);
        }
      }
    }

    // Draw Active Figure
    if (game.figure) {
      let img = game.figure.image();
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          let p = i * 4 + j;
          if (img.includes(p)) {
            ctx.fillStyle = COLORS[game.figure.color];
            ctx.shadowColor = COLORS[game.figure.color];
            ctx.shadowBlur = 10;
            
            ctx.fillRect(
              offsetX + ZOOM * (j + game.figure.x) + 1,
              offsetY + ZOOM * (i + game.figure.y) + 1,
              ZOOM - 2,
              ZOOM - 2
            );
            ctx.shadowBlur = 0;
          }
        }
      }
    }

    // Game Over Overlay
    if (game.state === GameState.GAMEOVER) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'bold 40px Inter';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
      
      ctx.font = '20px Inter';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('Press Restart', canvas.width / 2, canvas.height / 2 + 40);
    }
  }, []);

  // --- Game Loop ---
  const animate = useCallback((time: number) => {
    const state = inputState.current;
    const game = engineRef.current;

    if (!state.lastTime) state.lastTime = time;
    const delta = time - state.lastTime;
    const fps = 25;

    if (delta >= 1000 / fps) {
      state.counter++;
      
      // Game Logic Speed
      const threshold = Math.floor(fps / 2 / 2); // Approx speed
      
      if (state.counter % threshold === 0 || state.pressingDown) {
        if (game.state === GameState.START) {
          game.goDown();
          // Sync Score
          setScore(game.score);
        }
        
        if (game.state === GameState.GAMEOVER) {
            setIsGameOver(true);
        }
      }

      draw();
      state.lastTime = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // --- Controls Handling ---
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const game = engineRef.current;
    if (game.state === GameState.GAMEOVER) return;

    if (e.key === "ArrowUp") game.rotateFig();
    if (e.key === "ArrowDown") inputState.current.pressingDown = true;
    if (e.key === "ArrowLeft") game.goSide(-1);
    if (e.key === "ArrowRight") game.goSide(1);
    if (e.key === " ") game.goSpace();
    if (e.key === "Escape") {
       handleRestart();
    }
    // Force re-render for instant movement feedback
    draw(); 
  }, [draw]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowDown") inputState.current.pressingDown = false;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // --- Serial Handling ---
  const connectSerial = async () => {
    if (!('serial' in navigator)) {
      alert("Web Serial not supported in this browser.");
      return;
    }

    try {
      // @ts-ignore - Navigator.serial types might be missing in standard lib
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const textDecoder = new TextDecoderStream();
      // @ts-ignore
      const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();

      setIsConnected(true);

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
            setIsConnected(false);
            break;
        }
        if (value) {
          handleSerialInput(value.trim());
        }
      }
    } catch (err) {
      console.error("Serial Error:", err);
      setIsConnected(false);
    }
  };

  const handleSerialInput = (data: string) => {
    const game = engineRef.current;
    
    for (let char of data) {
        // Basic command mapping
        const cmd = char.toLowerCase();
        
        if (game.state === GameState.GAMEOVER && cmd === 'r') {
            handleRestart();
            return;
        }

        switch(cmd) {
            case 'l': game.goSide(-1); break;
            case 'r': game.goSide(1); break;
            case 'u': game.rotateFig(); break;
            case 'd': 
                inputState.current.pressingDown = true;
                // Reset flag shortly after to simulate button press, not hold
                setTimeout(() => { inputState.current.pressingDown = false; }, 100);
                break;
        }
    }
  };

  const handleRestart = () => {
      engineRef.current.reset();
      setIsGameOver(false);
      setScore(0);
      inputState.current.counter = 0;
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-8">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <canvas 
            ref={canvasRef} 
            width={300} 
            height={520}
            className="relative bg-gray-900 rounded-lg shadow-2xl block"
        />
      </div>
      
      <GameControls 
        score={score} 
        isConnected={isConnected} 
        onConnect={connectSerial}
        onRestart={handleRestart}
        isGameOver={isGameOver}
      />
    </div>
  );
};