import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectFormService } from '../shared/service/project-form.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface ViewModel {
  id: string | null;
}

@Component({
  template: `
  <ng-container>
    <router-outlet></router-outlet>
    <ng-container *ngIf="vm$ | async as vm">
      <laji-form-builder [id]="vm.id"></laji-form-builder>
    </ng-container>
  </ng-container>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormEditComponent implements OnInit {
  vm$: Observable<ViewModel>;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private projectFormService: ProjectFormService
  ) {}

  ngOnInit(): void {
    this.vm$ = this.route.firstChild.firstChild
      ? this.projectFormService.getFormFromRoute$(this.route.firstChild.firstChild).pipe(map(form => ({id: form.id})))
      : of({id: null});
  }
}
