import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  MessageFlags,
  TextChannel,
} from 'discord.js';
import { battle, Geier } from '../battle/Geier';

const registration = {
  join: {
    component: new ButtonBuilder()
      .setCustomId('join')
      .setLabel('参加')
      .setStyle(ButtonStyle.Primary),
    async execute(interaction: ButtonInteraction, geier: Geier) {
      await geier.join(interaction);
    },
  },
  start: {
    component: new ButtonBuilder()
      .setCustomId('start')
      .setLabel('ハゲタカはじめよう')
      .setStyle(ButtonStyle.Success),
    async execute(interaction: ButtonInteraction, geier: Geier) {
      await geier.start(interaction);
    },
  },
  selectStart: {
    component: new ButtonBuilder()
      .setCustomId('selectStart')
      .setLabel('出すカードを選択する')
      .setStyle(ButtonStyle.Primary),
    async execute(interaction: ButtonInteraction, geier: Geier) {
      const player = geier.interactionPlayer(interaction);
      if (player === null) {
        await interaction.reply({ content: 'ほ？', flags: MessageFlags.Ephemeral });
        return;
      }
      await player.showSelectMenu(interaction);
    },
  },
  selectSubmit: {
    component: new ButtonBuilder()
      .setCustomId('selectSubmit')
      .setLabel('カードを出すよ')
      .setStyle(ButtonStyle.Primary),
    async execute(interaction: ButtonInteraction, geier: Geier) {
      const player = geier.interactionPlayer(interaction);
      if (player === null) {
        await interaction.reply({ content: 'ほ？', flags: MessageFlags.Ephemeral });
        return;
      }
      await player.submitCard(interaction);
    },
  },
  finish: {
    component: new ButtonBuilder()
      .setCustomId('finish')
      .setLabel('やめる')
      .setStyle(ButtonStyle.Secondary),
    async execute(interaction: ButtonInteraction, geier: Geier) {
      if (geier.status !== 'finished') {
        const content = 'やってるっぽいからやめるのはやめとくわ。強制終了するなら`/reset`でね';
        await interaction.reply({ content, flags: MessageFlags.Ephemeral });
        return;
      }
      await interaction.deferUpdate();
      battle.remove(interaction);
      await (interaction.channel as TextChannel).send(':wave:');
    },
  },
};

type CustomId = keyof typeof registration;

export const button = Object.fromEntries(
  (Object.keys(registration) as CustomId[]).map((id) => [id, registration[id].component] as const),
) as { [key in CustomId]: ButtonBuilder };

export const buttonInteraction = async (interaction: ButtonInteraction) => {
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
