import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  changePassword
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
      forgotPassword: {
        method: 'POST',
        path: '/api/v1/auth/forgot-password',
        description: 'Request password reset',
        body: {
          email: 'string'
        }
      },
      resetPassword: {
        method: 'POST',
        path: '/api/v1/auth/reset-password/:resetToken',
        description: 'Reset password using token',
        body: {
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
      }
    }
  });
});

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

export default router;