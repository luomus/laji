import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewContainerRef
} from '@angular/core';
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
  styleUrls: ['./omni-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OmniSearchComponent implements OnInit, OnChanges, OnDestroy {

  @Input() placeholder: string;
  @Input() limit = 10;
  @Input() delay = 200;
  @Input() selectTo = '/taxon';
  @Input() matchType: AutocompleteMatchType;
  @Input() minLength = 3;
  @Input() expand = '';
  @Input() visible = true;
  @Output() visibleTaxon = new EventEmitter<any>();
  public search = '';
  public searchControl = new FormControl();
  public active = 0;
  public taxa = [];
  public taxon: any;
  public loading = false;
  private subTaxa: Subscription;
  private subCnt: Subscription;
  private inputChange: Subscription;
  private el: Element;

  constructor(private autocompleteService: AutocompleteApi,
              private warehouseApi: WarehouseApi,
              private localizeRouterService: LocalizeRouterService,
              private router: Router,
              private changeDetector: ChangeDetectorRef,
              viewContainerRef: ViewContainerRef,
              private logger: Logger
  ) {
    this.el = viewContainerRef.element.nativeElement;
  }

  @HostListener('body:click', ['$event.target'])
  onHostClick(target) {
    if (!(this.taxa.length > 0 && this.search.length > 0) || !target) {
      return;
    }
    if (this.el !== target && !this.el.contains((<any>target))) {
      this.close();
    }
  }

  ngOnInit() {
    this.inputChange = this.searchControl.valueChanges
      .do(value => this.search = value)
      .debounceTime(this.delay)
      .subscribe(value => {
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
      this.changeDetector.markForCheck();
      return;
    }
    this.loading = true;
    this.subTaxa = this.autocompleteService
      .autocompleteFindByField({
        field: 'taxon',
        q: this.search,
        limit: '' + this.limit,
        includePayload: true,
        lang: 'multi',
        matchType: this.matchType
      })
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
            lang: 'multi',
            limit: this.limit,
            err: err
          });
          this.changeDetector.markForCheck();
        }
      );
  }
}
