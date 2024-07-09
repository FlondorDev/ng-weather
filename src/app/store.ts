import {Signal} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

type ReducerFn<T> = (state: T) => T;

export class Store<T, U> {
    private state$: BehaviorSubject<T>;
    private updates$: Subject<{
        action: U,
        state: T
    }>;

    constructor(initialState: T) {
        this.state$ = new BehaviorSubject(initialState);
        this.updates$ = new Subject();
    }

    getValue(): T {
        return this.state$.getValue();
    }

    getState() {
        return this.state$.asObservable();
    }

    getUpdates() {
        return this.updates$.asObservable();
    }

    update(reducer: ReducerFn<T>, action: U) {
        this.state$.next(reducer(this.getValue()));
        this.updates$.next({
            action,
            state: this.getValue(),
        });
    }

}
