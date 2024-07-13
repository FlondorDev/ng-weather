import {Inject, Injectable, InjectionToken, signal} from '@angular/core';
import {Observable, of} from 'rxjs';

import {tap} from 'rxjs/operators';

export interface CachedData<T> {
    data: T,
    savedAt: number
}

export const CACHETIMER = new InjectionToken<number>('cache.timer.ms');

@Injectable({
    providedIn: 'root'
})
export class CacheService {

    private _cacheTimer = signal(2 * 60 * 60 * 1000);

    constructor() {
    }

    get cacheTimer() {
        return this._cacheTimer.asReadonly();
    }

    updateCacheTimer(time: number): void {
        this._cacheTimer.set(time);
    }

    getCachedData<T>(key: string, initialValue: T): T {
        const cachedData: CachedData<T> | null = JSON.parse(localStorage.getItem(key));
        if (cachedData) {
            const now = Date.now();
            if (cachedData.savedAt + this.cacheTimer() > now) {
                return cachedData.data;
            }
            localStorage.removeItem(key);
        }
        this.setCachedData(key, initialValue);
        return initialValue;
    }

    getCachedDataObs<T>(key: string, initialValue: Observable<T>): Observable<T> {
        const cachedData: CachedData<T> | null = JSON.parse(localStorage.getItem(key));
        if (cachedData) {
            const now = Date.now();
            if (cachedData.savedAt + this.cacheTimer() > now) {
                return of(cachedData.data);
            }
            localStorage.removeItem(key);
        }
        return initialValue.pipe(tap(value => this.setCachedData(key, value)));
    }

    private setCachedData<T>(key: string, value: T) {
        const data: CachedData<T> = {
            data: value,
            savedAt: Date.now(),
        }
        localStorage.setItem(key, JSON.stringify(data));
    }


}
