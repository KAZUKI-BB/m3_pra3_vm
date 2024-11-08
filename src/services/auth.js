export const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:8085/api/auth/login', {  // APIエンドポイント
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const data = await response.json();
      return data.token; // トークンを返す
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };
  