import {AfterViewInit, Component, effect, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {WeatherActions, WeatherService} from '../weather.service';
import {LocationService} from '../location.service';
import {Router} from '@angular/router';
import {TabsComponent, TabTemplate} from '../tabs/tabs.component';
import {ConditionsAndZip} from '../conditions-and-zip.type';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-current-conditions',
    templateUrl: './current-conditions.component.html',
    styleUrls: ['./current-conditions.component.css']
})
export class CurrentConditionsComponent implements OnInit {

    @ViewChild(TabsComponent, {static: true}) tabComponent: TabsComponent;
    @ViewChild('locationTemplate', {static: true}) locationTemplate: TemplateRef<any>;
    protected weatherService = inject(WeatherService);
    private router = inject(Router);
    protected locationService = inject(LocationService);

    constructor() {
        this.weatherService.currentConditions.getUpdates()
            .pipe(takeUntilDestroyed())
            .subscribe(([_prev, current]) => {
                switch (current.action) {
                    case WeatherActions.Add:
                        const location = current.state[current.state.length - 1];
                        this.createAndAddTemplate(location);
                        break;
                    default:
                        break;
                }
            });
    }

    ngOnInit() {
        this.weatherService.currentConditions.getValue().forEach((location, i) => {
            this.createAndAddTemplate(location);
        });
    }

    createAndAddTemplate(location: ConditionsAndZip) {
        const tabTemplate: TabTemplate = {
            template: this.locationTemplate,
            title: `${location.data.name} (${location.zip})`,
            context: location
        }
        this.tabComponent.addTemplate(tabTemplate);
        return tabTemplate;
    }


    showForecast(zipcode: string) {
        this.router.navigate(['/forecast', zipcode])
    }
}
