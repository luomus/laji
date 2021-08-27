import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectFormService } from '../shared/service/project-form.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  template: `<router-outlet></router-outlet>
  <ng-container *ngIf="id$ | async as id">
    <laji-form-builder [id]="id"></laji-form-builder>
  </ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormEditComponent implements OnInit {
  id$: Observable<string>;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private projectFormService: ProjectFormService
  ) {}

  ngOnInit(): void {
    this.id$ = this.projectFormService.getFormFromRoute$(this.route.firstChild.firstChild).pipe(map(form => form.id));
  }
}
