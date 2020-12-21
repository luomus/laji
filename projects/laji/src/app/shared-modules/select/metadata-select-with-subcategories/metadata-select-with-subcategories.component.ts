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
import { MetadataSelectComponent } from '../metadata-select/metadata-select.component'


@Component({
  selector: 'laji-metadata-select-with-subcategories',
  templateUrl: './metadata-select-with-subcategories.component.html',
  styleUrls: ['./metadata-select-with-subcategories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetadataSelectWithSubcategoriesComponent extends MetadataSelectComponent implements OnChanges, OnDestroy, ControlValueAccessor {
  @Input() subCategories = [];
  @Input() subTitleBase = '';
  @Input() filtersName = [];
  @Input() filtersValues = [];

  @Output() update = new EventEmitter<{id: string[] | string, category: string}>();

  lang: string;
  active = [];
  selectedTitle = '';
  _shouldSort = false;
  _Options:  {[key: string]: SelectOptions[]} = {};
  queryToSelect = [];

  protected subOptions: Subscription;
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
    super(warehouseMapper, adminStatusInfoPipe, annotationService, collectionService,
    baseDataService, metadataService, sourceService, translate, areaService, cd, logger
    );
  }

  onTouched = () => {};

  ngOnChanges(changes) {
    this.lang = this.translate.currentLang;
    this.initOptions();
    this.queryToSelect = this.filtersValues;
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
      map(options => this.labelAsValue ? options.map(o => ({...o, id: o.value})) : options),
      map(options => this.firstOptions?.length > 0 ? this.sortOptionsByAnotherList(options) : (
        this._shouldSort ? options.sort((a, b) => a.value.localeCompare(b.value)) : options
      ))
    ).subscribe(options => {
        this.subCategories.forEach(item => {
          this._Options[item] = options;
        });
        this.initActive();
        this.cd.markForCheck();
      });
  }

  refreshValue(value: any): void {
    if (!value) {
     return;
    }
    this.update.emit(value);
  }

}

