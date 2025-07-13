import {
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { battle, Geier } from '../battle/Geier';

const registration = {
  cardSelect: {
    component(playerCards: number[]) {
      const component = new StringSelectMenuBuilder()
        .setCustomId('cardSelect')
        .setPlaceholder('出すカードを選択しようね');
      const menus = playerCards.map((card, index) =>
        new StringSelectMenuOptionBuilder().setLabel(`${card}`).setValue(`${index}`),
      );
      return component.addOptions(menus);
    },
    execute: async (interaction: StringSelectMenuInteraction, geier: Geier) => {
      if (geier.status !== 'selecting') {
        await interaction.deferUpdate();
        return;
      }
      const player = geier.interactionPlayer(interaction);
      if (player === null) {
        await interaction.reply({ content: 'ほ？', flags: MessageFlags.Ephemeral });
        return;
      }
      if (player.isSelected) {
        await interaction.reply({ content: 'もう出してるよ', flags: MessageFlags.Ephemeral });
        return;
      }
      await player.selectCard(interaction);
    },
  },
};

type CustomId = keyof typeof registration;

export const selectMenu = { ...registration };

export const selectMenuInteraction = async (interaction: StringSelectMenuInteraction) => {
  const geier = battle.get(interaction);
  if (geier === null) {
    await interaction.reply({
      content: '`/launch`しようね',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const customId = interaction.customId as CustomId;
  await registration[customId].execute(interaction, geier);
};
