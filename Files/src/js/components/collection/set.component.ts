import { Component, NgZone, Input, SimpleChanges } from '@angular/core';

import * as Raven from 'raven-js';

import { Card } from '../../models/card';
import { Set, SetCard } from '../../models/set';

declare var overwolf: any;

@Component({
	selector: 'set-view',
	styleUrls: [`../../../css/component/collection/set.component.scss`],
	template: `
		<div *ngIf="_cardSet" class="set">
			<div class="logo-container">
				<img src="{{'/Files/assets/images/sets/' + _cardSet.id + '.png'}}" class="set-logo" />
				<span class="text set-name" *ngIf="_displayName">{{_cardSet.name}}</span>
			</div>
			<span class="cards-collected">{{_cardSet.ownedLimitCollectibleCards}}/{{collectibleLimit()}}</span>
			<div class="frame complete-simple" *ngIf="isSimpleComplete() && !isPremiumComplete()">
				<i class="i-15 pale-gold-theme corner bottom-left">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#common_set_corner"/>
					</svg>
				</i>
				<i class="i-15 pale-gold-theme corner top-left">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#common_set_corner"/>
					</svg>
				</i>
				<i class="i-15 pale-gold-theme corner top-right">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#common_set_corner"/>
					</svg>
				</i>
				<i class="i-15 pale-gold-theme corner bottom-right">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#common_set_corner"/>
					</svg>
				</i>
			</div>
			<div class="frame complete-premium" *ngIf="isPremiumComplete()">
				<div class="outer-border"></div>

				<i class="i-22X30 gold-theme corner bottom-left">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#two_gold_leaves"/>
					</svg>
				</i>

				<i class="i-22X30 gold-theme corner top-left">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#two_gold_leaves"/>
					</svg>
				</i>

				<i class="i-22X30 gold-theme corner top-right">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#two_gold_leaves"/>
					</svg>
				</i>

				<i class="i-22X30 gold-theme corner bottom-right">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#two_gold_leaves"/>
					</svg>
				</i>

				<div class="crown">
					<i class="i-20X10 gold-theme">
						<svg class="svg-icon-fill">
							<use xlink:href="/Files/assets/svg/sprite.svg#three_gold_leaves"/>
						</svg>
					</i>
				</div>
			</div>
		</div>
	`,
})
// 7.1.1.17994
export class SetComponent {

	@Input() private maxCards: number;

	private _cardSet: Set;
	private _displayName = false;

	@Input('cardSet') set cardSet(set: Set) {
		this._cardSet = set;
		console.log('setting set', set, set.name)
		if (['Basic', 'Classic', 'Hall of Fame'].indexOf(set.name) > -1) {
			this._displayName = true;
		}
	}

	private isSimpleComplete() {
		return this._cardSet.ownedLimitCollectibleCards == Set.numberOfLimitCollectibleCards(this._cardSet)
	}

	private isPremiumComplete() {
		return this._cardSet.ownedLimitCollectiblePremiumCards == Set.numberOfLimitCollectibleCards(this._cardSet)
	}

	private collectibleLimit() {
		return Set.numberOfLimitCollectibleCards(this._cardSet);
	}
}
