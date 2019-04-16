
import {switchMap, catchError,  map } from 'rxjs/operators';
/* tslint:disable:no-use-before-declare */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { forkJoin as ObservableForkJoin, Observable, of as ObservableOf, Subscription } from 'rxjs';
import { WarehouseValueMappingService } from '../../../shared/service/warehouse-value-mapping.service';
import { Logger } from '../../../shared/logger/logger.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { AreaService, AreaType } from '../../../shared/service/area.service';
import { SourceService } from '../../../shared/service/source.service';
import { MetadataService } from '../../../shared/service/metadata.service';
import { MultiLangService } from '../../lang/service/multi-lang.service';
import { TranslateService } from '@ngx-translate/core';




export interface MetadataSelectPick {
  [field: string]: string;
}

export const METADATA_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MetadataSelectComponent),
  multi: true
};

@Component({
  selector: 'laji-metadata-select',
  templateUrl: './metadata-select.component.html',
  providers: [METADATA_SELECT_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetadataSelectComponent implements OnChanges, OnDestroy, ControlValueAccessor {
  @Input() field: string;
  @Input() alt: string;
  @Input() name: string;
  @Input() multiple = true;
  @Input() placeholder = 'select';
  @Input() mapToWarehouse = false;
  @Input() pick: MetadataSelectPick;
  @Input() options: string[];
  @Input() useFilter = true;
  @Input() firstOptions = [];
  @Input() info: string;
  @Input() skip: string[];
  @Input() skipBefore: string;
  @Input() open: boolean;

  lang: string;
  _options: {id: string, value: string, info: string}[] = [];
  active = [];
  selectedTitle = '';
  shouldSort = false;
  private subOptions: Subscription;
  private innerValue = '';

  onChange = (_: any) => { };

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChange(v);
    }
  }

  get value(): any {
    return this.innerValue;
  }

  constructor(public warehouseMapper: WarehouseValueMappingService,
              private metadataService: MetadataService,
              private collectionService: CollectionService,
              private areaService: AreaService,
              private sourceService: SourceService,
              private cd: ChangeDetectorRef,
              private logger: Logger,
              private translate: TranslateService
  ) {
  }

  onTouched = () => {};

  ngOnChanges(changes) {
    this.lang = this.translate.currentLang;
    this.initOptions();
  }

  ngOnDestroy() {
    if (this.subOptions) {
      this.subOptions.unsubscribe();
    }
  }

  initOptions() {
    if (!this.field && !this.alt && !this.options) {
      return;
    }

    const byField$ = this.getDataObservable().pipe(
      map(result => this.pickValue(result)),
      catchError(err => {
        this.logger.warn('Failed to fetch metadata select', {
          field: this.field,
          alt: this.alt,
          lang: this.lang,
          err: err
        });
        return ObservableOf([]);
      }), );

    const byOptions$ = ObservableOf(this.options).pipe(
      map(options => options.map(option => ({id: option, value: option}))));

    this.subOptions = (this.options ? byOptions$ : byField$).pipe(
      switchMap(options => {
        if (this.mapToWarehouse) {
          const requests = [];
          options.map(item => {
            requests.push(this.warehouseMapper.getWarehouseKey(item.id));
          });
          return ObservableForkJoin(requests).pipe(
            map(mapping => options.reduce((prev, curr, idx) => {
                if (mapping[idx] !== options[idx].id) {
                  prev.push({id: mapping[idx], value: curr.value, info: curr.info});
                } else {
                  this.logger.log('No ETL mapping for', mapping[idx]);
                }
                return prev;
              }, [])
            ));
        } else {
          return ObservableOf(options);
        }
      }))
      .subscribe(options => {
        if (this.firstOptions.length > 0) {
          this._options = options.sort((a, b) => {
            const hasA = this.firstOptions.indexOf(a.id) > -1;
            const hasB = this.firstOptions.indexOf(b.id) > -1;
            if (hasA || hasB) {
              if (hasA && hasB) {
                return a.value.localeCompare(b.value);
              } else {
                return hasA ? -1 : 1;
              }
            }
            return a.value.localeCompare(b.value);
          });
        } else {
          this._options = this.shouldSort ? options.sort((a, b) => a.value.localeCompare(b.value)) : options;
        }
        this.initActive();
        this.cd.markForCheck();
      });
  }

  initActive(): any {
    if (!this.value) {
      this.active = [];
      this.selectedTitle = '';
      this.cd.markForCheck();
      return;
    }
    if (typeof this.value === 'string') {
      this.active = this._options.reduce((cumulative, current) => {
        if (this.value === current.id) {
          cumulative.push(current.id);
        }
        return cumulative;
      }, []);
    } else {
      this.active = this._options.reduce((cumulative, current) => {
        if (this.value.indexOf(current.id) > -1) {
          cumulative.push(current.id);
        }
        return cumulative;
      }, []);
    }
    this.selectedTitle = this.active.length > 0 ? ' (' + this.active.length + ')' : '';
    this.cd.markForCheck();
  }

  refreshValue(value: any): void {
    if (value.id) {
      this.value = value.id;
    } else if (typeof value === 'string') {
      this.value = value;
    } else {
      try {
        this.value = value;
      } catch (e) {
        this.value = '';
      }
    }
    this.onChange(this.value);
  }

  writeValue(value: any): void {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.initActive();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  private getDataObservable(): Observable<any> {
    if (this.field) {
      this.shouldSort = true;
      switch (this.field) {
        case 'MY.collectionID':
          return this.collectionService.getAllAsLookUp(this.lang);
        case <any>AreaType.Biogeographical:
          return this.areaService.getBiogeographicalProvinces(this.lang);
        case <any>AreaType.Municipality:
          return this.areaService.getMunicipalities(this.lang);
        case <any>AreaType.Country:
          return this.areaService.getCountries(this.lang);
        case 'KE.informationSystem':
          return this.sourceService.getAllAsLookUp(this.lang).pipe(
            map(system => Object.keys(system).reduce((total, current) => {
              total.push({id: current, value: system[current]});
              return total;
            }, [])));
        default:
          throw new Error('Could not find mapping for ' + this.field);
      }
    }
    this.shouldSort = false;
    return this.metadataService.getRange(this.alt).pipe(
      map(range => range.map(data => {
        const options = {id: data.id, value: MultiLangService.getValue(data.value, this.lang)};
        this.addMetadataInfo(options, data);
        return options;
      })),
      map(options => this.skip ? options.filter(option => this.skip.indexOf(option.id) === -1) : options),
      map(options => this.skipBefore ? options.slice(options.findIndex(o => o.id === this.skipBefore)) : options)
    );
  }

  private pickValue(data) {
    if (!this.pick) {
      return data.map(value => ({id: value.id, value: value.value, info: value.info}));
    }
    return data.reduce((total, item) => {
      if (typeof this.pick[item.id] !== 'undefined' && this.pick[item.id] === '') {
        total.push({id: item.id, value: item.value, info: item.info});
      }
      return total;
    }, []);
  }

  private addMetadataInfo(options, data) {
    if (this.alt === 'MX.adminStatusEnum') {
      let info = '';
      const description = MultiLangService.getValue(data.administrativeStatusDescription, this.lang);
      const link = MultiLangService.getValue(data.administrativeStatusLink, this.lang);
      if (description) {
        info += '<p>' + description + '</p>';
      }
      if (link) {
        info += '<p>' + this.translate.instant('readMore') + ': <a href="' + link + '" target="_blank">' + link + '</a>';
      }
      if (info) {
        options['info'] = info;
      }
    }
  }
}
