import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { AutocompleteApi } from '../api/AutocompleteApi';
import { TaxonomyApi } from '../api/TaxonomyApi';
import { Taxonomy } from '../model/Taxonomy';
import { WarehouseApi } from '../api/WarehouseApi';
import { Logger } from '../logger/logger.service';
import { Router } from '@angular/router';

@Component({
  selector: 'laji-omni-search',
  templateUrl: 'omni-search.component.html',
  styleUrls: ['./omni-search.component.css']
})
export class OmniSearchComponent implements OnInit, OnChanges {

  @Input() placeholder: string;
  @Input() lang: string;
  @Input() limit: number = 10;
  @Input() delay: number = 200;
  public search = '';
  public searchControl = new FormControl();
  public active = 0;
  public taxa = [];
  public taxon: any;
  public loading = false;
  private subTaxa: Subscription;
  private subCnt: Subscription;
  private subTaxon: Subscription;

  constructor(private autocompleteService: AutocompleteApi,
              private warehouseApi: WarehouseApi,
              private taxonService: TaxonomyApi,
              private router: Router,
              private logger: Logger
  ) {
  }

  ngOnInit() {
    const inputStream = this.searchControl.valueChanges
      .debounceTime(this.delay)
      .distinctUntilChanged();
    inputStream.subscribe(value => {
      this.search = value;
      this.updateTaxa();
    });
  }


  ngOnChanges() {
    this.updateTaxa();
  }

  close() {
    this.search = '';
    this.taxa = [];
  }

  activate(index: number): void {
    if (this.taxa[index]) {
      this.active = index;
      this.taxon = this.taxa[index];
      this.taxon.informalTaxonGroupsClass = this.taxon.payload.informalTaxonGroups
        .reduce((p, c) => p + ' ' + c.id, '');
      this.taxon.informalTaxonGroups = this.taxon.payload.informalTaxonGroups
        .map(group => group.name)
        .reverse();
      this.subTaxon = this.taxonService
        .taxonomyFindBySubject(this.taxon.key, this.lang)
        .subscribe(data => {
          this.taxa.map(auto => {
            if (auto.key === data.id ) {
              auto['vernacularName'] = data['vernacularName'];
              auto['isCursiveName'] = data['isCursiveName'] || false;
            }
          });
        });
      this.subCnt =
        Observable.of(this.taxon.key).combineLatest(
          this.warehouseApi.warehouseQueryCountGet({taxonId: this.taxon.key}),
          (id, cnt) => {
            return {id: id, cnt: cnt.total};
          }
        ).subscribe(data => {
          this.taxa.map(auto => {
            if (auto.key === data.id ) {
              auto['count'] = data.cnt;
            }
          });
        });
    } else {
      this.taxon = undefined;
    }
  }

  keyEvent(e) {
    if (e.keyCode === 38) { // up
      if (this.taxa[this.active - 1]) {
        this.activate(this.active - 1);
      }
    }
    if (e.keyCode === 40) { // down
      if (this.taxa[this.active + 1]) {
        this.activate(this.active + 1);
      }
    }
    if (e.keyCode === 13) {
      if (this.taxa[this.active]) {
        this.router.navigate(['/taxon', this.taxa[this.active].key]);
      }
    }
  }

  private updateTaxa() {
    if (this.subTaxa) {
      this.subTaxa.unsubscribe();
    }
    if (this.subCnt) {
      this.subCnt.unsubscribe();
    }
    if (this.subTaxon) {
      this.subTaxon.unsubscribe();
    }
    if (this.search.length < 4) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.subTaxa = this.autocompleteService
      .autocompleteFindByField('taxon', this.search, '' + this.limit, true, this.lang)
      .subscribe(
        data => {
          this.taxa = data;
          this.activate(0);
        },
        err => this.logger.warn('OmniSearch failed to find data', {
          taxon: this.search,
          lang: this.lang,
          limit: this.limit,
          err: err
        }),
        () => {
          this.loading = false;
        }
      );
  }
}
