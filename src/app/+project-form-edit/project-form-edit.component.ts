import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  template: `<router-outlet></router-outlet><laji-form-builder [id]="id">:DDDD</laji-form-builder>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormEditComponent implements OnInit {
  id = 'MHL.3';
  ngOnInit(): void {
    console.log('INIT');
  }
}
