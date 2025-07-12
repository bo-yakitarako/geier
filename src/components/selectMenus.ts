import {
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
} from 'discord.js';

const registration = {
  cardSelect: {
    component() {
      const component = new StringSelectMenuBuilder().setCustomId('cardSelect');
      const menus = [...Array(15)].map((_, index) =>
        new StringSelectMenuOptionBuilder().setLabel(`${index + 1}`).setValue(`${index + 1}`),
      );
      return component.addOptions(menus);
    },
    execute: async (interaction: StringSelectMenuInteraction) => {
      await interaction.deferUpdate();
    },
  },
};

type CustomId = keyof typeof registration;

export const selectMenuInteraction = async (interaction: StringSelectMenuInteraction) => {
  const customId = interaction.customId as CustomId;
  await registration[customId].execute(interaction);
};
