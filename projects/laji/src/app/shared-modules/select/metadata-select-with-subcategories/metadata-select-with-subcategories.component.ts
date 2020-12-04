import { catchError, concatMap, filter, map, switchMap, toArray, tap } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { from, Observable, of, Subscription } from 'rxjs';
import { WarehouseValueMappingService } from '../../../shared/service/warehouse-value-mapping.service';
import { Logger } from '../../../shared/logger/logger.service';
import { CollectionService } from '../../../shared/service/collection.service';
import { AreaService } from '../../../shared/service/area.service';
import { SourceService } from '../../../shared/service/source.service';
import { MetadataService } from '../../../shared/service/metadata.service';
import { TranslateService } from '@ngx-translate/core';
import { AdminStatusInfoPipe } from '../admin-status-info.pipe';
import { Area } from '../../../shared/model/Area';
import { BaseDataService } from '../../../graph-ql/service/base-data.service';
import { SelectOptions } from '../select/select.component';
import { AnnotationService } from '../../document-viewer/service/annotation.service';
import { MultiLangService } from '../../lang/service/multi-lang.service';
import { Annotation } from '../../../shared/model/Annotation';

export enum SelectStyle {
  basic,
  advanced
}

export interface MetadataSelectPick {
  [field: string]: string;
}

export const METADATA_SELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MetadataSelectWithSubcategoriesComponent),
  multi: true
};
@Component({
  selector: 'laji-metadata-select-with-subcategories',
  templateUrl: './metadata-select-with-subcategories.component.html',
  styleUrls: ['./metadata-select-with-subcategories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetadataSelectWithSubcategoriesComponent implements OnChanges, OnDestroy, ControlValueAccessor {
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
  @Input() whiteList: string[];
  @Input() skip: string[];
  @Input() skipBefore: string;
  @Input() open: boolean;
  @Input() disabled = false;
  @Input() labelAsValue = false;
  @Input() subCategories = [];
  @Input() subTitleBase = '';
  @Input() filtersName = [];
  @Input() selectStyle = SelectStyle.advanced;

  @Output() update = new EventEmitter<{id: string[] | string, category: string}>();

  selectStyles = SelectStyle;
  lang: string;
  active = [];
  selectedTitle = '';
  _shouldSort = false;
  _options: SelectOptions[] = [];

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

  constructor(
    public warehouseMapper: WarehouseValueMappingService,
    private adminStatusInfoPipe: AdminStatusInfoPipe,
    private annotationService: AnnotationService,
    private collectionService: CollectionService,
    private baseDataService: BaseDataService,
    private metadataService: MetadataService,
    private sourceService: SourceService,
    private translate: TranslateService,
    private areaService: AreaService,
    private cd: ChangeDetectorRef,
    private logger: Logger,
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
        this.logger.warn('Metadata select errorl', { field: this.field, alt: this.alt, lang: this.lang, err: err });
        return of([]);
      })
    );

    const byOptions$ = of(this.options).pipe(
      map(options => options.map(option => ({id: option, value: option})))
    );

    this.subOptions = (this.options ? byOptions$ : byField$).pipe(
      switchMap(options => this.mapToWarehouse ? this.optionsToWarehouseID(options) : of(options)),
      tap(options => console.log(options)),
      map(options => this.labelAsValue ? options.map(o => ({...o, id: o.value})) : options),
      map(options => this.firstOptions?.length > 0 ? this.sortOptionsByAnotherList(options) : (
        this._shouldSort ? options.sort((a, b) => a.value.localeCompare(b.value)) : options
      ))
    ).subscribe(options => {
        this.subCategories.forEach(item => {
          this._options[item] = options;
        });
        this.initActive();
        this.cd.markForCheck();
      });
  }

  initActive(): any {
    if (!this.value || !this._options) {
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
    if (!value) {
     return;
    }
    this.update.emit(value);
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

  private optionsToWarehouseID(options: SelectOptions[]): Observable<SelectOptions[]> {
    return from(options).pipe(
      concatMap(option => this.warehouseMapper.getWarehouseKey(option.id).pipe(
        filter(warehouseID => warehouseID !== option.id),
        map(warehouseID => ({ ...option, id: warehouseID })),
      )),
      toArray()
    );
  }

  private getDataObservable(): Observable<any> {
    if (this.field) {
      this._shouldSort = true;
      switch (this.field) {
        case 'MMAN.tag':
          return this.annotationService.getAllTags('multi').pipe(
            map(tags => tags.filter(t => !t.requiredRolesAdd || !t.requiredRolesAdd.includes(Annotation.AnnotationRoleEnum.formAdmin))),
            map(tags => tags.map(t => ({id: t.id, value: MultiLangService.getValue(t.name as any, this.lang)})))
          );
        case 'MY.collectionID':
          return this.collectionService.getAll(this.lang, true);
        case <any>Area.AreaType.Biogeographical:
          return this.areaService.getBiogeographicalProvinces(this.lang);
        case <any>Area.AreaType.Municipality:
          return this.areaService.getMunicipalities(this.lang);
        case <any>Area.AreaType.Country:
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
    this._shouldSort = false;
    return this.baseDataService.getBaseData().pipe(
      map(data => data.alts || []),
      map(alts => alts.find(alt => alt.id === this.alt)),
      map(alt => (alt && alt.options || []).map(option => ({id: option.id, value: option.label, info: this.addOptionInfo(option)}))),
      map(options => this.whiteList ? options.filter(option => this.whiteList.includes(option.id)) : options),
      map(options => this.skip ? options.filter(option => this.skip.indexOf(option.id) === -1) : options),
      map(options => this.skipBefore ? options.slice(options.findIndex(o => o.id === this.skipBefore)) : options),
    );
  }

  private sortOptionsByAnotherList(options: SelectOptions[]): SelectOptions[] {
    return options.sort((a, b) => {
      const hasA = this.firstOptions.includes(a.id);
      const hasB = this.firstOptions.includes(b.id);
      if (hasA || hasB) {
        if (hasA && hasB) {
          return a.value.localeCompare(b.value);
        } else {
          return hasA ? -1 : 1;
        }
      }
      return a.value.localeCompare(b.value);
    });
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

  private addOptionInfo(option) {
    if (this.alt === 'MX.adminStatusEnum') {
      return this.adminStatusInfoPipe.transform(option);
    }
    return undefined;
  }
}

