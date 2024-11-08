// 認証API - ログイン
export const login = async (username, password) => {
    const response = await fetch('http://localhost:8085/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    return data.token;
  };
  
  // 認証API - ログアウト
  export const logout = async () => {
    const response = await fetch('http://localhost:8085/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Logout failed');
  };
  
  // プロフィール取得API
  export const getProfile = async () => {
    const response = await fetch('http://localhost:8085/api/users/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
  };
  
  // プロフィール更新API
  export const updateProfile = async (profileData) => {
    const response = await fetch('http://localhost:8085/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) {
      if (response.status === 409) throw new Error('409 Conflict');
      throw new Error('Failed to update profile');
    }
  };
  
  // フィールド取得API
  export const getField = async (level) => {
    const response = await fetch(`http://localhost:8085/api/fields?level=${level}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch field');
    
    const data = await response.json();
    return data.objects;  // objects配列を返す
  };
  
  // 結果一覧取得API
  export const getResults = async (level) => {
    const response = await fetch(`http://localhost:8085/api/results?level=${level}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch results');
    return await response.json();
  };
  
  // 結果投稿API
  export const postResult = async (resultData) => {
    const response = await fetch('http://localhost:8085/api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
      },
      body: JSON.stringify(resultData)
    });
    if (!response.ok) throw new Error('Failed to post result');
    return await response.json();
  };
  