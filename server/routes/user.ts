import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/user/profile
router.get('/profile', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await db.findUserById(req.userId!);
    if (!user) {
      res.status(404).json({ message: 'User profile not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ message: 'Name cannot be empty' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ message: 'Valid email address is required' });
      return;
    }

    const existingEmailUser = await db.findUserByEmail(email);
    if (existingEmailUser && existingEmailUser.id !== req.userId) {
      res.status(400).json({ message: 'Email is already in use by another account' });
      return;
    }

    const updatedUser = await db.updateUser(req.userId!, {
      name: name.trim(),
      email: email.toLowerCase().trim(),
    });

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user profile' });
  }
});

// PUT /api/user/change-password
router.put('/change-password', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'Both current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    const user = await db.findUserById(req.userId!);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await db.updateUser(req.userId!, { passwordHash: newPasswordHash });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
});

export default router;
