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
export class TabsComponent {

    private _selectedTemplate: WritableSignal<TabTemplate | null> = signal(null);
    private _templates: WritableSignal<TabTemplate[]> = signal([]);
    @Output() deleteTabEvent: EventEmitter<TabTemplate> = new EventEmitter();

    get selectedTemplate() {
        return this._selectedTemplate.asReadonly();
    }

    get templates() {
        return this._templates.asReadonly();
    }

    constructor() {
    }

    private selectFirstTemplate() {
        this.selectTemplate(0);
    }

    addTemplate(tabTemplate: TabTemplate) {
        this._templates.update(templates => [...templates, tabTemplate]);
        if (!this.selectedTemplate()) {
            this.selectFirstTemplate();
        }
    }

    deleteTemplate(index: number) {
        this._templates.update(templates => {
            const deleted = templates.splice(index, 1).pop();
            if (this.selectedTemplate() === deleted) {
                this._selectedTemplate.set(null);
                this.selectFirstTemplate();
            }
            this.deleteTabEvent.emit(deleted);
            return [...templates];
        });
    }

    clearTemplates() {
        this._templates.set([]);
        this._selectedTemplate.set(null);
    }

    selectTemplate(index: number) {
        this._selectedTemplate.set(this.templates()[index]);
    }

}
