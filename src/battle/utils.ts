import { EmbedBuilder, EmbedField } from 'discord.js';

export function shuffle<T>(array: T[]): T[] {
  let shuffledArray: T[] = [];
  while (array.length > 0) {
    const index = Math.floor(Math.random() * array.length);
    shuffledArray = [...shuffledArray, array[index]];
    array.splice(index, 1);
  }
  return shuffledArray;
}

const EMBED_COLOR = 0x4287f5;

export const buildEmbed = (
  title: string,
  description = '',
  hasGeier = true,
  fields: EmbedField[] = [],
) => {
  const embed = new EmbedBuilder();
  embed.setTitle(title);
  embed.setColor(EMBED_COLOR);
  if (hasGeier) {
    embed.setAuthor({
      name: '私がハゲタカだ',
      iconURL:
        'https://cdn.discordapp.com/avatars/1393709231055569008/ffc08123ed3c0c6bf207ef4241820c05.webp?size=128',
    });
  }
  if (description) {
    embed.setDescription(description);
  }
  if (fields.length > 0) {
    embed.addFields(fields);
  }
  return embed;
};
