import { Challenge } from './challenge';
import { Achievement } from '../../../models/achievement';
import { GameEvent } from '../../../models/game-event';
import { Game } from '../../../models/game';
import { DungeonInfo } from '../../../models/dungeon-info';

declare var parseCardsText;

export class BossVictory implements Challenge {

	private achievementId: string;
	private bossId: string;
	private bossDbfId: number;

	constructor(achievementId: string, bossId: string, bossDbfId: number) {
		this.achievementId = achievementId;
		this.bossId = bossId;
		this.bossDbfId = bossDbfId;
	}

	public detect(gameEvent: GameEvent, callback: Function) {
		if (!gameEvent.data || gameEvent.data.length == 0) {
			return;
		}

		if (gameEvent.type === GameEvent.GAME_RESULT) {
			this.detectGameResultEvent(gameEvent, callback);
			return;
		}
		// In case we miss the game start / end event, we check the info from memory
		else if (gameEvent.type === GameEvent.MAYBE_DUNGEON_INFO_PICK) {
			this.inspectMemory(gameEvent, callback);
			return;
		}
	}

	private detectGameResultEvent(gameEvent: GameEvent, callback: Function) {
		if (gameEvent.data[0] === 'WINNER') {
			let winner = gameEvent.data[1];
			let game: Game = gameEvent.data[2];

			if (!game.matchInfo) {
				return;
			}

			if (game.matchInfo.OpposingPlayer.CardId === this.bossId && game.matchInfo.LocalPlayer.Id === winner.Id) {
				// console.log('Achievement unlocked!', this.achievementId, this.bossId);
				callback();
			}
		}
	}

	private inspectMemory(gameEvent: GameEvent, callback: Function) {
		let dungeonInfo: DungeonInfo = gameEvent.data[0];
		dungeonInfo.DefeatedBosses.forEach((cardId) => {
			if (cardId === this.bossDbfId) {
				callback();
				return;
			}
		});
	}

	public achieve(): Achievement {
		let achievement: Achievement = new Achievement(this.achievementId, 'boss_victory');
		let card = parseCardsText.getCard(this.bossId);
		achievement.icon = `https://s3.amazonaws.com/com.zerotoheroes/plugins/hearthstone/cardart/256x/${this.bossId}.jpg`;
		achievement.order = card.health / 10;
		achievement.title = "Another one bites the dust: " + card.name;
		achievement.name = card.name;
		achievement.htmlTooltip = `
			<img src="https://s3.amazonaws.com/com.zerotoheroes/plugins/hearthstone/fullcards/en/256/${this.bossId}.png" />
		`
		return achievement;
	}
}