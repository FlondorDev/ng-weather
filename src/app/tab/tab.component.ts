import {Component, EventEmitter, Output, signal, TemplateRef, ViewChild, ViewContainerRef, WritableSignal} from '@angular/core';

export interface TabTemplate {
    title: string,
    template: TemplateRef<any>,
    context: any
}

@Component({
    selector: 'app-tab',
    templateUrl: './tab.component.html',
    styleUrls: ['./tab.component.css']
})
export class TabComponent {

    private _selectedTemplate: WritableSignal<TabTemplate | null> = signal(null);
    private _templates: WritableSignal<TabTemplate[]> = signal([]);
    @ViewChild('container', {static: true, read: ViewContainerRef}) private containerRef: ViewContainerRef;
    @Output() deleteTabEvent: EventEmitter<TabTemplate> = new EventEmitter();

    get selectedTemplate() {
        return this._selectedTemplate.asReadonly();
    }

    get templates() {
        return this._templates.asReadonly();
    }

    constructor() {
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
                    if (templates.length > 0) {
                        this.selectTemplate(templates[templates.length - 1]);
                    } else {
                        this.containerRef.clear();
                    }
                }
                this.deleteTabEvent.emit(tabTemplate);
            }
            return templates;
        });
    }

    clearTemplates() {
        this.containerRef.clear();
        this._templates.set([]);
    }

    selectTemplate(tabTemplate: TabTemplate) {
        this._selectedTemplate.set(tabTemplate);
        this.containerRef.clear();
        this.containerRef.createEmbeddedView(tabTemplate.template, {$implicit: tabTemplate.context});
    }

}
