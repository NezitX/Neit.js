const { Client } = require('discord.js');

module.exports = class NeitClient {
  constructor(options) {
    this.options = options;
    this.client = null;

    this.#connect(this.options);
  }

  #connect(options) {
    this.client = new Client({
  intents: options.intents,
  partials: options.partials/*[
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ]*/,
  presence: options.presence/*{
    activities: [{
      name: "Battle!",
      type: 0
    }],
    status: 'dnd'
  }*/
});

    
    this.client.login(options.token);
  }

  onMessage() {
    this.client.on("messageCreate",
      async (message) => {
        if (message.author.bot) return;
        await require("./loader.js")(message, this);
    });
  }
}