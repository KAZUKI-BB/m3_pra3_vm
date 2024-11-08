import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../services/api';
import { clearToken } from '../../utils/storage';

const Select = () => {
  const [nickname, setNickname] = useState('');
  const [totalPlayTime, setTotalPlayTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile();
        setNickname(profileData.nickname);

        // 合計プレイ時間を計算
        const totalTime = profileData.results.reduce((acc, result) => acc + result.time, 0);
        setTotalPlayTime(Math.ceil(totalTime / 60)); // 分単位に切り上げ
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  // ゲーム画面に遷移（難易度選択）
  const startGame = (difficulty) => {
    navigate(`/game?difficulty=${difficulty}`);
  };

  return (
    <div className="select-container">
      <h2>選択画面</h2>
      <p>ニックネーム: {nickname}</p>
      <p>合計プレイ時間: {totalPlayTime} 分</p>
      <button onClick={goToProfile}>プロフィール設定</button>
      <button onClick={handleLogout}>ログアウト</button>
      <div>
        <h3>難易度選択</h3>
        <button onClick={() => startGame('easy')}>簡単</button>
        <button onClick={() => startGame('normal')}>普通</button>
      </div>
    </div>
  );
};

export default Select;
