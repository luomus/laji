import { catchError, concatMap, filter, map, switchMap, toArray } from 'rxjs/operators';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, forwardRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
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
import { AnnotationService } from '../../document-viewer/service/annotation.service';
import { MultiLangService } from '../../lang/service/multi-lang.service';
import { Annotation } from '../../../shared/model/Annotation';
import { WarehouseApi } from '../../../shared/api/WarehouseApi';
import { IdType, SelectOption } from '../select/select.component';

export enum SelectStyle {
  basic,
  advanced
}

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
  @Input() field?: string;
  @Input() alt?: string;
  @Input() name?: string;
  @Input() multiple = true;
  @Input() placeholder = 'select';
  @Input() mapToWarehouse = false;
  @Input() pick?: MetadataSelectPick;
  @Input() options?: string[];
  @Input() useFilter = true;
  @Input() filterProperties: (keyof SelectOption)[] | undefined;
  @Input() firstOptions: IdType[] = [];
  @Input() info?: string;
  @Input() whiteList?: string[];
  @Input() skip?: string[];
  @Input() skipBefore?: string;
  @Input() open = false;
  @Input() disabled = false;
  @Input() labelAsValue = false;
  @Input() selectStyle = SelectStyle.advanced;
  @Input() useFilterApi = false;

  selectStyles = SelectStyle;
  lang!: string;
  active: IdType[] = [];
  selectedTitle = '';
  _shouldSort = false;
  _options: SelectOption[]|null = null;

  protected subOptions?: Subscription;
  protected innerValue = '';

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
    private warehouseApi: WarehouseApi,
    protected adminStatusInfoPipe: AdminStatusInfoPipe,
    protected annotationService: AnnotationService,
    protected collectionService: CollectionService,
    protected baseDataService: BaseDataService,
    protected metadataService: MetadataService,
    protected sourceService: SourceService,
    protected translate: TranslateService,
    protected areaService: AreaService,
    protected cd: ChangeDetectorRef,
    protected logger: Logger,
  ) {
  }

  onTouched = () => {};

  ngOnChanges(changes: SimpleChanges) {
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
        this.logger.warn('Metadata select error', { field: this.field, alt: this.alt, lang: this.lang, err });
        return of([] as SelectOption[]);
      })
    );

    const byOptions$ = of(this.options || [] as string[]).pipe(
      map(options => options?.map(option => ({id: option, value: option} as SelectOption)))
    );

    this.subOptions = (this.options ? byOptions$ : byField$).pipe(
      switchMap(options => this.mapToWarehouse ? this.optionsToWarehouseID(options) : of(options)),
      map(options => this.labelAsValue ? options.map(o => ({...o, id: o.value})) : options),
      map(options => this.firstOptions?.length > 0 ? this.sortOptionsByAnotherList(options) : (
        this._shouldSort ? options.sort((a, b) => a.value.localeCompare(b.value)) : options
      ))
    ).subscribe(options => {
        this.setOptions(options);
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
      this.active = this._options.reduce<IdType[]>((cumulative, current) => {
        if (this.value === current.id) {
          cumulative.push(current.id);
        }
        return cumulative;
      }, []);
    } else {
      this.active = this._options.reduce<IdType[]>((cumulative, current) => {
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

  trackingBy(idx: number, item: SelectOption) {
    return item.id ?? idx;
  }

  protected setOptions(options: SelectOption[]): void {
    this._options = options;
  }

  protected optionsToWarehouseID(options: SelectOption[]): Observable<SelectOption[]> {
    return from(options).pipe(
      concatMap(option => this.warehouseMapper.getWarehouseKey(option.id).pipe(
        filter(warehouseID => warehouseID !== option.id),
        map(warehouseID => ({ ...option, id: warehouseID })),
      )),
      toArray()
    );
  }

  protected getDataObservable(): Observable<SelectOption[]> {
    if (this.useFilterApi && this.name) {
      return this.warehouseApi.warehouseQueryFilterGet(this.name).pipe(
        map(data => data.enumerations),
        map(options => options.map((o: any) => ({id: o.name, value: MultiLangService.getValue(o.label as any, this.lang)}))),
      );
    }

    if (this.field) {
      this._shouldSort = true;
      switch (this.field) {
        case 'MMAN.tag':
          return this.annotationService.getAllTags('multi').pipe(
            map(tags => tags.filter(t => !t.requiredRolesAdd || !t.requiredRolesAdd.includes(Annotation.AnnotationRoleEnum.formAdmin))),
            map(tags => tags.map(t => ({id: t.id, value: MultiLangService.getValue(t.name as any, this.lang)})))
          );
        case 'MY.collectionID':
          return this.collectionService.getAll$(this.lang, true);
        case <any>Area.AreaType.Biogeographical:
          return this.areaService.getBiogeographicalProvinces(this.lang);
        case <any>Area.AreaType.Municipality:
          return this.areaService.getMunicipalities(this.lang);
        case <any>Area.AreaType.Country:
          return this.areaService.getCountries(this.lang);
        case <any>Area.AreaType.ElyCentre:
          return this.areaService.getElyCentres(this.lang);
        case <any>Area.AreaType.BirdAssociationArea:
          return this.areaService.getBirdAssociationAreas(this.lang);
        case <any>Area.AreaType.Province:
          return this.areaService.getProvinces(this.lang);
        case 'KE.informationSystem':
          return this.sourceService.getAllAsLookUp(this.lang).pipe(
            map(system => Object.keys(system).reduce<SelectOption[]>((total, current) => {
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
      map(options => this.whiteList ? options.filter(option => this.whiteList?.includes(option.id)) : options),
      map(options => this.skip ? options.filter(option => this.skip?.indexOf(option.id) === -1) : options),
      map(options => this.skipBefore ? options.slice(options.findIndex(o => o.id === this.skipBefore)) : options)
    );
  }

  protected sortOptionsByAnotherList(options: SelectOption[]): SelectOption[] {
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

  protected pickValue(data: SelectOption[]) {
    if (!this.pick) {
      return data.map(value => ({id: value.id, value: value.value, info: value.info} as SelectOption));
    }
    return data.reduce<SelectOption[]>((total, item) => {
      if (typeof this.pick?.[item.id as number|string] !== 'undefined' && this.pick?.[item.id as number|string] === '') {
        total.push({id: item.id, value: item.value, info: item.info});
      }
      return total;
    }, []);
  }

  protected addOptionInfo(option: any) {
    if (this.alt === 'MX.adminStatusEnum') {
      return this.adminStatusInfoPipe.transform(option);
    }
    return undefined;
  }
}
