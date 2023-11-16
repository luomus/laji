import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

@Component({
  template: `{{ content }}`,
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipComponent {
  private _content = '';
  get content() {
    return this._content;
  }
  set content(s: string) {
    this._content = s;
    this.cdr.detectChanges();
  }
  constructor(private cdr: ChangeDetectorRef) {}
}
