import {signal, WritableSignal} from '@angular/core';
import {Subject} from 'rxjs';
import {toObservable} from '@angular/core/rxjs-interop';
import {pairwise} from 'rxjs/operators';

type ReducerFn<T> = (state: T) => T;

export class Store<T, U> {
    private state: WritableSignal<T>;
    private latestUpdate: WritableSignal<{
        action: U | number,
        state: T
    }>;

    constructor(initialState: T) {
        this.state = signal(initialState);
        this.latestUpdate = signal({
            action: null,
            state: initialState
        });
    }

    getValue() {
        return this.state();
    }

    getState() {
        return this.state.asReadonly();
    }

    getLatestUpdates() {
        return this.latestUpdate.asReadonly();
    }

    getUpdates() {
        return toObservable(this.latestUpdate).pipe(pairwise());
    }

    update(reducer: ReducerFn<T>, action: U) {
        this.state.update(reducer);
        this.latestUpdate.set({
            action,
            state: this.getValue(),
        });
    }

}
