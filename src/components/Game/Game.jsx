import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getField, postResult } from '../../services/api';
import './Game.css';

const Game = ({ username }) => {
  const [field, setField] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [flagPosition, setFlagPosition] = useState(null);
  const [time, setTime] = useState(0);
  const playerPositionRef = useRef(playerPosition);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchField = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const level = searchParams.get('difficulty') === 'easy' ? 1 : 2;
        const fieldData = await getField(level);
        setField(fieldData);
        const initialPosition = findPlayerPosition(fieldData);
        setPlayerPosition(initialPosition);
        playerPositionRef.current = initialPosition;
        const flagPos = findFlagPosition(fieldData);
        setFlagPosition(flagPos);
        startTimer();
      } catch (error) {
        console.error('Failed to fetch field data:', error);
      }
    };

    fetchField();

    return () => {
      stopTimer();
    };
  }, [location]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  const findPlayerPosition = (field) => {
    for (let y = 0; y < field.length; y++) {
      for (let x = 0; x < field[y].length; x++) {
        if (field[y][x] === 2) return { x, y };
      }
    }
    return { x: 0, y: 0 };
  };

  const findFlagPosition = (field) => {
    for (let y = 0; y < field.length; y++) {
      for (let x = 0; x < field[y].length; x++) {
        if (field[y][x] === 4) return { x, y };
      }
    }
    return null;
  };

  const handleKeyDown = useCallback((e) => {
    const { x, y } = playerPositionRef.current;
    let newX = x, newY = y;
    let pushX = x, pushY = y;

    if (e.key === 'ArrowUp') { 
      newY -= 1;
      pushY -= 2;
    }
    if (e.key === 'ArrowDown') { 
      newY += 1;
      pushY += 2;
    }
    if (e.key === 'ArrowLeft') { 
      newX -= 1;
      pushX -= 2;
    }
    if (e.key === 'ArrowRight') { 
      newX += 1;
      pushX += 2;
    }

    if (canMove(newX, newY, pushX, pushY)) {
      const updatedField = JSON.parse(JSON.stringify(field));

      if (field[newY][newX] === 3) {
        updatedField[y][x] = 0;
        updatedField[newY][newX] = 2;
        updatedField[pushY][pushX] = 3;
      } else {
        updatedField[y][x] = 0;
        updatedField[newY][newX] = 2;
      }
      setField(updatedField);
      setPlayerPosition({ x: newX, y: newY });
      playerPositionRef.current = { x: newX, y: newY };

      if (flagPosition && newX === flagPosition.x && newY === flagPosition.y) {
        stopTimer();
        const searchParams = new URLSearchParams(location.search);
        const level = searchParams.get('difficulty') === 'easy' ? 1 : 2;
        postResult({ level, time });
        navigate(`/clear?time=${time}&username=${encodeURIComponent(username)}&difficulty=${level}`);
      }
    }
  }, [field, flagPosition, navigate, time, username]);

  const canMove = (newX, newY, pushX, pushY) => {
    if (field[newY] && (field[newY][newX] === 0 || field[newY][newX] === 4)) return true;
    if (field[newY] && field[newY][newX] === 3) {
      return field[pushY] && field[pushY][pushX] === 0;
    }
    return false;
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="game-container">
      <div className="timer">経過時間: {formatTime()}</div>
      {field.map((row, rowIndex) => (
        <div key={rowIndex} className="row">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={`cell ${getCellClass(cell, playerPosition, rowIndex, cellIndex)}`}>
              {getCellContent(cell)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const getCellContent = (cell) => {
  switch (cell) {
    case 0: return '';
    case 1: return '';
    case 2: return 'P';
    case 3: return '';
    case 4: return 'F';
    default: return '';
  }
};

const getCellClass = (cell, playerPosition, y, x) => {
  if (playerPosition.x === x && playerPosition.y === y) return 'player';
  return cell === 1 ? 'wall' : cell === 3 ? 'block' : cell === 4 ? 'flag' : 'empty';
};

export default Game;
