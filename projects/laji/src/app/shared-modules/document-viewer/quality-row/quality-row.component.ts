import { Component, Input } from '@angular/core';

@Component({
  selector: 'laji-quality-row',
  template: `
    <div class="quality-row">
      <div class="quality-image">
        <img [src]="qualityIcon">
      </div>
      <p class="quality-label">{{quality}}</p>
    </div>
  `,
  styleUrls: ['./quality-row.component.scss']
})

export class QualityRowComponent {
  @Input() quality: string;
  @Input() qualityIcon: string;
}
