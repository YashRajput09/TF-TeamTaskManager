import crypto from 'crypto';
import User from '../models/user_model.js';

// Telegram utility function
export const telegramIntegration = async (req, res) => {
  try {
    const userId = req.user._id; // from your auth middleware

    // Why randomBytes? cryptographically secure random code.
    const token = crypto.randomBytes(4).toString('hex'); // e.g. "a3f9c1d2"

    const user = await User.findByIdAndUpdate(
      userId,
      {
        telegramLinkToken: token,
        telegramLinkTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes validity
      },
      { new: true }
    );

    return res.json({ token: user.telegramLinkToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error generating link token' });
  }
}