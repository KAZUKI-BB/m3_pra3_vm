import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getResults } from '../../services/api';
import './Clear.css';

const Clear = () => {
  const [ranking, setRanking] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const time = parseInt(searchParams.get('time'), 10);
  const username = searchParams.get('username');
  console.log("Username:", username); // デバッグ用ログ

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const level = searchParams.get('difficulty') === 'easy' ? 1 : 2;
        const results = await getResults(level);
        
        const allResults = [
          ...results,
          { username, time }
        ];
        
        const sortedResults = allResults
          .sort((a, b) => a.time - b.time)
          .slice(0, 3)
          .map((result, index, arr) => ({
            ...result,
            rank: index > 0 && result.time === arr[index - 1].time ? arr[index - 1].rank : index + 1,
          }));

        setRanking(sortedResults);
      } catch (error) {
        console.error('Failed to fetch ranking:', error);
      }
    };

    fetchRanking();
  }, [searchParams]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleReplay = () => {
    navigate('/select');
  };

  return (
    <div className="clear-container">
      <h2>ゲームクリア！</h2>
      <p>経過時間: {formatTime(time)}</p>

      <h3>ランキング</h3>
      <ul>
        {ranking.map((result, index) => (
          <li key={index} className={result.username === username ? 'active' : ''}>
            <span>{result.rank}位: </span>
            <span>{result.username}</span>
            <span>{formatTime(result.time)}</span>
          </li>
        ))}
      </ul>

      <button onClick={handleReplay}>リプレイ</button>
    </div>
  );
};

export default Clear;
