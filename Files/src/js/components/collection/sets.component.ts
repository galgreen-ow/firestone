import { Component, NgZone, OnInit, Input } from '@angular/core';

import * as Raven from 'raven-js';

import { CollectionManager } from '../../services/collection/collection-manager.service';
import { AllCardsService } from '../../services/all-cards.service';
import { Events } from '../../services/events.service';

import { Card } from '../../models/card';
import { Collection } from '../../models/collection';
import { Set, SetCard } from '../../models/set';

declare var overwolf: any;

@Component({
	selector: 'sets',
	styleUrls: [
		`../../../css/component/collection/sets.component.scss`,
		`../../../css/global/scrollbar.scss`
	],
	template: `
		<div class="sets">
			<sets-container [sets]="standardSets" [category]="'Standard'" *ngIf="showStandard"></sets-container>
			<sets-container [sets]="wildSets" [category]="'Wild'" *ngIf="showWild"></sets-container>
		</div>
	`,
})
// 7.1.1.17994
export class SetsComponent {

	private showStandard = true;
	private showWild = true;

	private standardSets: Set[];
	private wildSets: Set[];
	private selectedSet: Set;

	private refreshing = false;

	constructor(private _events: Events, private collectionManager: CollectionManager, private cards: AllCardsService) {
		overwolf.windows.onStateChanged.addListener((message) => {
			if (message.window_name != "CollectionWindow") {
				return;
			}
			console.log('state changed sets', message);
			if (message.window_state == 'normal') {
				this.refreshContents();
			}
		});
		this.refreshContents();
	}

	@Input('selectedFormat') set selectedFormat(format: string) {
		// console.log('showing selected format', format);
		switch (format) {
			case 'standard':
				this.showStandard = true;
				this.showWild = false;
				break;
			case 'wild':
				this.showStandard = false;
				this.showWild = true;
				break;
			default:
				this.showStandard = true;
				this.showWild = true;
		}
	}

	refreshContents() {
		if (this.refreshing) {
			return;
		}
		this.refreshing = true;
		this.collectionManager.getMergedCollection((collection: Collection) => {
			this.standardSets = collection.allSets.filter(s => s.standard);
			this.wildSets = collection.allSets.filter(s => !s.standard);

		})
	}
}
