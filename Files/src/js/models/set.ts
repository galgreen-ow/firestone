export class Set {
	id: string;
	name: string;
	standard: boolean;
	allCards: SetCard[] = [];

	ownedLimitCollectibleCards = 0;
	ownedLimitCollectiblePremiumCards = 0;

	constructor(id?: string, name?: string, isStandard?: boolean) {
		this.id = id;
		this.name = name;
		this.standard = isStandard;
	}

	public static numberOfLimitCollectibleCards(set: Set): number {
		let totalCards = 0;
		set.allCards.forEach((card: SetCard) => {
			totalCards += card.rarity.toLowerCase() === 'legendary' ? 1 : 2;
		})
		return totalCards;
	}

	public static ownedForRarity(set: Set, rarity: string): number {
		return set.allCards
			.filter((card) => card.rarity.toLowerCase() === rarity)
			.map((card: SetCard) => SetCard.getNumberCollected(card))
			.reduce((c1, c2) => c1 + c2, 0);
	}

	public static totalForRarity(set: Set, rarity: string): number {
		return set.allCards
			.filter((card) => card.rarity.toLowerCase() === rarity)
			.map((card: SetCard) => SetCard.getMaxCollectible(card))
			.reduce((c1, c2) => c1 + c2, 0);
	}

	// public static missingCards(set: Set, rarity?: string): MissingCard[] {
	// 	return set.allCards
	// 		.filter((card) => !rarity || card.rarity.toLowerCase() === rarity)
	// 		.filter((card) => SetCard.getNumberCollected(card) < SetCard.getMaxCollectible(card))
	// 		.map(c => {
	// 			let newC: any = new SetCard(c.id, c.name, c.rarity);
	// 			newC.ownedPremium = c.ownedPremium;
	// 			newC.ownedNonPremium = c.ownedNonPremium;
	// 			switch (newC.rarity.toLowerCase()) {
	// 				case ('common'):
	// 					newC.sort = 'a';
	// 					break;
	// 				case ('rare'):
	// 					newC.sort = 'b';
	// 					break;
	// 				case ('epic'):
	// 					newC.sort = 'c';
	// 					break;
	// 				case ('legendary'):
	// 					newC.sort = 'd';
	// 					break;
	// 			}
	// 			return newC;
	// 		})
	// 		.sort((c1, c2) => {
	// 			if (c1.name > c2.name) {
	// 		        return 1;
	// 		    }

	// 		    if (c1.name < c2.name) {
	// 		        return -1;
	// 		    }

	// 		    return 0;
	// 		})
	// 		.sort((c1, c2) => {
	// 			if (c1.sort > c2.sort) {
	// 		        return 1;
	// 		    }

	// 		    if (c1.sort < c2.sort) {
	// 		        return -1;
	// 		    }

	// 		    return 0;
	// 		})
	// 		.map((card: any) => new MissingCard(card.id, card.name, SetCard.getNumberCollected(card), SetCard.getMaxCollectible(card)));
	// }
}

export class SetCard {
	id: string;
	name: string;
	rarity: string;
	ownedNonPremium = 0;
	ownedPremium = 0;

	constructor(id?: string, name?: string, rarity?: string) {
		this.id = id;
		this.name = name;
		this.rarity = rarity;
	}

	public static getNumberCollected(card: SetCard): number {
		return ~~Math.min(card.ownedPremium + card.ownedNonPremium, SetCard.getMaxCollectible(card));
	}

	public static getNumberCollectedPremium(card: SetCard): number {
		return ~~Math.min(card.ownedPremium, SetCard.getMaxCollectible(card));
	}

	public static getMaxCollectible(card: SetCard): number {
		return card.rarity.toLowerCase() === 'legendary' ? 1 : 2;
	}

	public static isOwned(card: SetCard): boolean {
		return card.ownedPremium + card.ownedNonPremium > 0;
	}
}

// export class MissingCard {
// 	id: string;
// 	name: string;
// 	collected: number;
// 	maxCollectible: number;

// 	constructor(id: string, name: string, collected: number, maxCollectible: number) {
// 		this.id = id;
// 		this.name = name;
// 		this.collected = collected;
// 		this.maxCollectible = maxCollectible;
// 	}
// }
