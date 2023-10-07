const NeitClient = require('../src/index.js');
const { GatewayIntentBits, Partials } = require('discord.js');

const bot = new NeitClient({
  token: process.env.token,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ],
  presence: {
    activities: [{
      name: "Test",
      type: 0
    }],
    status: 'dnd'
  }
});

bot.onMessage();