import { Component } from '@angular/core';

@Component({
    template: `
    <div class="container">
      <lu-alert type="warning" style="padding-top: 20px" *lajiBrowserOnly>
        {{ 'user.pleaseLogin' | translate }}
      </lu-alert>
    </div>
  `,
    standalone: false
})
export class ProfilePleaseLoginComponent {
}
