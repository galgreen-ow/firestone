import { Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';

import { CollectionManager } from '../../services/collection/collection-manager.service';
import { RealTimeNotificationService } from '../../services/real-time-notifications.service';


const HEARTHSTONE_GAME_ID = 9898;

declare var overwolf: any;

@Component({
	selector: 'home-screen-info-text',
	styleUrls: [`../../../css/component/home/home-screen-info-text.component.scss`],
	encapsulation: ViewEncapsulation.None,
	template: `
		<div class="home-screen-info" *ngIf="dataLoaded">
			<div class="app-title">
				<i class="i-35 gold-theme left" *ngIf="!importantAnnouncement">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#title_decor"/>
					</svg>
				</i>
				<span class="title">{{importantAnnouncement ? 'Update ' : 'Welcome to Firestone'}}</span>
				<i class="i-35 gold-theme right" *ngIf="!importantAnnouncement">
					<svg class="svg-icon-fill">
						<use xlink:href="/Files/assets/svg/sprite.svg#title_decor"/>
					</svg>
				</i>
			</div>
			<span class="sub-title" [innerHTML]="status"></span>
			<span class="sub-title sub-title-details" [innerHTML]="statusDetails"></span>
		</div>
	`,
})

export class HomeScreenInfoTextComponent {

	dataLoaded = false;
	importantAnnouncement;
	status: string;
	statusDetails: string;

	private currentNotificationIndex = 0;
	private notifications: any[];


	constructor(private notificationService: RealTimeNotificationService,
				private collectionManager: CollectionManager) {
		setTimeout(() => this.refresh(), 1000);
		overwolf.windows.onStateChanged.addListener((message) => {
			if (message.window_name != "WelcomeWindow") {
				return;
			}
			console.log('state changed home-screen-info', message);
			if (message.window_state == 'normal') {
				this.refreshContents();
			}
		});
		this.refreshContents();
	}

	private refreshContents() {
		overwolf.games.getRunningGameInfo((res: any) => {
			console.log('detecting running game in welcome window', res);
			if (res && res.isRunning && res.id && Math.floor(res.id / 10) === HEARTHSTONE_GAME_ID) {
				this.status = "Firestone now follows your Hearthstone session.";
				this.dataLoaded = true;
			}
			else {
				this.status = "No Hearthstone session detected.";
				this.collectionManager.getCollection((collection) => {
					if (!collection || collection.length == 0) {
						this.status = "Please launch Hearthstone to synchronize your collection.";
						this.statusDetails = null;
					}
					else {
						this.statusDetails = "Choose an ability:";
					}
					this.dataLoaded = true;
				})
			}

		});
	}

	private refresh() {
		this.notifications = this.notificationService.notifications;
		if (this.notifications) {
			for (let i = 0; i < this.notifications.length; i++) {
				let currentNotif = this.notifications[this.currentNotificationIndex];
				console.log('current notif', currentNotif);
				if (currentNotif.important) {
					this.importantAnnouncement = currentNotif.text;
					this.status = this.importantAnnouncement;
				}
			}
		}
	}
}
