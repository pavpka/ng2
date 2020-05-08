import { Injectable, OnDestroy } from '@angular/core';
import { Disposable } from '../infrastructure/disposable';
import { DomTable } from '../dom/dom';
import { Event } from '@qgrid/core/event/event';
import { GridLet } from '@qgrid/core/grid/grid.let';
import { GridLet as NgxGridLet } from '../grid/grid-let';
import { GridModel } from '../grid/grid-model';
import { GridRoot } from '../grid/grid-root';
import { ObservableLike } from '@qgrid/core/infrastructure/rx';

@Injectable()
export class GridPlugin implements OnDestroy {
	readonly disposable = new Disposable();

	readonly observe = <TState>(event: Event<TState>) => {
		return new ObservableLike(event, false, this.disposable);
	}

	readonly observeReply = <TState>(event: Event<TState>) => {
		return new ObservableLike(event, true, this.disposable);
	}

	constructor(
		private $view: NgxGridLet,
		private $root: GridRoot,
	) { }

	get model(): GridModel {
		const { model } = this.$root;
		return model;
	}

	get view(): GridLet {
		return this.$view;
	}

	get table(): DomTable {
		const { table } = this.$root;
		return table;
	}

	ngOnDestroy() {
		this.disposable.finalize();
	}
}
