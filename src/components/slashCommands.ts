import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  TextChannel,
} from 'discord.js';
import { battle } from '../battle/Geier';
import { button } from './buttons';

const registration = {
  launch: {
    data: new SlashCommandBuilder().setName('launch').setDescription('はげたか～ん'),
    execute: async (interaction: ChatInputCommandInteraction) => {
      battle.create(interaction);
      await interaction.reply({
        content: '人が集まったらこのボタンで始めよう',
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button.start)],
        flags: MessageFlags.Ephemeral,
      });
      await (interaction.channel as TextChannel).send({
        content: 'やったー！ハゲタカの時間だぁー！',
        components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button.join)],
      });
    },
  },
  reset: {
    data: new SlashCommandBuilder().setName('reset').setDescription('はげたかんもここまでか'),
    execute: async (interaction: ChatInputCommandInteraction) => {
      battle.remove(interaction);
      await interaction.reply(':wave:');
    },
  },
};

type CommandName = keyof typeof registration;

export const commands = Object.values(registration).map(({ data }) => data.toJSON());
export const slashCommandsInteraction = async (interaction: ChatInputCommandInteraction) => {
  if (!(interaction.channel instanceof TextChannel)) {
    await interaction.reply({ content: 'ほ？', flags: MessageFlags.Ephemeral });
    return;
  }
  const commandName = interaction.commandName as CommandName;
  await registration[commandName].execute(interaction);
};
