import {Inject, Injectable, InjectionToken} from '@angular/core';
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

    constructor(@Inject(CACHETIMER) private cacheTimer: number) {
    }

    getCachedData<T>(key: string, obs: Observable<T>): Observable<T> {
        const cachedData: CachedData<T> | null = JSON.parse(localStorage.getItem(key));
        if (cachedData) {
            const now = Date.now();
            if (cachedData.savedAt + this.cacheTimer > now) {
                return of(cachedData.data);
            }
            localStorage.removeItem(key);
        }
        return obs.pipe(tap(value => this.setCachedData(key, value)));
    }

    private setCachedData<T>(key: string, value: T) {
        const data: CachedData<T> = {
            data: value,
            savedAt: Date.now(),
        }
        localStorage.setItem(key, JSON.stringify(data));
    }


}
