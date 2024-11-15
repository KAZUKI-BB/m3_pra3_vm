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

  // ... existing code ...

  const handleKeyDown = useCallback((e) => {
    const { x, y } = playerPositionRef.current;
    const moveInfo = calculateNextPosition(e.key, x, y);
    if (!moveInfo) return;

    const { newX, newY, pushX, pushY } = moveInfo;
    const moveType = checkMoveType(newX, newY, pushX, pushY);
    
    if (moveType === 'invalid') return;

    const updatedField = JSON.parse(JSON.stringify(field));
    updateFieldFunc(updatedField, moveType, { x, y, newX, newY, pushX, pushY });
    
    setField(updatedField);
    setPlayerPosition({ x: newX, y: newY });
    playerPositionRef.current = { x: newX, y: newY };

    checkGoal(newX, newY);
  }, [field, flagPosition, navigate, time, username]);

  // 移動先の座標を計算
  const calculateNextPosition = (key, x, y) => {
    let newX = x, newY = y;
    let pushX = x, pushY = y;

    switch (key) {
      case 'ArrowUp':
        return { newX, newY: y - 1, pushX, pushY: y - 2 };
      case 'ArrowDown':
        return { newX, newY: y + 1, pushX, pushY: y + 2 };
      case 'ArrowLeft':
        return { newX: x - 1, newY: y, pushX: x - 2, pushY };
      case 'ArrowRight':
        return { newX: x + 1, newY: y, pushX: x + 2, pushY };
      default:
        return null;
    }
  };

  // 移動タイプを判定
  const checkMoveType = (newX, newY, pushX, pushY) => {
    if (!field[newY]) return 'invalid';
    
    const nextCell = field[newY][newX];
    
    if (nextCell === 0 || nextCell === 4) return 'move';
    if (nextCell === 3 && field[pushY]?.[pushX] === 0) return 'push';
    return 'invalid';
  };

  // フィールドの更新
  const updateFieldFunc = (updatedField, moveType, positions) => {
    const { x, y, newX, newY, pushX, pushY } = positions;
    
    updatedField[y][x] = 0; // 現在位置を空に
    
    if (moveType === 'push') {
      updatedField[newY][newX] = 2; // プレイヤー移動
      updatedField[pushY][pushX] = 3; // ブロック移動
    } else {
      updatedField[newY][newX] = 2; // プレイヤー移動
    }
  };

  // ゴール判定
  const checkGoal = (newX, newY) => {
    if (flagPosition && newX === flagPosition.x && newY === flagPosition.y) {
      stopTimer();
      const searchParams = new URLSearchParams(location.search);
      const level = searchParams.get('difficulty') === 'easy' ? 1 : 2;
      postResult({ level, time });
      navigate(`/clear?time=${time}&username=${encodeURIComponent(username)}&difficulty=${level}`);
    }
  };

  // ... existing code ...

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
