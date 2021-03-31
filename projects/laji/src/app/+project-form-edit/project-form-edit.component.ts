import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  template: `<router-outlet></router-outlet><laji-form-builder [id]="id"></laji-form-builder>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormEditComponent implements OnInit {
  id = 'JX.519';
  ngOnInit(): void {
    console.log('INIT');
  }
}
