import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    template: `
<h1>Trait search</h1>
<p>Browse, search and download trait data published on the FinBIF Trait Database.</p>
<laji-trait-search></laji-trait-search>
`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TraitDbBrowseComponent {
}

