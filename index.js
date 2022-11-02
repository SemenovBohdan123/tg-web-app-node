const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5611992026:AAEvf3rmgWO1OaX8zS5Q07kcqP7wu_SR5FU';
const webAppUrl = 'https://magenta-seahorse-0508e1.netlify.app/'

const bot = new TelegramBot(token, { polling: true });
const app = express()

app.use(express.json())
app.use(cors())

bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];


  bot.sendMessage(chatId, resp);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Сделать заказ', web_app: { url: webAppUrl } }]
        ]
      }
    })
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
      reply_markup: {
        keyboard: [
          [{ text: 'Заполнить форму', web_app: { url: `${webAppUrl}form` } }]
        ]
      }
    })
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data)

      await bot.sendMessage(chatId, 'Cпасибо за обратную свзяь!')
      await bot.sendMessage(chatId, `Ваша страна: ${data?.country}`)
      await bot.sendMessage(chatId, `Ваша улица: ${data?.street}`)

      setTimeout(() => {
        bot.sendMessage(chatId, "Всю информаци. вы получите в этом чате")
      }, 3000);
    } catch (error) {
      console.log(error);
    }
  }

  // bot.sendMessage(chatId, 'Received your message');
});
app.post('/web-data', async (req, res) => {
  console.log('here');
  const { queryId, products, totalPrice } = req.body
  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: { message_text: 'Поздравляю с покупкой, вы приобрели товара на суму ' + totalPrice }
    })

    return res.status(200)
  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Не удалось приобрести товар',
      input_message_content: { message_text: 'Не удалось приобрести товар' }
    })
  }

  return res.status(500)
})

const PORT = 8000;

app.listen(PORT, () => console.log("Сервер запущен на PORT " + PORT))
