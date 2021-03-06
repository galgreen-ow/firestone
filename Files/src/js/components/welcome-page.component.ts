import { Component, ViewEncapsulation, HostListener, AfterViewInit } from '@angular/core';

import { DebugService } from '../services/debug.service';
import { CollectionManager } from '../services/collection/collection-manager.service';

const HEARTHSTONE_GAME_ID = 9898;

declare var overwolf: any;
declare var Crate: any;

@Component({
	selector: 'welcome-page',
	styleUrls: [
		`../../css/global/components-global.scss`,
		`../../css/component/welcome-page.component.scss`
	],
	encapsulation: ViewEncapsulation.None,
	template: `
		<div class="root">
			<div class="app-container">
				<section class="menu-bar">
					<i class="i-117X33 gold-theme logo">
						<svg class="svg-icon-fill">
							<use xlink:href="/Files/assets/svg/sprite.svg#logo"/>
						</svg>
					</i>
					<div class="controls">
						<!-- <button class="i-30 pink-button" (click)="showSettings()">
							<svg class="svg-icon-fill">
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/Files/assets/svg/sprite.svg#window-control_settings"></use>
							</svg>
						</button> -->
						<button class="i-30 pink-button" (click)="contactSupport()">
							<svg class="svg-icon-fill">
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/Files/assets/svg/sprite.svg#window-control_support"></use>
							</svg>
						</button>
						<button class="i-30 pink-button" (click)="minimizeWindow()">
							<svg class="svg-icon-fill">
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/Files/assets/svg/sprite.svg#window-control_minimize"></use>
							</svg>
						</button>
						<button class="i-30 close-button" (click)="closeWindow(true)">
							<svg class="svg-icon-fill">
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/Files/assets/svg/sprite.svg#window-control_close"></use>
							</svg>
						</button>
					</div>
				</section>
				<home-screen-info-text></home-screen-info-text>
				<app-choice (close)="closeWindow(false)"></app-choice>
				<social-media></social-media>
				<version></version>
			</div>

			<i class="i-54 gold-theme corner top-left">
				<svg class="svg-icon-fill">
					<use xlink:href="/Files/assets/svg/sprite.svg#golden_corner"/>
				</svg>
			</i>
			<i class="i-54 gold-theme corner top-right">
				<svg class="svg-icon-fill">
					<use xlink:href="/Files/assets/svg/sprite.svg#golden_corner"/>
				</svg>
			</i>
			<i class="i-54 gold-theme corner bottom-right">
				<svg class="svg-icon-fill">
					<use xlink:href="/Files/assets/svg/sprite.svg#golden_corner"/>
				</svg>
			</i>
			<i class="i-54 gold-theme corner bottom-left">
				<svg class="svg-icon-fill">
					<use xlink:href="/Files/assets/svg/sprite.svg#golden_corner"/>
				</svg>
			</i>
		</div>
	`,
})
// 7.1.1.17994
export class WelcomePageComponent implements AfterViewInit {

	// private emptyCollection = false;
	private thisWindowId: string;
	private crate;

	constructor(private debugService: DebugService, private collectionManager: CollectionManager) {
		// this.collectionManager.getCollection((collection) => {
		// 	console.log('loaded collection', collection);
		// 	if (!collection || collection.length == 0) {
		// 		this.emptyCollection = true;
		// 	}
		// })

		overwolf.windows.getCurrentWindow((result) => {
			if (result.status === "success"){
				this.thisWindowId = result.window.id;
			}
		});
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.crate = new Crate({
				server:"187101197767933952",
				channel:"446045705392357376"
			});
			this.crate.store.subscribe(() => {
				if (this.crate.store.getState().visible && !this.crate.store.getState().open) {
					this.crate.hide();
				}
			});
			this.crate.hide();
		}, 100);
	}

	@HostListener('mousedown', ['$event'])
	dragMove(event: MouseEvent) {
		overwolf.windows.dragMove(this.thisWindowId);
	};

	closeWindow(quitApp: boolean) {
		// If game is not running, we close all other windows
		overwolf.games.getRunningGameInfo((res: any) => {
			console.log('running game info', res);
			if (quitApp && !(res && res.isRunning && res.id && Math.floor(res.id / 10) === HEARTHSTONE_GAME_ID)) {
				overwolf.windows.getOpenWindows((openWindows) => {
					for (let windowName in openWindows) {
						overwolf.windows.obtainDeclaredWindow(windowName, (result) => {
							if (result.status !== 'success') {
								return;
							}
							overwolf.windows.close(result.window.id, (result) => {
							})
						});
					}
				})
			}
			else {
				overwolf.windows.hide(this.thisWindowId);
			}
		});
	};

	minimizeWindow() {
		overwolf.windows.minimize(this.thisWindowId);
	};

	contactSupport() {
		let crate = new Crate({
			server:"187101197767933952",
			channel:"446045705392357376"
		});
		crate.toggle(true);
		crate.store.subscribe(() => {
			if (crate.store.getState().visible && !crate.store.getState().open) {
				crate.hide();
			}
		})
	}
}
