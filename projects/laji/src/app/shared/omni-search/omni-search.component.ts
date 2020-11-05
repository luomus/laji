import { combineLatest, debounceTime, tap, flatMap, take, delay, map ,  switchMap, distinctUntilChanged, takeUntil, share } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewContainerRef
} from '@angular/core';
import { Observable, of as ObservableOf, Subscription, Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { WarehouseApi } from '../api/WarehouseApi';
import { Logger } from '../logger/logger.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { LajiApi, LajiApiService } from '../service/laji-api.service';
import { TaxonAutocompleteService } from '../service/taxon-autocomplete.service';
import { TranslateService } from '@ngx-translate/core';
import { SurveyBoxComponent } from 'projects/laji/src/app/shared-modules/survey-box/survey-box.component';


@Component({
  selector: 'laji-omni-search',
  templateUrl: './omni-search.component.html',
  styleUrls: ['./omni-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OmniSearchComponent implements OnInit, OnChanges, OnDestroy {

  @Input() placeholder: string;
  @Input() limit = 5;
  @Input() delay = 200;
  @Input() selectTo = '/taxon';
  @Input() matchType: LajiApi.AutocompleteMatchType;
  @Input() minLength = 3;
  @Input() expand = '';
  @Input() visible = true;
  @Output() visibleTaxon = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  public search = '';
  public searchControl = new FormControl();
  public active = 0;
  public taxa = [];
  public taxon: any;
  public loading = false;
  private subTaxa: Subscription;
  private subCnt: Subscription;
  private inputChange: Subscription;
  private dataSearch: Observable<any>;
  private el: Element;

  constructor(private lajiApi: LajiApiService,
              private warehouseApi: WarehouseApi,
              private localizeRouterService: LocalizeRouterService,
              private router: Router,
              private changeDetector: ChangeDetectorRef,
              viewContainerRef: ViewContainerRef,
              private logger: Logger,
              private taxonAutocompleteService: TaxonAutocompleteService,
              private translate: TranslateService
  ) {
    this.el = viewContainerRef.element.nativeElement;
  }

  ngOnInit() {
    this.inputChange = this.searchControl.valueChanges.pipe(
      distinctUntilChanged(),
      tap(value => this.search = value)).pipe(
      debounceTime(this.delay),
      ).subscribe(value => {
        this.updateTaxa();
      });
  }


  ngOnChanges() {
    this.updateTaxa();
  }

  ngOnDestroy() {
    if (this.inputChange) {
      this.inputChange.unsubscribe();
    }
  }

  onClose() {
    this.search = '';
    this.taxa = [];
    this.close.emit();
    this.changeDetector.markForCheck();
  }

  activate(index: number): void {
    if (this.taxa[index]) {
      this.active = index;
      this.taxon = this.taxa[index];
      this.taxon.informalTaxonGroupsClass = this.taxon.payload.informalTaxonGroups
        .reduce((p, c) => p + ' ' + c.id, '');
      this.taxon.informalTaxonGroups = this.taxon.payload.informalTaxonGroups
        .map(group => group.name);
      this.subCnt =
        ObservableOf(this.taxon.key).pipe(combineLatest(
          this.warehouseApi.warehouseQueryCountGet({taxonId: this.taxon.key, cache: true}),
          (id, cnt) => {
            return {id: id, cnt: cnt.total};
          }
        )).subscribe(data => {
          this.taxa.map(auto => {
            if (auto.key === data.id ) {
              auto['count'] = data.cnt;
            }
          });
          this.visibleTaxon.emit(this.taxa[index]);
          this.changeDetector.markForCheck();
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
        this.onClose();
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
      this.taxa = [];
      this.changeDetector.markForCheck();
      return;
    }
    if (!this.visible) {
      this.search = '';
      this.taxa = [];
      return;
    }

    this.loading = true;
    this.subTaxa = this.lajiApi
      .get(LajiApi.Endpoints.autocomplete, 'taxon', {
        q: this.search,
        limit: '' + this.limit,
        includePayload: true,
        lang: this.translate.currentLang,
        matchType: this.matchType
      }).pipe(
        switchMap((taxa: any[]) => this.taxonAutocompleteService.getInfo(taxa, this.search))
      )
      .subscribe(
        data => {
          this.taxa = data;
          this.loading = false;
          this.activate(0);
          this.changeDetector.markForCheck();
        },
        err => {
          this.logger.warn('OmniSearch failed to find data', {
            taxon: this.search,
            lang: this.translate.currentLang,
            limit: this.limit,
            err: err
          });
          this.changeDetector.markForCheck();
        }
      );
  }
}
