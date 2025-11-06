import axios from 'axios';
import userModel from '../models/user_model.js';

// Telegram utility function
export const sendTelegramMessage = async (chatId, message) => {
  try {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.warn('Telegram bot token not configured');
      return null;
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      },
      { timeout: 5000 }
    );
    
    console.log(`Telegram message sent to ${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Telegram message failed:', {
      chatId,
      error: error.response?.data || error.message
    });
    return null;
  }
};

// Register Telegram chat ID
export const registerTelegram = async (req, res) => {
  try {
    const { telegramChatId } = req.body;
    
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { telegramChatId },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Telegram chat ID registered successfully',
      user: {
        _id: user._id,
        name: user.name,
        telegramChatId: user.telegramChatId
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Test Telegram connection
export const testTelegram = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    
    if (!user.telegramChatId) {
      return res.status(400).json({ 
        message: 'Telegram chat ID not registered. Please register your chat ID first.' 
      });
    }

    const testMessage = `🤖 Test message from TaskFlow\n\n✅ Your Telegram is successfully connected!\n\nYou will receive:\n• Task assignments\n• Deadline reminders\n• Workload notifications\n• AI redistribution alerts`;
    
    const result = await sendTelegramMessage(user.telegramChatId, testMessage);
    
    if (result) {
      res.json({
        success: true,
        message: 'Test message sent successfully! Check your Telegram.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test message. Please check your chat ID.'
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Test failed', 
      error: error.message 
    });
  }
};