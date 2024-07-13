import {Component, Inject} from '@angular/core';
import {LocationService} from '../location.service';
import {CacheService, CACHETIMER} from '../cache.service';

@Component({
    selector: 'app-zipcode-entry',
    templateUrl: './zipcode-entry.component.html'
})
export class ZipcodeEntryComponent {

    constructor(private service: LocationService, public cacheService: CacheService) {
    }

    addLocation(zipcode: string) {
        if (zipcode !== '') {
            this.service.addLocation(zipcode);
        }
    }

}
