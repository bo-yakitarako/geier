import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  Interaction,
  MessageFlags,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from 'discord.js';
import { Geier } from './Geier';
import { selectMenu } from '../components/selectMenus';
import { button } from '../components/buttons';

const { cardSelect } = selectMenu;

export class Player {
  private discordId: string;
  private displayName: string;
  private geier: Geier;
  private numberCards: number[] = [];
  private selectedNumberIndex: number | null = null;
  private isSubmitted = false;
  private geierCards: number[] = [];

  constructor(interaction: Interaction, geier: Geier) {
    this.discordId = interaction.user.id;
    this.displayName = Player.displayName(interaction);
    this.geier = geier;
  }

  public get id() {
    return this.discordId;
  }

  public get name() {
    return this.displayName;
  }

  public get currentNumber() {
    if (this.selectedNumberIndex === null) {
      return 0;
    }
    return this.numberCards[this.selectedNumberIndex];
  }

  public static displayName({ guild, user }: Interaction) {
    return guild?.members.cache.get(user.id)?.displayName ?? user.displayName;
  }

  public ready() {
    this.numberCards = [...Array(15).keys()].map((i) => i + 1);
    this.selectedNumberIndex = null;
    this.isSubmitted = false;
    this.geierCards = [];
  }

  public get score() {
    return this.geierCards.reduce((acc, card) => acc + card, 0);
  }

  public async showSelectMenu(interaction: ButtonInteraction) {
    if (this.geier.status !== 'selecting') {
      await interaction.deferUpdate();
      return;
    }
    const select = cardSelect.component(this.numberCards);
    const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button.selectSubmit);
    await interaction.reply({
      content: 'カードを選んでヤツらに目に物を見せてやろうぜ',
      components: [selectRow, buttonRow],
      flags: MessageFlags.Ephemeral,
    });
  }

  public async selectCard(interaction: StringSelectMenuInteraction) {
    this.selectedNumberIndex = Number(interaction.values[0]);
    await interaction.deferUpdate();
  }

  public async submitCard(interaction: ButtonInteraction) {
    if (this.isSubmitted) {
      await interaction.reply({ content: 'もう出してるよ', flags: MessageFlags.Ephemeral });
      return;
    }
    if (this.selectedNumberIndex === null) {
      await interaction.reply({ content: 'カードを選んでくれ', flags: MessageFlags.Ephemeral });
      return;
    }
    if (this.geier.status !== 'selecting') {
      await interaction.deferUpdate();
      return;
    }
    this.isSubmitted = true;
    const content = `${this.currentNumber}だねーおっけー`;
    await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    await this.geier.tryToNext(interaction);
  }

  public get isSelected() {
    return this.isSubmitted;
  }

  public resetSelect(hasWinner: boolean) {
    if (hasWinner) {
      this.numberCards = [
        ...this.numberCards.slice(0, this.selectedNumberIndex!),
        ...this.numberCards.slice(this.selectedNumberIndex! + 1),
      ];
    }
    this.selectedNumberIndex = null;
    this.isSubmitted = false;
  }

  public obtainGeierCard(geierCard: number) {
    this.geierCards = [...this.geierCards, geierCard];
  }

  public resultGeiterCards() {
    return this.geierCards.sort((a, b) => a - b).join(' / ');
  }

  public get remainingNumber() {
    return this.numberCards[0];
  }
}
