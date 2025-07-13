import {
  Interaction,
  type OmitPartialGroupDMChannel,
  type Message as DiscordMessage,
  ButtonInteraction,
  TextChannel,
  ActionRowBuilder,
  ButtonBuilder,
  MessageFlags,
  EmbedField,
} from 'discord.js';
import { Player } from './Player';
import { buildEmbed, shuffle } from './utils';
import { button } from '../components/buttons';

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

type GameStatus = 'ready' | 'selecting' | 'submitted' | 'finished';

export class Geier {
  private players: Player[] = [];
  /**
   * -5～10までのカードだけど0だけ無い15枚のデッキだよ
   */
  private geierDeck: number[] = [];
  private currentGeierCard = 0;
  private gameStatus: GameStatus = 'ready';

  public get status() {
    return this.gameStatus;
  }

  public async join(interaction: ButtonInteraction) {
    await interaction.deferUpdate();
    if (!(interaction.channel instanceof TextChannel)) {
      return;
    }
    if (this.status !== 'ready') {
      await interaction.reply({ content: '終わるまで待ってね', flags: MessageFlags.Ephemeral });
      return;
    }
    const player = new Player(interaction, this);
    this.players = [...this.players, player];
    await interaction.channel.send(`${player.name} 参戦:exclamation::exclamation::exclamation:`);
  }

  public async start(interaction: ButtonInteraction) {
    if (this.status !== 'ready' && this.status !== 'finished') {
      await interaction.deferUpdate();
      return;
    }
    if (this.players.length < 2) {
      await interaction.reply({ content: '2人いないとなー', flags: MessageFlags.Ephemeral });
      return;
    }
    await interaction.deferUpdate();
    this.generateGeierDeck();
    this.players.forEach((player) => player.ready());
    await this.readyForPlaying(interaction);
  }

  private generateGeierDeck() {
    const minusCards = [...Array(5).keys()].map((i) => i - 5);
    const plusCards = [...Array(10).keys()].map((i) => i + 1);
    this.geierDeck = shuffle([...minusCards, ...plusCards]);
  }

  private async readyForPlaying(interaction: ButtonInteraction) {
    this.gameStatus = 'selecting';
    this.currentGeierCard = this.geierDeck.splice(0, 1)[0];
    const time = 15 - this.geierDeck.length;
    const embed = buildEmbed(`${time}回戦のカード`, `**${this.currentGeierCard}**`);
    await (interaction.channel as TextChannel).send({
      embeds: [embed],
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button.selectStart)],
    });
  }

  public interactionPlayer(interaction: Interaction) {
    return this.players.find((player) => player.id === interaction.user.id) ?? null;
  }

  public async tryToNext(interaction: ButtonInteraction) {
    if (!this.players.every((p) => p.isSelected)) {
      return;
    }
    this.gameStatus = 'submitted';
    const winner = this.calculateWinner();
    if (winner !== null) {
      winner.obtainGeierCard(this.currentGeierCard);
    }
    let embeds = [this.buildResultEmbed(winner)];
    this.players.forEach((p) => p.resetSelect(winner !== null));
    if (this.isFinished()) {
      this.gameStatus = 'finished';
      embeds = [...embeds, this.buildRankingEmbed()];
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button.start, button.finish);
      await (interaction.channel as TextChannel).send({ embeds });
      const content =
        'おつかれ～\nもう一回やりたかったら開始ボタンを押してね\nやめる場合はやめといてくれるとありがたいのだ';
      await (interaction.channel as TextChannel).send({ content, components: [row] });
      return;
    }
    embeds = [...embeds, this.buildPlayerScoresEmbed()];
    await (interaction.channel as TextChannel).send({ embeds });
    if (winner === null) {
      const content = `このハゲタカは山札に戻してシャッフルすんぞ。${15 - this.geierDeck.length}回戦やり直しね`;
      this.geierDeck = shuffle([...this.geierDeck, this.currentGeierCard]);
      await (interaction.channel as TextChannel).send(content);
    }
    await this.readyForPlaying(interaction);
  }

  private calculateWinner() {
    const validNumbers = this.selectValidNumbers(this.players.map((p) => p.currentNumber));
    if (validNumbers.length === 0) {
      return null;
    }
    const winningNumber = validNumbers.reduce((pre, cur) => {
      if (this.currentGeierCard < 0) {
        return pre > cur ? cur : pre;
      }
      return pre < cur ? cur : pre;
    }, validNumbers[0]);
    return this.players.find((p) => p.currentNumber === winningNumber)!;
  }

  private selectValidNumbers(numbers: number[]) {
    return numbers.filter((n, i, array) =>
      [...array.slice(0, i), ...array.slice(i + 1)].every((m) => m !== n),
    );
  }

  private buildResultEmbed(winner: Player | null) {
    const time = 15 - this.geierDeck.length;
    const title = `${time}回戦(カード: ${this.currentGeierCard})の結果`;
    const playerCards = this.players.map(({ name, currentNumber }) => ({
      name,
      value: `${currentNumber}`,
      inline: true,
    }));
    let winnerInfo = '';
    if (winner !== null) {
      winnerInfo = `「**${winner.currentNumber}**」を出した**${winner.name}**がハゲタカを獲得だぁ！`;
    } else {
      winnerInfo = '全員ダダ被りだから誰にもハゲタカはあげませーん';
    }
    return buildEmbed(title, winnerInfo, undefined, playerCards);
  }

  private buildPlayerScoresEmbed() {
    const playerScores: EmbedField[] = this.players.map((p) => {
      const name = `${p.name}(合計: ${p.score})`;
      const value = p.resultGeiterCards();
      return { name, value, inline: false };
    });
    return buildEmbed('みんなのハゲタカ', undefined, false, playerScores);
  }

  private isFinished() {
    if (this.geierDeck.length === 0) {
      return true;
    }
    if (this.geierDeck.length === 1) {
      const remainingNumbers = this.players.map((p) => p.remainingNumber);
      return this.selectValidNumbers(remainingNumbers).length === 0;
    }
    return false;
  }

  private buildRankingEmbed() {
    const rankPlayers = [...this.players].sort((a, b) => b.score - a.score);
    const description = `優勝は**${rankPlayers[0].score}点**の**${rankPlayers[0].name}**だぁ:exclamation:`;
    const rankFields: EmbedField[] = rankPlayers.map((p, i) => ({
      name: `${i + 1}位: ${p.name} (${p.score}点)`,
      value: p.resultGeiterCards(),
      inline: false,
    }));
    return buildEmbed('けっかはっぴょぉ～～～～～', description, false, rankFields);
  }
}
