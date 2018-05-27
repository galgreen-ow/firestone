import { Component } from '@angular/core';

import * as Raven from 'raven-js';

import { CollectionManager } from '../services/collection/collection-manager.service';
import { PackMonitor } from '../services/collection/pack-monitor.service';
import { AchievementsMonitor } from '../services/achievement/achievements-monitor.service';
import { DebugService } from '../services/debug.service';
import { LogStatusService } from '../services/log-status.service';
import { HsPublicEventsListener } from '../services/hs-public-events-listener.service';
import { Events } from '../services/events.service';

const HEARTHSTONE_GAME_ID = 9898;

declare var overwolf: any;
declare var ga: any;

@Component({
	selector: 'zh-app',
	styleUrls: [`../../css/component/app.component.scss`],
	template: `
		<div>
		</div>
	`,
})
// 7.1.1.17994
export class AppComponent {

	private static readonly STATES = ['INIT', 'STREAMING_LOGS', 'READY'];
	private static readonly LOADING_SCREEN_DURATION = 10000;

	private currentState = 'INIT';
	private loadingWindowId: string;

	constructor(
		private packMonitor: PackMonitor,
		private events: Events,
		private debugService: DebugService,
		private collectionManager: CollectionManager,
		private publicEventsListener: HsPublicEventsListener,
		private achievementsMonitor: AchievementsMonitor,
		private logStatusService: LogStatusService) {

		this.events.on(Events.STREAMING_LOG_FILE)
			.subscribe(event => {
				this.currentState = 'STREAMING_LOGS';
			});

		// console.error('TODO: stay logged in to HH');
		// console.error('TODO: log in to Hearthhead when game not started - wait until game started to sync');

		overwolf.settings.registerHotKey(
			"collection",
			(result) => {
				console.log('hotkey pressed', result)
				if (result.status === 'success') {
					this.startApp(() => this.showCollectionWindow());
				}
				else {
					console.log('could not trigger hotkey', result, this.currentState);
				}
			}
		)

		overwolf.windows.obtainDeclaredWindow("LoadingScreen", (result) => {
			this.loadingWindowId = result.window.id;
			overwolf.games.onGameInfoUpdated.addListener((res: any) => {
				if (this.exitGame(res)) {
					this.closeApp();
				}
				else if (this.gameRunning(res.gameInfo)) {
					this.showLoadingScreen();
				}
			});


			overwolf.windows.obtainDeclaredWindow("CollectionWindow", (result) => {
				if (result.status !== 'success') {
					console.warn('Could not get CollectionWindow', result);
					return;
				}
				overwolf.windows.restore(result.window.id, (result2) => {
					overwolf.windows.hide(result.window.id);

					this.startApp();

					overwolf.extensions.onAppLaunchTriggered.addListener((result) => {
						this.startApp(() => this.showCollectionWindow());
						// this.startApp(() => this.showWelcomePage());
					})

					ga('send', 'event', 'toast', 'start-app');
				})
			});
		});

	}

	private showLoadingScreen() {
		overwolf.windows.restore(this.loadingWindowId, (result) => {
			setTimeout(() => {
				this.waitForLogDetection();
			},
			AppComponent.LOADING_SCREEN_DURATION);
		});
	}

	private waitForLogDetection() {
		if (this.currentState == 'STREAMING_LOGS') {
			this.currentState = 'READY';
			overwolf.windows.sendMessage(this.loadingWindowId, 'ready', 'ready', (result) => {
			});
		}
		else {
			setTimeout(() => {
				this.waitForLogDetection();
			},
			1000);
		}
	}

	private startApp(showWhenStarted?: Function) {
		overwolf.games.getRunningGameInfo((res: any) => {
			console.log('running game info', res);
			if (res && res.isRunning && res.id && Math.floor(res.id / 10) === HEARTHSTONE_GAME_ID) {
				if (showWhenStarted && this.currentState == 'READY') {
					showWhenStarted();
				}
			}
			else {
				this.showWelcomePage();
			}
		});
	}

	private showWelcomePage() {
		console.log('starting from desktop, showing welcome page');
		overwolf.windows.obtainDeclaredWindow("WelcomeWindow", (result) => {
			if (result.status !== 'success') {
				console.warn('Could not get WelcomeWindow', result);
				return;
			}
			console.log('got welcome window', result);

			overwolf.windows.restore(result.window.id, (result) => {
				console.log('WelcomeWindow is on?', result);
			})
		});
	}

	private showCollectionWindow() {
		console.log('showing collection page');
		if (this.currentState != 'READY') {
			console.log('app not ready yet, cannot show collection window', this.currentState);
			return;
		}
		overwolf.windows.obtainDeclaredWindow("CollectionWindow", (result) => {
			if (result.status !== 'success') {
				console.warn('Could not get CollectionWindow', result);
				return;
			}
			console.log('got collection window', result);

			overwolf.windows.restore(result.window.id, (result) => {
				console.log('CollectionWindow is on?', result);
			})
		});
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

	private gameRunning(gameInfo: any): boolean {

		if (!gameInfo) {
			return false;
		}

		if (!gameInfo.isRunning) {
			return false;
		}

		// NOTE: we divide by 10 to get the game class id without it's sequence number
		if (Math.floor(gameInfo.id / 10) !== HEARTHSTONE_GAME_ID) {
			return false;
		}

		console.log("HS running");
		return true;
	}

	private exitGame(gameInfoResult: any): boolean {
		return (!gameInfoResult || !gameInfoResult.gameInfo || !gameInfoResult.gameInfo.isRunning);
	}

	private closeApp() {
		overwolf.windows.getCurrentWindow((result) => {
			if (result.status === "success") {
				console.log('closing');
				overwolf.windows.close(result.window.id);
			}
		});
	}
}
