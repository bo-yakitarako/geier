import { ButtonBuilder, ButtonInteraction, ButtonStyle } from 'discord.js';

const registration = {
  join: {
    component: new ButtonBuilder()
      .setCustomId('join')
      .setLabel('参加')
      .setStyle(ButtonStyle.Primary),
    async execute(interaction: ButtonInteraction) {
      await interaction.deferUpdate();
    },
  },
};

type CustomId = keyof typeof registration;

export const buttonInteraction = async (interaction: ButtonInteraction) => {
  const customId = interaction.customId as CustomId;
  await registration[customId].execute(interaction);
};
