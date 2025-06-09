// Browser Debug Script - Cole no console do navegador
console.log('=== DEBUG AUTENTICAÇÃO ===');

// 1. Verificar token no localStorage
const token = localStorage.getItem('auth_token');
console.log('1. Token localStorage:', token ? 'PRESENTE' : 'AUSENTE');
console.log('Token completo:', token);

// 2. Testar API /auth/me diretamente
async function testAuthMe() {
  try {
    console.log('\n2. Testando /api/auth/me...');
    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Status response:', response.status);
    
    if (response.ok) {
      const user = await response.json();
      console.log('User data recebido:', user);
      console.log('Role específico:', user.role);
      console.log('Tipo do role:', typeof user.role);
      console.log('Role === "SUPERUSER":', user.role === 'SUPERUSER');
      
      // 3. Verificar enum UserRole
      console.log('\n3. Verificando enums...');
      // Simular os valores do enum
      const UserRole = {
        SUPERUSER: 'SUPERUSER',
        MARKETING: 'MARKETING', 
        OWNER: 'OWNER',
        USER: 'USER',
        ATHLETE: 'ATHLETE'
      };
      console.log('UserRole.SUPERUSER:', UserRole.SUPERUSER);
      console.log('Comparação user.role === UserRole.SUPERUSER:', user.role === UserRole.SUPERUSER);
      
    } else {
      console.error('Erro na resposta:', await response.text());
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

// 4. Verificar estado do contexto React (se disponível)
function checkReactState() {
  console.log('\n4. Tentando acessar estado React...');
  
  // Tentar acessar componentes React via DevTools
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools detectado');
  }
  
  // Verificar se há algum contexto global exposto
  if (window.authContext) {
    console.log('Auth context global:', window.authContext);
  }
}

// Executar testes
testAuthMe();
checkReactState();

console.log('\n=== FIM DEBUG ===');