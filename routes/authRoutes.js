import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Root auth route - show available endpoints
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Authentication API',
    endpoints: {
      register: {
        method: 'POST',
        path: '/api/v1/auth/register',
        description: 'Register a new user',
        body: {
          name: 'string',
          email: 'string',
          password: 'string'
        }
      },
      login: {
        method: 'POST',
        path: '/api/v1/auth/login',
        description: 'Login user',
        body: {
          email: 'string',
          password: 'string'
        }
      },
      profile: {
        method: 'GET',
        path: '/api/v1/auth/me',
        description: 'Get user profile (protected)',
        headers: {
          Authorization: 'Bearer <token>'
        }
      },
      updateProfile: {
        method: 'PUT',
        path: '/api/v1/auth/profile',
        description: 'Update user profile (protected)',
        headers: {
          Authorization: 'Bearer <token>'
        },
        body: {
          name: 'string (optional)',
          email: 'string (optional)'
        }
      },
      forgotPassword: {
        method: 'POST',
        path: '/api/v1/auth/forgotpassword',
        description: 'Request password reset link',
        body: {
          email: 'string'
        }
      },
      resetPassword: {
        method: 'PUT',
        path: '/api/v1/auth/resetpassword/:resettoken',
        description: 'Reset password with token',
        params: {
          resettoken: 'string (from email link)'
        },
        body: {
          password: 'string'
        }
      }
    }
  });
});

// Auth endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

export default router;