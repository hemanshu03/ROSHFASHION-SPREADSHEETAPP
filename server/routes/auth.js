import express from 'express';
import bcryptjs from 'bcryptjs';

const router = express.Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD 
  ? bcryptjs.hashSync(process.env.ADMIN_PASSWORD, 10)
  : bcryptjs.hashSync('admin123', 10);

// Middleware to check authentication
export function requireAuth(req, res, next) {
  console.log('[v0] requireAuth middleware - Checking authentication');
  console.log('[v0] requireAuth - Session:', req.session);
  console.log('[v0] requireAuth - Session userId:', req.session.userId);
  
  if (!req.session.userId) {
    console.log('[v0] requireAuth - No session userId found - UNAUTHORIZED');
    return res.status(401).json({ error: 'Unauthorized - No session' });
  }
  console.log('[v0] requireAuth - Auth passed for user:', req.session.username);
  next();
}

router.post('/login', async (req, res) => {
  try {
    console.log('[v0] POST /api/auth/login - Request received');
    const { username, password } = req.body;
    console.log('[v0] Login attempt - Username:', username);
    console.log('[v0] Login attempt - Password provided:', !!password);

    if (!username || !password) {
      console.log('[v0] Login - Missing username or password');
      return res.status(400).json({ error: 'Username and password required' });
    }

    console.log('[v0] Login - Checking username. Expected:', ADMIN_USERNAME, 'Got:', username);
    if (username !== ADMIN_USERNAME) {
      console.log('[v0] Login - Username mismatch - INVALID');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[v0] Login - Comparing passwords');
    const passwordMatch = await bcryptjs.compare(password, ADMIN_PASSWORD_HASH);
    console.log('[v0] Login - Password match result:', passwordMatch);
    
    if (!passwordMatch) {
      console.log('[v0] Login - Password mismatch - INVALID');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    console.log('[v0] Login - Setting session for user:', username);
    req.session.userId = 'admin';
    req.session.username = username;
    console.log('[v0] Login - Session set:', req.session);

    console.log('[v0] Login - Sending success response');
    res.json({
      success: true,
      username: username,
    });
  } catch (error) {
    console.error('[v0] Login error:', error);
    console.error('[v0] Login error stack:', error.stack);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.post('/logout', (req, res) => {
  console.log('[v0] POST /api/auth/logout - Request received');
  console.log('[v0] Logout - Current session:', req.session);
  
  req.session.destroy((err) => {
    if (err) {
      console.error('[v0] Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    console.log('[v0] Logout - Session destroyed successfully');
    res.json({ success: true });
  });
});

router.get('/me', requireAuth, (req, res) => {
  console.log('[v0] GET /api/auth/me - Request received');
  console.log('[v0] Me - Session username:', req.session.username);
  console.log('[v0] Me - Session userId:', req.session.userId);
  
  res.json({
    username: req.session.username,
    userId: req.session.userId,
  });
});

export default router;
