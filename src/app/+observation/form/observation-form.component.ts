import {Component, OnInit, Input} from '@angular/core';
import {FORM_DIRECTIVES}   from '@angular/forms';
import {Location, NgModel} from "@angular/common";

import {SearchQuery} from "../search-query.model";
import {ObservationCountComponent} from "../count/observation-cont.component";
import {WarehouseQueryInterface} from "../../shared/model/WarehouseQueryInterface";
import {ObservationChartComponent} from "../chart/observation-chart.component";
import {ObservationResultComponent} from "../result-tabs/observation-result.component";
import {Observable} from "rxjs";
import {TYPEAHEAD_DIRECTIVES} from "ng2-bootstrap";
import {AutocompleteApi} from "../../shared/api/AutocompleteApi";
import {TranslateService} from "ng2-translate";
import {ObservationFilterComponent} from "../filters/observation-filters.component";
import {ObservationFilterInterface, FilterDataInterface} from "../filters/observation-filters.interface";
import {DatePickerComponent} from "../../shared/datepicker/datepicker.component";
import {ObservationFormQuery} from "./observation-form-query.interface";

@Component({
  selector: 'laji-observation-form',
  templateUrl: 'observation-form.component.html',
  providers: [AutocompleteApi],
  directives: [
    ObservationCountComponent,
    ObservationChartComponent,
    ObservationResultComponent,
    ObservationFilterComponent,
    TYPEAHEAD_DIRECTIVES,
    FORM_DIRECTIVES
  ]
})
export class ObservationFormComponent implements OnInit {

  public limit = 10;
  public formQuery:ObservationFormQuery;
  public dataSource:Observable<any>;
  public typeaheadLoading:boolean = false;
  @Input() tab:string;

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
        'IMAGE',
        ''
      ],
      valueMap: {
        '': 'NO_IMAGE'
      },
      booleanMap: {
        'NO_IMAGE': false,
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
      selected:[]
    }
  ];

  constructor(
    public searchQuery: SearchQuery,
    private location:Location,
    private autocompleteService:AutocompleteApi,
    private translate: TranslateService
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
  }

  updateTime(dates) {
    if (dates === 365) {
      let today = new Date();
      let oneJan = new Date(today.getFullYear(),0,1);
      dates = Math.ceil(((+today) - (+oneJan)) / 86400000);
    }
    this.formQuery.timeStart = '-' + dates + '/0';
    this.onSubmit();
  }

  empty(refresh:boolean, query?:WarehouseQueryInterface) {
    if (query) {
      this.queryToFormQuery(query);
      return;
    }
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
    let taxon = formQuery.taxon.trim();
    let time = formQuery.timeStart.trim();
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

  onSubmit() {
    this.formQueryToQuery(this.formQuery);
    this.searchQuery.updateUrl(this.location, undefined, [
      'selected',
      'pageSize',
      'includeNonValidTaxons'
    ]);
    this.searchQuery.queryUpdate();

    return false;
  }

  onFilterSelect(itemValue:FilterDataInterface) {
    this.onSubmit();
  }

  public changeTypeaheadLoading(e:boolean):void {
    this.typeaheadLoading = e;
  }

  public typeaheadOnSelect(e:any):void {
    console.log('Selected value: ',e.item);
  }

}
