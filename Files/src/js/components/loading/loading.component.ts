import { Component, ViewEncapsulation, ElementRef, HostListener } from '@angular/core';

import { DebugService } from '../../services/debug.service';

import * as Raven from 'raven-js';

const HEARTHSTONE_GAME_ID = 9898;

declare var overwolf: any;
declare var Crate: any;

@Component({
	selector: 'loading',
	styleUrls: [
		`../../../css/global/components-global.scss`,
		`../../../css/component/loading/loading.component.scss`
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
				<section class="content-container">
					<div class="app-title">
						<i class="i-35 gold-theme left">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#title_decor"/>
							</svg>
						</i>
						<span class="title">{{title}}</span>
						<i class="i-35 gold-theme right">
							<svg class="svg-icon-fill">
								<use xlink:href="/Files/assets/svg/sprite.svg#title_decor"/>
							</svg>
						</i>
					</div>
					<span class="sub-title">Placeholder sub status</span>
				</section>
				<div class="ads-container">

				</div>
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
export class LoadingComponent {

	private title: string = 'Getting ready';
	private thisWindowId: string;

	constructor(private debugService: DebugService, private elRef: ElementRef) {
		overwolf.windows.getCurrentWindow((result) => {
			if (result.status === "success"){
				this.thisWindowId = result.window.id;
			}
		});

		this.positionWindow();
	}


	private positionWindow() {
		overwolf.games.getRunningGameInfo((gameInfo) => {
			let gameWidth = gameInfo.logicalWidth;
			let gameHeight = gameInfo.logicalHeight;
			let dpi = gameWidth / gameInfo.width;
			console.log('logical info', gameWidth, gameHeight, dpi);
			let newLeft = ~~(gameWidth * 0.2);
			let newTop = ~~(gameHeight * 0.1);
			overwolf.windows.changePosition(this.thisWindowId, newLeft, newTop, (changePosition) => {
				console.log('changed window position');
			});
		});
	}


	@HostListener('mousedown', ['$event'])
	private dragMove(event: MouseEvent) {
		overwolf.windows.dragMove(this.thisWindowId);
	};

	private closeWindow(quitApp: boolean) {
		// If game is not running, we close all other windows
		overwolf.games.getRunningGameInfo((res: any) => {
			overwolf.windows.close(this.thisWindowId);
		});
	};

	private minimizeWindow() {
		overwolf.windows.minimize(this.thisWindowId);
	};

	private contactSupport() {
		let crate = new Crate({
			server:"187101197767933952",
			channel:"446045705392357376"
		});
		crate.on('toggle', open => {
			if (!open) {
				crate.hide();
			}
		})
	}

}
