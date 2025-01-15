import { useEffect, useCallback } from 'react';

export function useTokenRefresh() {
  const refreshToken = async () => {
    const token = localStorage.getItem('refreshToken');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/api/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: token }),
      });

      if (response.ok) {
        const { tokens } = await response.json();
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
      } else {
        // If refresh fails, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  };

  const scheduleRefresh = useCallback(() => {
    // Schedule refresh 5 minutes before token expiry
    const tokenRefreshInterval = 55 * 60 * 1000; // 55 minutes
    return setInterval(refreshToken, tokenRefreshInterval);
  }, []);

  useEffect(() => {
    const intervalId = scheduleRefresh();
    return () => clearInterval(intervalId);
  }, [scheduleRefresh]);

  return refreshToken;
}
