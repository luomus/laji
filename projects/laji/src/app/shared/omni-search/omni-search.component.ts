import { combineLatest, debounceTime, tap, switchMap, distinctUntilChanged } from 'rxjs/operators';
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
import { of as ObservableOf, Subscription } from 'rxjs';
import { UntypedFormControl } from '@angular/forms';
import { WarehouseApi } from '../api/WarehouseApi';
import { Logger } from '../logger/logger.service';
import { Router } from '@angular/router';
import { LocalizeRouterService } from '../../locale/localize-router.service';
import { LajiApi, LajiApiService } from '../service/laji-api.service';
import { TaxaWithAutocomplete, TaxonAutocompleteService } from '../service/taxon-autocomplete.service';
import { TranslateService } from '@ngx-translate/core';


type InternalTaxon = TaxaWithAutocomplete & {count?: number; informalTaxonGroups?: any; informalTaxonGroupsClass?: any};

@Component({
  selector: 'laji-omni-search',
  templateUrl: './omni-search.component.html',
  styleUrls: ['./omni-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OmniSearchComponent implements OnInit, OnChanges, OnDestroy {

  @Input() placeholder?: string;
  @Input() limit = 5;
  @Input() delay = 200;
  @Input() selectTo = '/taxon';
  @Input() matchType?: LajiApi.AutocompleteMatchType;
  @Input() minLength = 3;
  @Input() expand = '';
  @Input() visible = true;
  @Output() visibleTaxon = new EventEmitter<any>();

  public search = '';
  public searchControl = new UntypedFormControl();
  public active = 0;
  public taxa: InternalTaxon[] = [];
  public taxon?: InternalTaxon;
  public loading = false;
  public dropdownVisible = false;
  private subTaxa?: Subscription;
  private subCnt?: Subscription;
  private inputChange?: Subscription;
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
      tap(value => this.search = value),
      debounceTime(this.delay),
    ).subscribe(() => {
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
    this.dropdownVisible = false;
    this.search = '';
    this.taxa = [];
    this.changeDetector.markForCheck();
  }

  activate(index: number): void {
    if (this.taxa[index]) {
      this.active = index;
      this.taxon = this.taxa[index];
      this.taxon.informalTaxonGroupsClass = this.taxon.payload.informalTaxonGroups
        .reduce((p: any, c: any) => p + ' ' + c.id, '');
      this.taxon.informalTaxonGroups = this.taxon.payload.informalTaxonGroups
        .map((group: any) => group.name);
      this.subCnt =
        ObservableOf(this.taxon.key).pipe(combineLatest(
          this.warehouseApi.warehouseQueryCountGet({taxonId: this.taxon.key, cache: true}),
          (id, cnt) => ({id, cnt: cnt.total})
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

  keyEvent(e: KeyboardEvent) {
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
    if (e.keyCode === 27) { // esc
      this.onClose();
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
          this.dropdownVisible = this.taxa.length > 0 && this.search.length > 0;
          this.changeDetector.markForCheck();
        },
        err => {
          this.logger.warn('OmniSearch failed to find data', {
            taxon: this.search,
            lang: this.translate.currentLang,
            limit: this.limit,
            err
          });
          this.changeDetector.markForCheck();
        }
      );
  }
}
