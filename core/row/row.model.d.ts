import {Resource} from '../resource/resource';

export declare type SingleOrMultipleMode = 'single' | 'multiple';
export declare type  DataOrDetailsUnit = 'data' | 'details';

export declare class RowModel {
	constructor();

	resource: Resource;
	mode: SingleOrMultipleMode;
	unit: DataOrDetailsUnit;
	height: (element: HTMLElement, index: number) => number | number;
    status: Map<any, any>;
    canDrag: boolean;
    canResize: boolean;
}
