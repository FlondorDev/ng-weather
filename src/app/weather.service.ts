import {inject, Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';
import {LocationActions, LocationService} from './location.service';
import {Store} from './store';
import {CacheService} from './cache.service';
import {switchMap, tap} from 'rxjs/operators';

export enum WeatherActions {
    Add,
    Remove
}

@Injectable()
export class WeatherService {

    static URL = 'https://api.openweathermap.org/data/2.5';
    static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
    static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
    readonly currentConditions = new Store<ConditionsAndZip[], WeatherActions>([]);

    private cacheService = inject(CacheService);

    constructor(private http: HttpClient, private locationService: LocationService) {
        this.locationService.locations.getValue().forEach(zipCode => {
            this.addCurrentConditions(zipCode);
        });

        this.locationService.locations.getUpdates().subscribe(([prev, curr]) => {
            switch (curr.action) {
                case LocationActions.Add:
                    this.addCurrentConditions(curr.state[curr.state.length - 1]);
                    break;
                case LocationActions.Remove:
                    const removedLocation = prev.state.find(oldState => !curr.state.includes(oldState));
                    this.removeCurrentConditions(removedLocation);
                    break;
            }
            return true;
        });
    }


    addCurrentConditions(zipcode: string): void {
        // Here we make a request to get the current conditions data from the API.
        // Note the use of backticks and an expression to insert the zipcode
        const url = `${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`;
        this.cacheService.getCachedDataObs<CurrentConditions>(url, this.http.get<CurrentConditions>(url)).subscribe(data => {
            this.currentConditions.update(conditions => [...conditions, {
                zip: zipcode,
                data
            }], WeatherActions.Add)
        });
    }

    removeCurrentConditions(zipcode: string) {
        this.currentConditions.update(conditions => {
            const index = conditions.findIndex(t => t.zip === zipcode);
            conditions.splice(index, 1);
            return [...conditions];
        }, WeatherActions.Remove)
    }

    getForecast(zipcode: string): Observable<Forecast> {
        // Here we make a request to get the forecast data from the API.
        // Note the use of backticks and an expression to insert the zipcode
        const url = `${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`;
        return this.cacheService.getCachedDataObs<Forecast>(url, this.http.get<Forecast>(url));
    }

    getWeatherIcon(id): string {
        if (id >= 200 && id <= 232) {
            return WeatherService.ICON_URL + 'art_storm.png';
        } else if (id >= 501 && id <= 511) {
            return WeatherService.ICON_URL + 'art_rain.png';
        } else if (id === 500 || (id >= 520 && id <= 531)) {
            return WeatherService.ICON_URL + 'art_light_rain.png';
        } else if (id >= 600 && id <= 622) {
            return WeatherService.ICON_URL + 'art_snow.png';
        } else if (id >= 801 && id <= 804) {
            return WeatherService.ICON_URL + 'art_clouds.png';
        } else if (id === 741 || id === 761) {
            return WeatherService.ICON_URL + 'art_fog.png';
        } else {
            return WeatherService.ICON_URL + 'art_clear.png';
        }
    }

}
