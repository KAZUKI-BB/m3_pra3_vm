import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getField, postResult } from '../../services/api';
import './Game.css';

// Gameコンポーネント - ゲームのメイン部分を担当し、プレイヤーの位置やフィールド情報を管理する
const Game = ({ username }) => {
  // フィールドデータ（2次元配列）を保持するための状態
  const [field, setField] = useState([]);
  
  // プレイヤーの位置をオブジェクト形式で保持
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  
  // ゴールの位置を保存するための状態
  const [flagPosition, setFlagPosition] = useState(null);
  
  // 経過時間を秒単位で記録
  const [time, setTime] = useState(0);
  
  // 現在のプレイヤーの位置を常に保持するためのref
  const playerPositionRef = useRef(playerPosition);
  
  // タイマーのIDを保持するためのref（タイマーの開始・停止に利用）
  const timerRef = useRef(null);
  
  // 画面遷移に利用するhook
  const navigate = useNavigate();
  
  // 現在のURLやクエリパラメータを取得するためのhook
  const location = useLocation();

  // 初回レンダリング時、もしくはlocationが変更された場合にフィールドデータを取得する
  useEffect(() => {
    const fetchField = async () => {
      try {
        // URLのクエリパラメータから難易度（easy/normal）を取得し、数値に変換
        const searchParams = new URLSearchParams(location.search);
        const level = searchParams.get('difficulty') === 'easy' ? 1 : 2; // 1 = easy, 2 = normal
        
        // getField関数でフィールドデータを取得（非同期処理）
        const fieldData = await getField(level);
        setField(fieldData); // フィールドデータを状態にセット
        
        // プレイヤーの初期位置をフィールドから見つけて設定
        const initialPosition = findPlayerPosition(fieldData);
        setPlayerPosition(initialPosition);
        playerPositionRef.current = initialPosition; // refにも初期位置を設定して保持
        
        // フィールドからゴール（フラッグ）の位置を見つけて設定
        const flagPos = findFlagPosition(fieldData);
        setFlagPosition(flagPos);
        
        // タイマーをスタート
        startTimer();
      } catch (error) {
        console.error('Failed to fetch field data:', error); // エラーが発生した場合のログ出力
      }
    };

    fetchField();

    // コンポーネントがアンマウントされるときにタイマーを停止
    return () => {
      stopTimer();
    };
  }, [location]);

  // タイマーを1秒ごとに更新する関数
  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTime(prevTime => prevTime + 1); // 現在の時間に+1秒
    }, 1000); // 1000ms（1秒）ごとに実行
  };

  // タイマーを停止する関数
  const stopTimer = () => {
    clearInterval(timerRef.current); // タイマーをクリアして停止
  };

  // フィールド内でプレイヤーの初期位置（値が2の位置）を探す
  const findPlayerPosition = (field) => {
    for (let y = 0; y < field.length; y++) { // 各行をループ
      for (let x = 0; x < field[y].length; x++) { // 各列をループ
        if (field[y][x] === 2) return { x, y }; // 値が2ならばプレイヤーの初期位置
      }
    }
    return { x: 0, y: 0 }; // デフォルトの位置（万が一見つからなければここに戻る）
  };

  // フィールド内でゴール（フラッグ）の位置（値が4の位置）を探す
  const findFlagPosition = (field) => {
    for (let y = 0; y < field.length; y++) {
      for (let x = 0; x < field[y].length; x++) {
        if (field[y][x] === 4) return { x, y }; // 値が4ならばゴール位置
      }
    }
    return null; // ゴール位置がなければnullを返す
  };

  // プレイヤーが矢印キーで移動する際の処理
  const handleKeyDown = useCallback((e) => {
    // 現在のプレイヤーの位置を取得
    const { x, y } = playerPositionRef.current;
    let newX = x, newY = y; // 新しい位置の初期化
    let pushX = x, pushY = y; // 押すブロックがある場合の位置

    // 各矢印キーに対応する移動方向を設定
    if (e.key === 'ArrowUp') { 
      newY -= 1; // 上へ移動
      pushY -= 2; // 押す位置もさらに1つ上
    }
    if (e.key === 'ArrowDown') { 
      newY += 1; // 下へ移動
      pushY += 2;
    }
    if (e.key === 'ArrowLeft') { 
      newX -= 1; // 左へ移動
      pushX -= 2;
    }
    if (e.key === 'ArrowRight') { 
      newX += 1; // 右へ移動
      pushX += 2;
    }

    // 移動可能かどうかを確認（canMove関数で判定）
    if (canMove(newX, newY, pushX, pushY)) {
      const updatedField = JSON.parse(JSON.stringify(field)); // フィールドデータのコピー（変更のため）

      // 移動先にブロック（値が3）があるか確認
      if (field[newY][newX] === 3) {
        updatedField[y][x] = 0; // 現在位置を空セル（0）に変更
        updatedField[newY][newX] = 2; // 新しい位置をプレイヤー位置に変更
        updatedField[pushY][pushX] = 3; // 押す先の位置にブロックを移動
      } else {
        updatedField[y][x] = 0; // 通常移動：現在位置を空セル（0）に
        updatedField[newY][newX] = 2; // 新しい位置にプレイヤーを設定
      }
      setField(updatedField); // 更新したフィールドをセット
      setPlayerPosition({ x: newX, y: newY }); // 新しいプレイヤー位置をセット
      playerPositionRef.current = { x: newX, y: newY }; // refにも新しい位置を保持

      // プレイヤーがゴールに到達した場合の処理
      if (flagPosition && newX === flagPosition.x && newY === flagPosition.y) {
        stopTimer(); // タイマーを停止
        const searchParams = new URLSearchParams(location.search);
        const level = searchParams.get('difficulty') === 'easy' ? 1 : 2; // 難易度を取得
        postResult({ level, time }); // 結果をAPIに送信
        navigate(`/clear?time=${time}&username=${encodeURIComponent(username)}&difficulty=${level}`); // クリア画面に遷移
      }
    }
  }, [field, flagPosition, navigate, time, username]);

  // プレイヤーが移動可能かどうかを判定する関数
  const canMove = (newX, newY, pushX, pushY) => {
    // 移動先が空セルかゴールの場合は移動可能
    if (field[newY] && (field[newY][newX] === 0 || field[newY][newX] === 4)) return true;
    // 移動先がブロックの場合、押し先が空セルであれば移動可能
    if (field[newY] && field[newY][newX] === 3) {
      return field[pushY] && field[pushY][pushX] === 0;
    }
    return false; // それ以外の場合は移動不可
  };

  // キー入力イベントのリスナーを登録し、クリーンアップで解除
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 経過時間を分と秒のフォーマットで表示
  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // フィールドを表示するUI
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

// 各セルの内容を取得
const getCellContent = (cell) => {
  switch (cell) {
    case 0: return ''; // 空セル
    case 1: return ''; // 壁
    case 2: return 'P'; // プレイヤー
    case 3: return ''; // ブロック
    case 4: return 'F'; // ゴール
    default: return '';
  }
};

// 各セルのクラス名を決定
const getCellClass = (cell, playerPosition, y, x) => {
  if (playerPosition.x === x && playerPosition.y === y) return 'player'; // プレイヤー位置
  return cell === 1 ? 'wall' : cell === 3 ? 'block' : cell === 4 ? 'flag' : 'empty';
};

export default Game;
