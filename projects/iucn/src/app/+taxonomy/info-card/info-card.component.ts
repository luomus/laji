import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChecklistVersion, TaxonService } from '../../iucn-shared/service/taxon.service';
import { ResultService } from '../../iucn-shared/service/result.service';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HeaderService } from 'projects/laji/src/app/shared/service/header.service';
import { components } from 'projects/laji-api-client-b/generated/api.d';

type Taxon = components['schemas']['Taxon'];
type RedListEvaluation = components['schemas']['Evaluation'];

@Component({
  selector: 'iucn-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css']
})
export class InfoCardComponent implements OnChanges, OnInit {
  @Input() public year!: string;
  @Input() public checklistId!: ChecklistVersion;
  @Input() public taxonId!: string;

  public taxon: Taxon| undefined;
  public latestStatus: RedListEvaluation | undefined | null;
  public isEndangered: boolean | undefined;
  public missing: boolean | undefined;

  years$!: Observable<{label: string; value: string}[]>;
  species$: Observable<Taxon[]> | undefined;

  taxonSub: Subscription | undefined;

  constructor(
    private taxonService: TaxonService,
    private resultService: ResultService,
    private translateService: TranslateService,
    private router: Router,
    private headerService: HeaderService
  ) { }

  ngOnInit(): void {
    this.years$ = ObservableOf(this.resultService.years.map(year => ({label: 'checklist.' + year, value: year}))).pipe(
      switchMap(options => this.translateService.get(options.map(option => option.label)).pipe(
        map(translations => options.map(option => ({...option, label: translations[option.label]})))
      ))
    );
  }

  ngOnChanges() {
    this.initTaxon();
  }

  initTaxon() {
    if (this.taxonSub) {
      this.taxonSub.unsubscribe();
    }

    this.taxon = undefined;
    this.latestStatus = undefined;
    this.isEndangered = undefined;
    this.missing = undefined;

    if (!this.taxonId) {
      return;
    }

    this.taxonSub = this.taxonService.getTaxon(this.taxonId, this.checklistId)
      .subscribe(taxon => {
        if (!taxon.species) {
          this.missing = true;
          return;
        }

        if (taxon.hasLatestRedListEvaluation) {
          this.latestStatus = taxon.latestRedListEvaluation;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.isEndangered = this.resultService.endangered.includes(this.latestStatus!.redListStatus!);
        } else {
          this.latestStatus = null;
          this.species$ = this.taxonService.getTaxonSpeciesWithLatestEvaluation(
            taxon.id,
            this.checklistId
          );
        }

        this.taxon = taxon;
        this.setTitle();
      }, (e) => {
        if (e.status === 404) {
          this.missing = true;
        } else {
          throw e;
        }
      });
  }

  private setTitle() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let title = this.taxon!.vernacularName;
    if (!title) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      title = this.taxon!.scientificName;
    }
    if (this.isEndangered) {
      title += ' - ' + 'Uhanalainen:';
    }
    title += ' ' + (this.latestStatus ? this.translateService.instant('iucn.taxon.' + this.latestStatus.redListStatus) : '');
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    title = title!.toLocaleLowerCase();
    title = title.charAt(0).toLocaleUpperCase() + title.slice(1);
    this.headerService.setHeaders({
      title: title + ' | ' + this.headerService.getInferred().title
    });
  }

  changeYear($event: any) {
    this.router.navigate([], {queryParams: {year: $event}});
  }
}
