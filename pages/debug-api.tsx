import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';

const DebugApiPage: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [envInfo, setEnvInfo] = useState<any>(null);

  useEffect(() => {
    // Set environment info only on client side
    setEnvInfo({
      hasToken: !!localStorage.getItem('auth_token'),
      tokenLength: localStorage.getItem('auth_token')?.length,
      currentUrl: window.location.href,
    });
  }, []);

  const testUsersApi = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      console.log(
        'Token:',
        token ? `${token.substring(0, 20)}...` : 'No token'
      );

      const response = await fetch('/api/users?page=1&limit=5', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      setResponse({
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
    } catch (error) {
      console.error('Error:', error);
      setResponse({
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuthMe = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setResponse({
        endpoint: '/api/auth/me',
        status: response.status,
        data: data,
      });
    } catch (error) {
      setResponse({
        endpoint: '/api/auth/me',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1>Debug API</h1>

        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={testAuthMe}
            disabled={loading}
            style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
          >
            Test /api/auth/me
          </button>

          <button
            onClick={testUsersApi}
            disabled={loading}
            style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
          >
            Test /api/users
          </button>
        </div>

        {loading && <p>Loading...</p>}

        {response && (
          <div>
            <h2>Response:</h2>
            <pre
              style={{
                background: '#f0f0f0',
                padding: '1rem',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap',
                maxHeight: '400px',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <h2>Environment Info:</h2>
          <pre
            style={{
              background: '#f0f0f0',
              padding: '1rem',
              borderRadius: '4px',
            }}
          >
            {envInfo ? JSON.stringify(envInfo, null, 2) : 'Loading...'}
          </pre>
        </div>
      </div>
    </Layout>
  );
};

export default DebugApiPage;
