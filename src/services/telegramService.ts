import api from './api';

interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export const sendTelegramNotification = async (message: string) => {
  try {
    const response = await api.get('/settings/telegram');
    const config = response.data as TelegramConfig;
    
    if (!config.enabled || !config.botToken || !config.chatId) {
      console.warn("Telegram Notification skipped: Config disabled or incomplete.");
      return;
    }

    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    
    const telegramResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json().catch(() => ({}));
      console.error("Telegram API Error:", errorData);
    }
  } catch (error: any) {
    console.error("Telegram Notification Error:", error.message);
  }
};
