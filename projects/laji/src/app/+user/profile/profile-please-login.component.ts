import { Component } from '@angular/core';

@Component({
  template: `
    <div class="container">
      <alert type="warning" style="padding-top: 20px">
        {{ 'user.pleaseLogin' | translate }}
      </alert>
    </div>
  `
})
export class ProfilePleaseLoginComponent {
}
