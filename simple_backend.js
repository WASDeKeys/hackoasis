const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  console.log(`${req.method} ${path}`);

  if (req.method === 'POST' && path === '/api/auth/register/') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Registration data:', data);
        
        // Simulate successful registration
        const response = {
          token: 'mock_token_' + Date.now(),
          user: {
            id: '1',
            email: data.email,
            username: data.username,
            name: data.username
          }
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'POST' && path === '/api/auth/login/') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Login data:', data);
        
        // Simulate successful login
        const response = {
          token: 'mock_token_' + Date.now(),
          user: {
            id: '1',
            email: data.email,
            username: 'testuser',
            name: 'Test User'
          }
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'GET' && path === '/api/auth/verify/') {
    const response = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      name: 'Test User'
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
  } else if (req.method === 'GET' && path === '/api/user-profile/') {
    const response = {
      id: '1',
      user: {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        name: 'Test User'
      },
      name: 'Test User',
      availability: {},
      equipment: [],
      fatigue_log: []
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
  } else if (req.method === 'PATCH' && path === '/api/user-profile/') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        console.log('Profile update data:', data);
        
        const response = {
          id: '1',
          user: {
            id: '1',
            email: 'test@example.com',
            username: 'testuser',
            name: data.name || 'Test User'
          },
          name: data.name || 'Test User',
          availability: data.availability || {},
          equipment: data.equipment || [],
          fatigue_log: data.fatigue_log || []
        };
        
        res.writeHead(200);
        res.end(JSON.stringify(response));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'GET' && path === '/api/workout-plans/') {
    res.writeHead(200);
    res.end(JSON.stringify([]));
  } else if (req.method === 'GET' && path === '/api/workout-sessions/') {
    res.writeHead(200);
    res.end(JSON.stringify([]));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Simple backend server running on http://localhost:${PORT}`);
  console.log('✅ CORS enabled for http://localhost:3000');
  console.log('✅ Ready to handle API requests!');
});
