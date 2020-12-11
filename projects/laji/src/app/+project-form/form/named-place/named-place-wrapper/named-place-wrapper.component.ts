import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NamedPlacesQuery, NamedPlacesRouteData, ProjectFormService } from '../../../project-form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'laji-named-place-wrapper',
  template: `
    <ng-container *ngIf="data$ | async as data; else spinner">
      <laji-named-places [documentForm]="data.documentForm"
                         [activeId]="data.activeNP"
                         [municipality]="data.municipality"
                         [birdAssociationArea]="data.birdAssociationArea"
                         [tags]="data.tags"
                         (municipalityChange)="onMunicipalityChange($event)"
                         (birdAssociationAreaChange)="onBirdAssociationAreaChange($event)"
                         (tagsChange)="onTagsChange($event)"
                         (activeIdChange)="onActiveIdChange($event)"
                         (use)="use($event)"
                         (edit)="edit($event)"
                         (create)="create()"
      ></laji-named-places>
    </ng-container>
    <ng-template #spinner>
      <laji-spinner></laji-spinner>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NamedPlaceWrapperComponent implements OnInit {

  data$: Observable<NamedPlacesRouteData>;

  constructor(
    private projectFormService: ProjectFormService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.data$ = this.projectFormService.getNamedPlacesRouteData$(this.route);
  }

  updateQuery(queryParams: Partial<NamedPlacesQuery>) {
    return this.router.navigate([], {queryParams, queryParamsHandling: 'merge'});
  }

  onBirdAssociationAreaChange(birdAssociationArea: string) {
    this.updateQuery({birdAssociationArea});
  }

  onMunicipalityChange(municipality: string) {
    this.updateQuery({municipality});
  }

  onTagsChange(tags: string[]) {
    this.updateQuery({tags: tags.join(',')});
  }

  onActiveIdChange(id: string) {
    this.updateQuery({activeNP: id});
  }

  use(id: string) {
    this.router.navigate([`./${id}`], {relativeTo: this.route});
  }

  edit(id: string) {
    this.router.navigate([`./${id}/edit`], {relativeTo: this.route});
  }

  create() {
    this.projectFormService.getProjectFormFromRoute$(this.route).pipe(take(1)).subscribe(projectForm => {
      this.router.navigate(['./new'], {
        queryParams: this.projectFormService.trimNamedPlacesQuery(projectForm.form, {
          municipality: this.route.snapshot.queryParams.municipality,
          birdAssociationArea: this.route.snapshot.queryParams.birdAssociationArea
        }, false),
        relativeTo: this.route
      });
    });
  }
}
