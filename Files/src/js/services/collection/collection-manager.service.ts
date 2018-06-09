import { Injectable } from '@angular/core';

import * as Raven from 'raven-js';

import { Card } from '../../models/card';
import { Collection } from '../../models/collection';
import { Set, SetCard } from '../../models/set';
import { MemoryInspectionService } from '../plugins/memory-inspection.service';
import { AllCardsService } from '../all-cards.service';
import { IndexedDbService } from './indexed-db.service';

declare var OverwolfPlugin: any;
declare var overwolf: any;

@Injectable()
export class CollectionManager {
	plugin: any;
	mindvisionPlugin: any;

	private cachedCollection: Collection;

	constructor(private mindVision: MemoryInspectionService, private db: IndexedDbService, private cards: AllCardsService) {
	}

	public getMergedCollection(callback: Function) {
		if (!this.cachedCollection) {
			this.updateMergedCollection((collection) => {
				this.cachedCollection = collection;
				callback(collection);
			})
		}
		else {
			callback(this.cachedCollection);
		}
	}

	public getCollection(callback: Function) {
		// console.log('getting collection');
		this.mindVision.getCollection((collection) => {
			// console.log('collection from mindvision');
			if (!collection) {
				// console.log('retrieving collection from db', collection);
				this.db.getCollection((collection) => {
					// console.log('retrieved collection form db', collection);
					callback(collection);
				});
			}
			else {
				// console.log('saving mindvision collection');
				this.db.saveCollection(collection, callback);
			}
		})
	}

	public inCollection(collection: Card[], cardId: string, type: string): Card {
		for (let card of collection) {
			if (card.Id === cardId && this.isCorrectPremium(card.Premium, type)) {
				return card;
			}
		}
		return null;
	}

	private updateMergedCollection(callback: Function) {
		let standardSets = this.cards.getStandardSets();
		let wildSets = this.cards.getWildSets();
		// console.log('sets', this.standardSets, this.wildSets);

		this.getCollection((collection: Card[]) => {
			// Add the number of owned cards on each card in the standard set
			standardSets.forEach((standardSet: Set) => {
				this.updateSet(collection, standardSet);
			})
			wildSets.forEach((standardSet: Set) => {
				this.updateSet(collection, standardSet);
			})
			let allSets = standardSets.concat(wildSets);
			console.log('all sets', allSets);
			let mergedCollection = new Collection();
			mergedCollection.allSets = allSets;
			this.db.saveMergedCollection(mergedCollection, (result) => {
				console.log('merged collection updated', mergedCollection);
				callback(mergedCollection);
			})
		})
	}

	private isCorrectPremium(premium: boolean, type: string): boolean {
		return (!premium && type === 'NORMAL') || (premium && type === 'GOLDEN');
	}

	private updateSet(collection: Card[], set: Set) {
		set.allCards.forEach((card: SetCard) => {
			let owned = collection.filter((collectionCard: Card) => collectionCard.Id === card.id);
			owned.forEach((collectionCard: Card) => {
				if (collectionCard.Premium) {
					card.ownedPremium = collectionCard.Count;
				}
				else {
					card.ownedNonPremium = collectionCard.Count;
				}
			})
		})

		set.ownedLimitCollectibleCards = set.allCards.map((card: SetCard) => SetCard.getNumberCollected(card)).reduce((c1, c2) => c1 + c2, 0);
		set.ownedLimitCollectiblePremiumCards = set.allCards.map((card: SetCard) => SetCard.getNumberCollectedPremium(card)).reduce((c1, c2) => c1 + c2, 0);
	}
}
