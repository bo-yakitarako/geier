import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

const registration = {
  launch: {
    data: new SlashCommandBuilder().setName('launch').setDescription('はげたか～ん'),
    execute: async (interaction: ChatInputCommandInteraction) => {
      await interaction.reply('ping');
    },
  },
  reset: {
    data: new SlashCommandBuilder().setName('reset').setDescription('はげたかんもここまでか'),
    execute: async (interaction: ChatInputCommandInteraction) => {
      await interaction.reply('pon');
    },
  },
};

type CommandName = keyof typeof registration;

export const commands = Object.values(registration).map(({ data }) => data.toJSON());
export const slashCommandsInteraction = async (interaction: ChatInputCommandInteraction) => {
  const commandName = interaction.commandName as CommandName;
  await registration[commandName].execute(interaction);
};
