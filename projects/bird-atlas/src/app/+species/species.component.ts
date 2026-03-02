import { Component } from '@angular/core';

@Component({
    template: `
<div class="container mb-6">
  <router-outlet></router-outlet>
</div>
`,
    standalone: false
})
export class SpeciesComponent {}
