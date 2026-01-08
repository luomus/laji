import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectFormService } from '../shared/service/project-form.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs';

interface ViewModel {
  id: string | undefined;
}

@Component({
    template: `
  <ng-container>
    <router-outlet></router-outlet>
    @if (vm$ | async; as vm) {
      <laji-form-builder [id]="vm.id!"></laji-form-builder>
    }
  </ng-container>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ProjectFormEditComponent implements OnInit {
  vm$!: Observable<ViewModel>;

  constructor(private route: ActivatedRoute,
              private projectFormService: ProjectFormService
  ) {}

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.vm$ = this.route.firstChild!.firstChild
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ? this.projectFormService.getFormFromRoute$(this.route.firstChild!.firstChild).pipe(map(form => ({id: form?.id})))
      : of({id: undefined});
  }
}
