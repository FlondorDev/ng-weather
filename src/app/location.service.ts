import {Injectable, signal, WritableSignal} from '@angular/core';
import {Store} from './store';

export const LOCATIONS = 'locations';

export enum LocationActions {
    Add,
    Remove
}

@Injectable()
export class LocationService {

    readonly locations: Store<string[], LocationActions>;

    constructor() {
        const locString = localStorage.getItem(LOCATIONS);
        let state: string[] = [];
        if (locString) {
            state = JSON.parse(locString);
        }
        this.locations = new Store(state);
    }

    addLocation(zipcode: string) {
        this.locations.update(locations => [...locations, zipcode], LocationActions.Add);
        localStorage.setItem(LOCATIONS, JSON.stringify(this.locations.getValue()));
    }

    removeLocation(zipcode: string) {
        const index = this.locations.getValue().indexOf(zipcode);
        if (index !== -1) {
            this.locations.update(locations => {
                locations.splice(index, 1);
                return [...locations]
            }, LocationActions.Remove);
            localStorage.setItem(LOCATIONS, JSON.stringify(this.locations.getValue()));
        }
    }
}
