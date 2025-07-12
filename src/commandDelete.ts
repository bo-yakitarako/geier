import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';

config();

const TOKEN = process.env.TOKEN as string;
const CLIENT_ID = process.env.CLIENT_ID as string;
const GUILD_ID = process.env.GUILD_ID ?? null;
(async () => {
  const rest = new REST({ version: '10' }).setToken(TOKEN);
  try {
    if (GUILD_ID !== null) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: [] });
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
    }
    console.log('バイバイはげたかコマンドくん');
  } catch (error) {
    console.error(error);
  }
})();
