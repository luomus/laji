import { AfterViewInit, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'laji-theme-form',
  templateUrl: './theme-form.component.html',
  styleUrls: ['./theme-form.component.css']
})
export class ThemeFormComponent implements AfterViewInit, OnChanges {

  @Input() formId;
  @Input() documentId;
  @Input() donePath;
  @Input() tmpPath;

  constructor() { }

  ngAfterViewInit() {
  }

  ngOnChanges() {
  }
}
