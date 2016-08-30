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
  public formQuery:ObservationFormQuery = {
    taxon:'',
    timeStart:'2010-10-10',
    timeEnd:'2010-12-10',
    informalTaxonGroupId:''
  };
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

  toggle(field:string) {
    this.formQuery[field] = !this.formQuery[field];
    this.onSubmit();
  }

  empty(refresh:boolean, query?:WarehouseQueryInterface) {
    if (query) {
      this.queryToFormQuery(query);
      return;
    }
    this.formQuery = {
      taxon:'',
      timeStart:'2010-10-10',
      timeEnd:'10.10.2010',
      informalTaxonGroupId:''
    };
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
      informalTaxonGroupId: query.informalTaxonGroupId && query.recordBasis[0] ?
        query.recordBasis[0] : ''
    };
  }

  private formQueryToQuery(formQuery:ObservationFormQuery) {
    let taxon = formQuery.taxon.trim();
    let time = formQuery.timeStart.trim();

    this.searchQuery.query.target = taxon.length > 0 ?
      [taxon] : undefined;
    this.searchQuery.query.time = time.length > 0 ?
      [time] : undefined;
    this.searchQuery.query.informalTaxonGroupId = formQuery.informalTaxonGroupId ?
      [formQuery.informalTaxonGroupId] : undefined;

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

  onFilterUpdate(filters:ObservationFilterInterface) {
    let index = -1;
    this.filters.map((filter, idx) => {
      if (filter.field !== filters.field) {
        return;
      }
      index = idx;
    });
    if (index > -1) {
      this.filters[index] = filters;
    }
  }

  public changeTypeaheadLoading(e:boolean):void {
    this.typeaheadLoading = e;
  }

  public typeaheadOnSelect(e:any):void {
    console.log('Selected value: ',e.item);
  }

}
