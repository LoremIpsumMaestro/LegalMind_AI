import { Router } from 'express';
import { register, login, refreshToken } from '../controllers/authController';
import {
  validateRegistration,
  validateLogin,
  validateRefreshToken
} from '../middleware/validation';

const router = Router();

// Registration route with validation
router.post('/register', validateRegistration, register);

// Login route with validation
router.post('/login', validateLogin, login);

// Refresh token route with validation
router.post('/refresh-token', validateRefreshToken, refreshToken);

export default router;
