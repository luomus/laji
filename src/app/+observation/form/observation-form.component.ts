import {Component, OnInit, Input} from '@angular/core';
import {FORM_DIRECTIVES}   from '@angular/forms';
import {Location, NgModel} from "@angular/common";
import * as moment from 'moment';

import {SearchQuery} from "../search-query.model";
import {ObservationCountComponent} from "../count/observation-count.component";
import {WarehouseQueryInterface, DATE_FORMAT} from "../../shared/model/WarehouseQueryInterface";
import {ObservationChartComponent} from "../chart/observation-chart.component";
import {ObservationResultComponent} from "../result-tabs/observation-result.component";
import {Observable, Subscription} from "rxjs";
import {TYPEAHEAD_DIRECTIVES} from "ng2-bootstrap";
import {AutocompleteApi} from "../../shared/api/AutocompleteApi";
import {TranslateService} from "ng2-translate";
import {ObservationFilterComponent} from "../filters/observation-filters.component";
import {ObservationFilterInterface } from "../filters/observation-filters.interface";
import {ObservationFormQuery} from "./observation-form-query.interface";
import {CollectionApi} from "../../shared/api/CollectionApi";
import {Collection} from "../../shared/model/Collection";
import {IdService} from "../../shared/service/id.service";
import {DatePickerComponent} from "../../shared/datepicker/datepicker.component";

@Component({
  selector: 'laji-observation-form',
  templateUrl: 'observation-form.component.html',
  providers: [AutocompleteApi,CollectionApi, NgModel],
  directives: [
    ObservationCountComponent,
    ObservationChartComponent,
    ObservationResultComponent,
    ObservationFilterComponent,
    DatePickerComponent,
    TYPEAHEAD_DIRECTIVES,
    FORM_DIRECTIVES
  ]
})
export class ObservationFormComponent implements OnInit {

  @Input() tab:string;

  public limit = 10;
  public formQuery:ObservationFormQuery;
  public dataSource:Observable<any>;
  public typeaheadLoading:boolean = false;
  public warehouseDateFormat = DATE_FORMAT;

  private subUpdate:Subscription;

  public filters:ObservationFilterInterface[] = [
    {
      title: 'observation.filterBy.recordBasis',
      field: 'unit.recordBasis',
      pick: [
        'HUMAN_OBSERVATION_UNSPECIFIED',
        'PRESERVED_SPECIMEN'
      ],
      filter: 'recordBasis',
      type: 'array',
      selected:[]
    },
    {
      title: 'observation.filterBy.image',
      field: 'unit.media.mediaType',
      pick: [
        'IMAGE'
      ],
      booleanMap: {
        'IMAGE': true
      },
      size: 10,
      filter: 'hasUnitMedia',
      type: 'boolean',
      selected:[]
    },
    {
      title: 'observation.filterBy.collectionId',
      field: 'document.collectionId',
      size: 10,
      filter: 'collectionId',
      type: 'array',
      selected:[],
      map: this.fetchCollectionName.bind(this)
    }
  ];

  constructor(
    public searchQuery: SearchQuery,
    private location:Location,
    private autocompleteService:AutocompleteApi,
    private translate: TranslateService,
    public collectionService: CollectionApi
  ) {
    this.dataSource = Observable.create((observer:any) => {
      observer.next(this.formQuery.taxon);
    }).mergeMap((token:string) => this.getTaxa(token));
  }

  public getTaxa(token:string):Observable<any> {
    return this.autocompleteService.autocompleteFindByField(
      'taxon',
      token,
      '' + this.limit,
      true,
      this.translate.currentLang
    )
  }

  ngOnInit() {
    this.empty(false, this.searchQuery.query);
    this.subUpdate = this.searchQuery.queryUpdated$.subscribe(
      res => {
        if (res && res.formSubmit) {
          this.onSubmit(false);
        }
      })
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
  }

  updateTime(dates) {
    if (dates === 365) {
      let today = new Date();
      let oneJan = new Date(today.getFullYear(),0,1);
      dates = Math.ceil(((+today) - (+oneJan)) / 86400000) - 1;
    }
    let today = moment();
    this.formQuery.timeStart = today.subtract(dates, "days").format(DATE_FORMAT);
    this.onSubmit();
  }

