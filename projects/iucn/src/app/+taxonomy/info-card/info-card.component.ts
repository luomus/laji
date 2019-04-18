import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { RedListEvaluation, Taxonomy } from '../../../../../../src/app/shared/model/Taxonomy';
import { TranslateService } from '@ngx-translate/core';
import { TaxonService } from '../../iucn-shared/service/taxon.service';
import { ResultService } from '../../iucn-shared/service/result.service';
import { Title } from '@angular/platform-browser';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.css']
})
export class InfoCardComponent implements OnChanges, OnInit {

  public taxon: Taxonomy;
  public latestStatus: RedListEvaluation;
  public isEndangered: boolean;
  public missing: boolean;

  @Input() public year: string;
  @Input() private taxonId: string;
  @Input() private checklistId: string;

  years$: Observable<{label: string, value: string}[]>;
  species$: Observable<Taxonomy[]>;

  taxonSub: Subscription;

  constructor(
    private taxonService: TaxonService,
    private resultService: ResultService,
    private translateService: TranslateService,
    private router: Router,
    private title: Title
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

    this.taxonSub = this.taxonService.getTaxon(this.taxonId, this.translateService.currentLang, this.checklistId)
      .subscribe(taxon => {
        if (!taxon.species) {
          this.missing = true;
          return;
        }

        if (taxon.hasLatestRedListEvaluation) {
          this.latestStatus = taxon.latestRedListEvaluation;
          this.isEndangered = this.resultService.endangered.includes(this.latestStatus.redListStatus);
        } else {
          this.latestStatus = null;
          this.species$ = this.taxonService.getTaxonSpeciesWithLatestEvaluation(
            taxon.id,
            this.translateService.currentLang,
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
    let title = this.taxon.vernacularName;
    if (!title) {
      title = this.taxon.scientificName;
    }
    if (this.isEndangered) {
      title += ' - ' + 'Uhanalainen:';
    }
    title += ' ' + (this.latestStatus ? this.translateService.instant('iucn.taxon.' + this.latestStatus.redListStatus) : '');
    title = title.toLocaleLowerCase();
    title = title.charAt(0).toLocaleUpperCase() + title.slice(1);
    this.title.setTitle(title + ' | ' + this.title.getTitle());
  }

  changeYear($event: any) {
    this.router.navigate([], {queryParams: {year: $event}});
  }
}
