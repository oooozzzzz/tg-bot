const TeleramBot = require("node-telegram-bot-api");
const { gameOptions, againOptions, startOptions } = require("./options");
const token = "7151593956:AAF4E0dP7DbrtVL7mBbawaFULBI6t3SZ1pM";

const bot = new TeleramBot(token, { polling: true });

bot.setMyCommands([
	{ command: "/start", description: "Начальное приветствие" },
]);

const numbers = {};

const updateRandomNumber = (chatId) => {
	const randomNumber = Math.floor(Math.random() * 10);
	numbers[chatId] = randomNumber;
	return randomNumber;
};

const invalidReply = (chatId) => {
	bot.sendMessage(
		chatId,
		"Браточек, у меня вообще то есть команды. Попробуй использовать их. \nЕсли что, они доступны в <b>меню</b>",
		{ parse_mode: "HTML" }
	);
};

const startGame = async (chatId) => {
	updateRandomNumber(chatId);
	await bot.sendMessage(chatId, "Отгадывай", gameOptions);
};

const start = () => {
	bot.on("message", async (msg) => {
		const chatId = msg.chat.id;
		if (msg.text === "/start") {
			bot.deleteMessage(chatId, msg.message_id);
			await bot.sendMessage(
				chatId,
				`Привет, ${msg.from.first_name}. Я хочу поиграть с тобой в небольшую игру. Правила просты: я загадываю число от 1 до 10, а ты его отгадываешь)`,
				startOptions
			);
		} else {
			invalidReply(chatId);
		}
	});

	bot.on("callback_query", async (msg) => {
		console.log(msg);
		let text;
		const chatId = msg.message.chat.id;

		const number = numbers[chatId];

		switch (msg.data) {
			case "/again":
				startGame(chatId);
				break;

			case "/game":
				startGame(chatId);
				break;

			case "/finish":
				bot.sendMessage(
					chatId,
					"Спасибо за игру. Если захочешь снова попытать удачу, нажми команду /start"
				);
				break;

			default:
				if (msg.data === number.toString()) {
					text = `Молодец! Ты угадал. Я загадал число ${number}`;
				} else {
					text = `Увы. Я загадал число ${number}, а ты тыкнул кнопку ${msg.data}`;
				}
				await bot.sendMessage(chatId, text, againOptions);

				break;
		}

		await bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
		await bot.answerCallbackQuery(msg.id);
	});
};

start();
