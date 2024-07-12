import {
    AfterViewInit,
    Component,
    EventEmitter, OnDestroy,
    Output, QueryList,
    signal,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewContainerRef,
    WritableSignal
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

export interface TabTemplate {
    title: string,
    template: TemplateRef<any>,
    context: any
}

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements AfterViewInit {

    private _selectedTemplate: WritableSignal<TabTemplate | null> = signal(null);
    private _templates: WritableSignal<TabTemplate[]> = signal([]);
    @ViewChildren('container', {read: ViewContainerRef}) private containerRef: QueryList<ViewContainerRef>;
    @Output() deleteTabEvent: EventEmitter<TabTemplate> = new EventEmitter();

    get selectedTemplate() {
        return this._selectedTemplate.asReadonly();
    }

    get templates() {
        return this._templates.asReadonly();
    }

    constructor() {
    }

    ngAfterViewInit() {
        this.selectFirstTemplate();
        this.containerRef.changes.subscribe(() => {
            this.selectFirstTemplate();
        });
    }

    private selectFirstTemplate() {
        this.selectTemplate(this.templates()[0]);
    }

    addTemplate(tabTemplate: TabTemplate) {
        this._templates.update(templates => [...templates, tabTemplate]);
    }

    deleteTemplate(tabTemplate: TabTemplate) {
        this._templates.update(templates => {
            const index = templates.findIndex(t => t === tabTemplate);
            if (index !== -1) {
                templates.splice(index, 1);
                if (this.selectedTemplate() === tabTemplate) {
                    this._selectedTemplate.set(null);
                    if (templates.length > 0) {
                        this.selectTemplate(templates[0]);
                    } else {
                        this.containerRef.first.clear();
                    }
                }
                this.deleteTabEvent.emit(tabTemplate);
            }
            return templates;
        });
    }

    clearTemplates() {
        this.containerRef.first?.clear();
        this._templates.set([]);
    }

    selectTemplate(tabTemplate: TabTemplate) {
        this._selectedTemplate.set(tabTemplate);
        this.containerRef.first?.clear();
        this.containerRef.first?.createEmbeddedView(tabTemplate.template, {$implicit: tabTemplate.context});
    }

}
