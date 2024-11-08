import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../services/api'; // API関数をインポート

const Profile = () => {
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // プロフィール情報を取得
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getProfile();
        setUsername(profileData.username);
        setNickname(profileData.nickname);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // 入力バリデーション
  const isFormValid = username.length >= 5 && /^[a-zA-Z0-9]+$/.test(username) && nickname.length >= 4;

  // プロフィール更新処理
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ username, nickname });
      navigate('/select'); // 更新成功時に選択画面に戻る
    } catch (error) {
      console.error('Error:', error.message);  // デバッグ用
      if (error.message.includes('409')) {
        setError('The username is already taken.');
      } else {
        setError('Failed to update profile.');
      }
    }
  };

  return (
    <div className="profile-container">
      <h2>プロフィール設定</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleUpdateProfile}>
        <div>
          <label>ユーザーネーム:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>ニックネーム:</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={!isFormValid}>更新</button>
      </form>
    </div>
  );
};

export default Profile;
