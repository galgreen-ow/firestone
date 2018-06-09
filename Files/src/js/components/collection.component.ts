import { Component, NgZone, OnInit, AfterViewInit } from '@angular/core';

import * as Raven from 'raven-js';

import { CollectionManager } from '../services/collection/collection-manager.service';
import { AllCardsService } from '../services/all-cards.service';
import { Events } from '../services/events.service';

import { Card } from '../models/card';
import { Set, SetCard } from '../models/set';

const HEARTHSTONE_GAME_ID = 9898;

declare var overwolf: any;
declare var ga: any;
declare var adsReady: any;
declare var OwAd: any;

@Component({
	selector: 'collection',
	styleUrls: [
		`../../css/component/collection.component.scss`,
	],
	template: `
		<div class="collection">
			<section class="main" [ngClass]="{'divider': _selectedView == 'cards'}">
				<collection-menu
					[displayType]="_menuDisplayType"
					[selectedSet]="_selectedSet"
					[selectedFormat]="_selectedFormat"
					[selectedCardId]="fullCardId"
					[searchString]="searchString">
				</collection-menu>
				<ng-container [ngSwitch]="_selectedView">
					<sets *ngSwitchCase="'sets'" [selectedFormat]="_selectedFormat"></sets>
					<cards *ngSwitchCase="'cards'" [cardList]="_cardList" [set]="_selectedSet" [searchString]="searchString"></cards>
					<full-card *ngSwitchCase="'card-details'" class="full-card" [cardId]="fullCardId"></full-card>
				</ng-container>
			</section>
			<section class="secondary">
				<card-search>Search card</card-search>
				<card-history></card-history>
				<div class="ads-container">
					<div class="no-ads-placeholder">
						<i class="i-117X33 gold-theme logo">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#ad_placeholder"/>
							</svg>
						</i>
					</div>
					<div class="ads" id="ad-div"></div>
				</div>
			</section>
		</div>
	`,
})
// 7.1.1.17994
export class CollectionComponent implements OnInit, AfterViewInit {

	private _menuDisplayType = 'menu';
	private _selectedView = 'sets';
	private _selectedSet: Set;
	private _selectedFormat: string;
	private searchString: string;

	private _cardList: SetCard[];
	private fullCardId: string;
	private windowId: string;
	private adRef;

	constructor(
		private _events: Events,
		private cards: AllCardsService,
		private collectionManager: CollectionManager,
		private ngZone: NgZone) {
		ga('send', 'event', 'collection', 'show');
	}

	ngOnInit() {
		overwolf.windows.onStateChanged.addListener((message) => {
			if (message.window_name != "CollectionWindow") {
				return;
			}
			console.log('state changed in collection', message);
			if (message.window_state != 'normal') {
				console.log('removing ad', message.window_state);
				this.adRef.removeAd();
			}
			else {
				console.log('refreshing ad', message.window_state);
				this.adRef.refreshAd();
			}
		});

		overwolf.windows.getCurrentWindow((result) => {
			if (result.status === "success"){
				this.windowId = result.window.id;
			}
		});

		// console.log('constructing');
		this._events.on(Events.SET_SELECTED).subscribe(
			(data) => {
				this.reset();
				// console.log(`selecting set, showing cards`, data);
				this._menuDisplayType = 'breadcrumbs';
				this._selectedView = 'cards';
				this._selectedSet = data.data[0];
				this._selectedFormat = this._selectedSet.standard ? 'standard' : 'wild';
				this._cardList = this._selectedSet.allCards;
			}
		)

		this._events.on(Events.FORMAT_SELECTED).subscribe(
			(data) => {
				this.reset();
				// console.log(`selecting format in collection`, data);
				this._menuDisplayType = 'breadcrumbs';
				this._selectedView = 'sets';
				this._selectedFormat = data.data[0];
			}
		)

		this._events.on(Events.MODULE_SELECTED).subscribe(
			(data) => {
				this.reset();
				this._menuDisplayType = 'menu';
				this._selectedView = 'sets';
			}
		)

		this._events.on(Events.SHOW_CARDS).subscribe(
			(data) => {
				this.reset();
				this._menuDisplayType = 'breadcrumbs';
				this._selectedView = 'cards';
				this._cardList = data.data[0];
				this.searchString = data.data[1];
			}
		)

		this._events.on(Events.SHOW_CARD_MODAL).subscribe(
			(event) => {
				this.reset();
				this._menuDisplayType = 'breadcrumbs';
				this._selectedView = 'card-details';
				this.fullCardId = event.data[0];
				let newSet = this.cards.getSetFromCardId(this.fullCardId);
				if (!this._selectedSet || this._selectedSet.id != newSet.id) {
					this._selectedSet = this.cards.getSetFromCardId(this.fullCardId);
					this.collectionManager.getCollection((collection: Card[]) => {
						this.updateSet(collection, this._selectedSet);
					})
				}
				this._selectedFormat = this._selectedSet.standard ? 'standard' : 'wild';
			}
		);

		overwolf.windows.onMessageReceived.addListener((message) => {
			console.log('received', message);
			if (message.id === 'click-card') {
				this.ngZone.run(() => {
					this.fullCardId = message.content;
					this._selectedView = 'card-details';
					// console.log('setting fullCardId', this.fullCardId);
					overwolf.windows.restore(this.windowId, (result) => {
						// console.log('collection window restored');
					});
				})
			}
		});
	}

	ngAfterViewInit() {
		console.log('after view init');
	}

	private loadAds() {
		if (!adsReady) {
			setTimeout(() => {
				this.loadAds()
			}, 50);
			return;
		}
		console.log('ads ready', adsReady, document.getElementById("ad-div"));
		this.adRef = new OwAd(document.getElementById("ad-div"));
	}

	private reset() {
		this._menuDisplayType = undefined;
		this._selectedView = undefined;
		this._selectedSet =undefined;
		this._selectedFormat = undefined;
		this._cardList = undefined;
		this.fullCardId = undefined;
	}

	private updateSet(collection: Card[], set: Set) {
		console.log('updating set', set, collection)
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
		console.log('updated set', set);
	}

	private gameLaunched(gameInfoResult: any): boolean {
		if (!gameInfoResult) {
			console.log('No gameInfoResult, returning');
			return false;
		}

		if (!gameInfoResult.gameInfo) {
			console.log('No gameInfoResult.gameInfo, returning');
			return false;
		}

		if (!gameInfoResult.gameInfo.isRunning) {
			console.log('Game not running, returning');
			return false;
		}

		// NOTE: we divide by 10 to get the game class id without it's sequence number
		if (Math.floor(gameInfoResult.gameInfo.id / 10) !== HEARTHSTONE_GAME_ID) {
			console.log('Not HS, returning');
			return false;
		}

		console.log("HS Launched");
		return true;
	}
}
