import React, { useEffect, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import Layout from '../components/layout/Layout';

const DebugAuthPage: React.FC = () => {
  const auth = useAuth();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    setToken(storedToken);
    
    if (storedToken) {
      // Test API call
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
      .then(res => res.json())
      .then(data => setApiResponse(data))
      .catch(err => setApiResponse({ error: err.message }));
    }
  }, []);

  return (
    <Layout>
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1>Debug Auth Status</h1>
        
        <h2>Auth Context:</h2>
        <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify({
            user: auth.user,
            isAuthenticated: auth.isAuthenticated,
            isLoading: auth.isLoading,
            isSuperuser: auth.isSuperuser,
            isMarketing: auth.isMarketing,
            isOwner: auth.isOwner,
            canManageUsers: auth.canManageUsers,
          }, null, 2)}
        </pre>

        <h2>Token:</h2>
        <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
          {token ? `Token exists: ${token.substring(0, 20)}...` : 'No token found'}
        </pre>

        <h2>API Response (/api/auth/me):</h2>
        <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(apiResponse, null, 2)}
        </pre>

        <h2>Actions:</h2>
        <button 
          onClick={() => {
            localStorage.removeItem('auth_token');
            window.location.reload();
          }}
          style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
        >
          Clear Token & Reload
        </button>
        
        <button 
          onClick={() => auth.logout()}
          style={{ margin: '0.5rem', padding: '0.5rem 1rem' }}
        >
          Logout
        </button>
      </div>
    </Layout>
  );
};

export default DebugAuthPage;