import {
  Interaction,
  type OmitPartialGroupDMChannel,
  type Message as DiscordMessage,
} from 'discord.js';

type Message = OmitPartialGroupDMChannel<DiscordMessage<boolean>>;

const servers = {} as { [key in string]: Geier };
export const battle = {
  get({ guildId }: Interaction | Message) {
    if (guildId !== null && guildId in servers) {
      return servers[guildId];
    }
    return null;
  },
  create({ guildId }: Interaction | Message) {
    if (guildId === null) {
      return null;
    }
    servers[guildId] = new Geier();
    return servers[guildId];
  },
  remove({ guildId }: Interaction | Message) {
    if (guildId === null) {
      return;
    }
    delete servers[guildId];
  },
};

export class Geier {}
