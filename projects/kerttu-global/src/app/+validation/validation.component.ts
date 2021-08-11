import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { UserService } from 'projects/laji/src/app/shared/service/user.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { KerttuGlobalApi } from '../kerttu-global-shared/service/kerttu-global-api';
import { PagedResult } from 'projects/laji/src/app/shared/model/PagedResult';
import { IKerttuSpeciesQuery, IKerttuSpecies, IKerttuSpeciesFilters, IKerttuRecording, IKerttuLetterTemplate } from '../kerttu-global-shared/models';
import { DialogService } from 'projects/laji/src/app/shared/service/dialog.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'laji-validation',
  template: `
    <laji-species-list
      *ngIf="!taxon"
      [(query)]="speciesQuery"
      [filters]="speciesFilters$ | async"
      [speciesList]="speciesList"
      [loading]="loading"
      (taxonSelect)="onTaxonSelect($event)"
      (queryChange)="updateSpeciesList()"
    ></laji-species-list>
    <laji-species-validation
      *ngIf="taxon"
      [data]="validationData$ | async"
      [templates]="templates$ | async"
      (save)="saveTemplates($event)"
    ></laji-species-validation>
  `,
  styles: []
})
export class ValidationComponent {
  speciesQuery: IKerttuSpeciesQuery = { page: 1, onlyUnvalidated: false };
  speciesFilters$: Observable<IKerttuSpeciesFilters>;
  speciesList: PagedResult<IKerttuSpecies> = {results: [], currentPage: 0, total: 0, pageSize: 0};
  loading = false;

  taxon?: number;
  validationData$?: Observable<IKerttuRecording[]>;
  templates$?: Observable<IKerttuLetterTemplate[]>;
  saving = false;

  private speciesListSub: Subscription;

  constructor(
    private dialogService: DialogService,
    private translate: TranslateService,
    private userService: UserService,
    private kerttuApi: KerttuGlobalApi,
    private cd: ChangeDetectorRef
  ) {
    this.speciesFilters$ = this.kerttuApi.getSpeciesFilters();
    this.updateSpeciesList();
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    if (this.taxon) {
      $event.returnValue = false;
    }
  }

  canDeactivate() {
    if (!this.taxon) {
      return true;
    }
    return this.dialogService.confirm(this.translate.instant('validation.leaveConfirm'));
  }

  onTaxonSelect(taxon: number) {
    this.taxon = taxon;
    this.validationData$ = this.kerttuApi.getDataForValidation(this.taxon).pipe(map(data => data.results));
    this.templates$ = this.kerttuApi.getTemplates(this.taxon).pipe(
      map(data => data.results),
      map(data => {
        while (data.length < 10) {
          data.push(null);
        }
        return data;
      })
    );
  }

  updateSpeciesList() {
    if (this.speciesListSub) {
      this.speciesListSub.unsubscribe();
    }
    this.loading = true;
    this.speciesListSub = this.kerttuApi.getSpeciesList(this.userService.getToken(), this.speciesQuery).subscribe(data => {
      this.speciesList = data;
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  saveTemplates(templates: IKerttuLetterTemplate[]) {
    const missingTemplates = templates.indexOf(null) !== -1;
    if (missingTemplates) {
      this.dialogService.alert(
        this.translate.instant('validation.missingTemplates')
      );
      return;
    }

    this.saving = true;
    this.kerttuApi.saveTemplates(this.userService.getToken(), this.taxon, templates).subscribe(() => {
      this.taxon = undefined;
      this.validationData$ = undefined;
      this.templates$ = undefined;
      this.saving = false;
      this.updateSpeciesList();
      this.cd.markForCheck();
    });
  }
}