  empty(refresh:boolean, query?:WarehouseQueryInterface) {
    if (query) {
      this.queryToFormQuery(query);
      return;
    }
    this.searchQuery.query.coordinates = undefined;
    this.formQuery = {
      taxon:'',
      timeStart:'',
      timeEnd:'',
      informalTaxonGroupId:''
    };
    this.filters.map((filter, idx) => {
      this.filters[idx]['selected'] = [];
    });
    if (refresh) {
      this.onSubmit();
    }
  }

  private queryToFormQuery(query:WarehouseQueryInterface) {
    let time = query.time && query.time[0] ? query.time && query.time[0].split('/') : [];
    this.formQuery = {
      taxon: query.target && query.target[0] ? query.target[0] : '',
      timeStart: time[0] || '',
      timeEnd: time[1] || '',
      informalTaxonGroupId: query.informalTaxonGroupId && query.informalTaxonGroupId[0] ?
        query.informalTaxonGroupId[0] : ''
    };
    this.filters.map((filterSet, idx) => {
      let queryFilter = filterSet.filter;
      this.filters[idx].selected = [];
      if (typeof query[queryFilter] === "undefined") {
        return;
      }
      switch (filterSet.type) {
        case 'array':
          this.filters[idx].selected = query[queryFilter];
          break;
        case 'boolean':
          if (filterSet.booleanMap) {
            for(let key in filterSet.booleanMap) {
              if (!filterSet.booleanMap.hasOwnProperty(key)) {
                continue;
              }
              if (query[queryFilter] === filterSet.booleanMap[key]) {
                this.filters[idx].selected.push(key);
              }
            }
          } else {
            this.filters[idx].selected = [(query[queryFilter] ? 'true' : 'false')];
          }
      }
    })
  }

  private formQueryToQuery(formQuery:ObservationFormQuery) {
    let taxon = formQuery.taxon;
    let time = this.parseDate(formQuery.timeStart, formQuery.timeEnd);
    let query = this.searchQuery.query;

    query.target = taxon.length > 0 ?
      [taxon] : undefined;
    query.time = time.length > 0 ?
      [time] : undefined;
    query.informalTaxonGroupId = formQuery.informalTaxonGroupId ?
      [formQuery.informalTaxonGroupId] : undefined;

    this.filters.map((filterSet) => {
      let queryFilter = filterSet.filter;
      if (filterSet.selected.length == 0) {
        query[queryFilter] = undefined;
        return;
      }
      if (filterSet.type === 'array') {
        query[queryFilter] = filterSet.selected;
      } else if (filterSet.type === 'boolean') {
        filterSet.selected.map((value) => {
          if (filterSet.booleanMap) {
            query[queryFilter] = filterSet.booleanMap[value];
          } else {
            query[queryFilter] = value && value !== 'false' ? true : false;
          }
        })
      }
    });
  }

  private parseDate(start, end) {
    if (start || end) {
      end = end || moment().format(DATE_FORMAT);
      start = start || moment().format(DATE_FORMAT);
    } else {
      return '';
    }
    return start + '/' + end;
  }

  fetchCollectionName(data) {
    return this.collectionService.findAll(
      this.translate.currentLang,
      data.map(col => IdService.getId(col.value)).join(',')
    ).map(res => {
      let lookUp = {};
      res.results.map((collection:Collection) => {
        lookUp[IdService.getUri(collection.id)] = collection.collectionName;
      });
      return data.map(col => {
        col['label'] = lookUp[col['value']];
        return col;
      });
    });
  }

  onSubmit(updateQuery = true) {
    this.formQueryToQuery(this.formQuery);
    this.searchQuery.updateUrl(this.location, undefined, [
      'selected',
      'pageSize',
      'includeNonValidTaxons'
    ]);
    if (updateQuery) {
      this.searchQuery.queryUpdate({});
    }
    return false;
  }

  onFilterSelect() {
    this.onSubmit();
  }

  public changeTypeaheadLoading(e:boolean):void {
    this.typeaheadLoading = e;
  }

  public typeaheadOnSelect(e:any):void {
    console.log('Selected value: ',e.item);
  }

}
