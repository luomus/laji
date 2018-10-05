import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of as ObservableOf, Subscription } from 'rxjs';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { ResultService } from '../../service/result.service';
import { Taxonomy } from '../../../shared/model/Taxonomy';
import { Global } from '../../../../environments/global';

type SEASON = 'spring'|'fall'|'winter';

@Component({
  selector: 'laji-wbc-result',
  templateUrl: './wbc-result.component.html',
  styleUrls: ['./wbc-result.component.css']
})
export class WbcResultComponent implements OnInit, OnDestroy {

  informalTaxonGroup = 'MVL.1';
  collectionId = Global.collections.wbc;
  page;
  type;
  query: WarehouseQueryInterface;
  mapQuery: WarehouseQueryInterface;
  resultQuery: WarehouseQueryInterface;
  taxon$: Observable<Taxonomy>;

  year;
  currentDay;
  currentMonth;
  currentYear;
  startYear = 1956;
  startFall = 1025;
  endFall = 1221;
  startWinter = 1222;
  endWinter = 217;
  startSpring = 218; // 18.02.
  endSpring = 315; // 15.03.
  fromYear;
  fromMonth;
  years: number[] = [];
  seasons: SEASON[] = ['fall', 'winter', 'spring'];
  activeSeason: SEASON = 'spring';
  activeYear: number;

  aggregateFields = ['unit.linkings.species.vernacularName', 'unit.linkings.species.scientificName', 'individualCountSum'];
  listFields = ['unit.linkings.taxon', 'unit.linkings.taxon.scientificName', 'gathering.displayDateTime', 'gathering.team'];

  private subQuery: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private resultService: ResultService
  ) {
  }

  ngOnInit() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.currentDay = now.getDay();
    this.year = now.getFullYear() - 1;
    this.activeYear = this.currentYear;
    this.initYears();

    this.subQuery = this.route.queryParams.subscribe(params => {
      const time = (params['time'] && Array.isArray(params['time'])) ?
        params['time'][0] : params['time'];
      const taxonId = (params['taxonId'] && Array.isArray(params['taxonId'])) ?
        params['taxonId'][0] : params['taxonId'];
      this.query = {
        time: [this.parseDateTimeRange(time || '' + this.getCurrentSeason())],
        collectionId: [this.collectionId],
        informalTaxonGroupId: [this.informalTaxonGroup]
      };
      this.resultQuery = this.clone(this.query);
      if (taxonId) {
        this.query.taxonId = [taxonId];
        this.taxon$ = this.resultService.getTaxon(taxonId);
      } else {
        this.taxon$ = ObservableOf(null);
      }
      this.mapQuery = this.clone(this.query);
      if (params['grid']) {
        this.query.ykj10kmCenter = params['grid'];
      }
      this.type = params['type'] || 'count';
      this.page = +params['page'] || 1;
    });
  }

  ngOnDestroy() {
    this.subQuery.unsubscribe();
  }

  goToPage(page) {
    this.page = page;
    this.navigate(this.query);
  }

  closeList() {
    this.query.ykj10kmCenter = undefined;
    this.navigate(this.query);
  }

  onSelectedFieldsChange(fields, isList = false) {
    if (isList) {
      this.listFields = fields;
    } else {
      this.aggregateFields = fields;
    }
  }

  seasonChange(value) {
    this.router.navigate([], {queryParams: {time: this.getTimeRange(this.activeYear, value)}});
  }

  yearChange(year) {
    if (this.activeSeason === 'winter') {
      this.router.navigate([], {queryParams: {time: this.getTimeRange(year, this.activeSeason)}});
    } else if (this.activeSeason === 'fall') {
      this.router.navigate([], {queryParams: {time: this.getTimeRange(year, this.activeSeason)}});
    } else if (this.activeSeason === 'spring') {
      this.router.navigate([], {queryParams: {time: this.getTimeRange(year, this.activeSeason)}});
    }
  }

  changeLegendType(type) {
    this.type = type;
    this.navigate(this.query);
  }

  showGridObservations(query: WarehouseQueryInterface) {
    this.page = 1;
    this.navigate(query);
  }

  private initYears() {
    const now = this.currentMonth * 100 + this.currentDay;
    const startFrom = now >= this.startFall ? this.currentYear : (this.currentYear - 1);
    for (let i = startFrom; i >= this.startYear; i--) {
      this.years.push(i);
    }
  }

  private getCurrentSeason() {
    this.activeSeason = this.getSeason(this.currentMonth, this.currentDay);
    return this.getTime(this.currentYear, this.activeSeason) + '/';
  }

  private getSeason(month: number, day: number): SEASON {
    const now = month * 100 + day;
    if (now >= this.startWinter) {
      return 'winter';
    } else if (now >= this.startFall) {
      return 'fall';
    }
    return 'spring';
  }

  private getTimeRange(year, season: SEASON) {
    if (season === 'winter') {
      return this.getTime(year, season) + '/' + this.getTime((+year) + 1, season, false);
    } else if (season === 'spring') {
      return this.getTime((+year) + 1, season) + '/' + this.getTime((+year) + 1, season, false);
    }
    return this.getTime(year, season) + '/' + this.getTime(year, season, false);
  }

  private getTime(year, season: SEASON, start = true) {
    let date: number;
    if (season === 'winter') {
      date = start ? this.startWinter : this.endWinter;
    } else if (season === 'fall') {
      date = start ? this.startFall : this.endFall;
    } else {
      date = start ? this.startSpring : this.endSpring;
    }
    const day = date % 100;
    const month = Math.floor(date / 100);
    return year + '-' +
      (month < 10 ? '0' + month : month) + '-' +
      (day < 10 ? '0' + day : day);
  }

  private navigate(query: WarehouseQueryInterface) {
    this.router.navigate([], {queryParams: {
      grid: query.ykj10kmCenter,
      time: query.time,
      taxonId: query.taxonId,
      type: this.type,
      page: this.page
    }});
  }

  private clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private parseDateTimeRange(date) {
    const originalDate = date;
    this.emptyTime();
    if (!date || typeof date !== 'string') {
      return date;
    }
    const idx = date.indexOf('/');
    if (idx > -1) {
      date = date.substr(0, idx);
    }
    const time = this.parseDateTime(date);
    this.activeSeason = this.getSeason(time.month, time.day);
    this.activeYear = this.activeSeason === 'spring' ? time.year - 1 : time.year;

    return originalDate;
  }

  private parseDateTime(date): {year: number, month: number, day: number} {
    if (date.length === '4') {
      return {year: +date, month: 0, day: 0};
    }
    const month = +date.substr(5, 2);
    const day = +date.substr(8, 2);
    return {
      year: +date.substr(0, 4),
      month: month,
      day: day
    };
  }

  private emptyTime() {
    this.fromYear = '';
    this.fromMonth = '';
  }

}
