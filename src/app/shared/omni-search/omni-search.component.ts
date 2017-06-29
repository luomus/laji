import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { FormControl } from '@angular/forms';
import { AutocompleteApi, AutocompleteMatchType } from '../api/AutocompleteApi';
import { WarehouseApi } from '../api/WarehouseApi';
import { Logger } from '../logger/logger.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';

@Component({
  selector: 'laji-omni-search',
  templateUrl: './omni-search.component.html',
  styleUrls: ['./omni-search.component.css']
})
export class OmniSearchComponent implements OnInit, OnChanges {

  @Input() placeholder: string;
  @Input() lang: string;
  @Input() limit = 10;
  @Input() delay = 200;
  @Input() selectTo = '/taxon';
  @Input() matchType: AutocompleteMatchType;
  @Input() minLength = 3;
  public search = '';
  public searchControl = new FormControl();
  public active = 0;
  public taxa = [];
  public taxon: any;
  public loading = false;
  private subTaxa: Subscription;
  private subCnt: Subscription;

  constructor(private autocompleteService: AutocompleteApi,
              private warehouseApi: WarehouseApi,
              private localizeRouterService: LocalizeRouterService,
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
        this.router.navigate(
          this.localizeRouterService.translateRoute([this.selectTo, this.taxa[this.active].key])
        );
        this.close();
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
    if (this.search.length < this.minLength) {
      this.loading = false;
      return;
    }
    this.loading = true;
    this.subTaxa = this.autocompleteService
      .autocompleteFindByField({
        field: 'taxon',
        q: this.search,
        limit: '' + this.limit,
        includePayload: true,
        lang: this.lang,
        matchType: this.matchType
      })
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
