import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'laji-info-page-loading',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <lu-ghost-paragraph [length]="10"></lu-ghost-paragraph>
    <lu-ghost-paragraph [length]="300"></lu-ghost-paragraph>
    <lu-ghost-paragraph [length]="200"></lu-ghost-paragraph>
`,
    standalone: false
})
export class InfoPageLoadingComponent {}
