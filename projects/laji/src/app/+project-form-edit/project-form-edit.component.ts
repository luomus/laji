import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  template: `<router-outlet></router-outlet><laji-form-builder [id]="id"></laji-form-builder>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormEditComponent implements OnInit {
  id: string;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.id = this.router.url.match(/\/[^/]+\/([^/]+)?/)?.[1];
  }
}
