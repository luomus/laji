import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Subject, timer } from 'rxjs';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { FilterService } from '../../../shared/service/filter.service';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { SelectOptions as SelectComponentOptions } from '../select/select.component';
import { Util } from '../../../shared/service/util.service';

export interface SelectOptions extends SelectComponentOptions {
  category: string;
}

@Component({
  selector: 'laji-select-subcategories',
  templateUrl: './select-subcategories.component.html',
  styleUrls: ['./select-subcategories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSubcategoriesComponent implements OnInit, OnChanges, OnDestroy {
  private unsubscribe$ = new Subject<null>();

  @Input() query: WarehouseQueryInterface;
  @Input() options: SelectOptions[];
  @Input() title: string;
  @Input() filterPlaceHolder = 'Search...';
  @Input() useFilter = true;
  @Input() open = false;
  @Input() disabled = false;
  @Input() outputOnlyId = false;
  @Output() selectedChange = new EventEmitter<{ [key: string]: (SelectOptions | string)[] }>();
  @Input() multiple = true;
  @Input() info: string;
  @Input() loading = false;
  @Input() subCategories = [];
  @Input() subTitleBase = '';
  @Input() filtersName = [];
  @Input() filtersValues = [];
  @ViewChild('filter') filter: ElementRef;

  @Output() update = new EventEmitter<{ id: string[] | string, category: string }>();

  selectedOptions = <{ [key: string]: (SelectOptions | string)[] }>{};
  unselectedOptions = <{ [key: string]: (SelectOptions | string)[] }>{};
  tmpSelectedOption = <{ [key: string]: (SelectOptions | string)[] }>{};
  filterInput = new Subject<string>();
  filterBy: string;
  selectedIdx = [];
  parentTitle: string;
  status = {};
  tmpSelected = {};
  typeCheckbox = 2;

  constructor(
    private cd: ChangeDetectorRef,
    private filterService: FilterService
  ) { }

  ngOnInit() {
    this.filterInput.asObservable().pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(200)
      ).subscribe((value) => {
        this.filterBy = value;
        this.cd.markForCheck();
      });
  }

  ngOnChanges() {
    if (this.disabled) {
      this.selectedOptions = {};
      this.open = false;
    }

    if (this.filtersValues.every(element => element === undefined)) {
      this.selectedOptions = {};
      this.tmpSelectedOption = {};
      this.selectedOptions = {};
    }
    this.initOptions(this.selectedOptions !== undefined && Object.keys(this.selectedOptions).length > 0 ? this.selectedOptions : this.buildSelectedOptions());
    this.selectedOptions = Util.isEmptyObj(this.tmpSelectedOption) ? this.selectedOptions : this.tmpSelectedOption;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleValue(id: string, category: string) {
    this.selectedOptions = Util.isEmptyObj(this.tmpSelectedOption) ? this.selectedOptions : this.tmpSelectedOption;
    this.selectedIdx[category] = 0;
    if (!this.selectedOptions[category]) {
      this.add(id, category);
      return;
    }

    if (this.selectedOptions[category].indexOf(id) === -1) {
      this.add(id, category);
    } else {
      this.remove(id, category);
    }
  }

  add(id: string, category: string) {
    if (this.multiple) {
      if (typeof this.selectedOptions !== 'object' || this.selectedOptions === null) {
        this.selectedOptions = {};
      }
      this.selectedOptions[category] = [...this.selectedOptions[category] || [], id];
      if (category === 'GLOBAL') {
        this.subCategories.forEach(element => {
          if (element !== 'GLOBAL' && this.selectedOptions[element]) {
            this.selectedOptions[element] = this.selectedOptions[element].indexOf(id) === -1 ?
              [...this.selectedOptions[element] || [], id] : [...this.selectedOptions[element]];
          }
        });
      }
    } else {
      this.selectedOptions[category] = [id];
      if (category === 'GLOBAL') {
        this.subCategories.forEach(element => {
          if (element !== 'GLOBAL') {
            this.selectedOptions[element] = [id];
          }
        });
      }
    }

    this.emitSelectedOptions(category);
  }

  remove(id: string, category: string) {
    this.selectedOptions[category] = this.selectedOptions[category].filter(value => value !== id);
    if (category === 'GLOBAL') {
      this.subCategories.forEach(element => {
        if (element !== 'GLOBAL') {
          this.selectedOptions[element] = this.selectedOptions[element].filter(value => value !== id);
        }
      });
    }

    this.emitSelectedOptions(category);
  }

  toggle(event, el, typeCheckbox = 0) {
    if (event.target.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
    this.typeCheckbox = typeCheckbox;
    if (this.open && this.useFilter) {
      timer(10).pipe(takeUntil(this.unsubscribe$), take(1))
        .subscribe(() => {
          try {
            // No IE support
            el.focus();
          } catch (e) { }
        });
    }
    this.selectedOptions = Util.isEmptyObj(this.tmpSelectedOption) ? this.selectedOptions : this.tmpSelectedOption;
  }

  labelClick(event) {
    if (event.target.classList.contains('no-propagation')) {
      event.preventDefault();
    }
  }

  onFilterChange(event: KeyboardEvent, value, category) {
    switch (event.key) {
      case 'Esc':
        this.filterBy = '';
        this.initOptions(this.selectedOptions);
        return;
      case 'Enter':
        if (!this.filterBy && this.selectedIdx[category] === -1) {
          return;
        }
        const filterItems = this.filterService.filter(this.unselectedOptions, this.filterBy);
        if (this.selectedIdx[category] === -1) {
          if (filterItems.length > 0) {
            this.add(filterItems[0].id, category);
          }
        } else if (filterItems[this.selectedIdx[category]]) {
          this.add(filterItems[this.selectedIdx[category]].id, category);
        }
        return;
      case 'ArrowUp':
        if (this.selectedIdx[category] <= 0) {
          this.selectedIdx[category] = this.unselectedOptions[category].length - 1;
        } else {
          this.selectedIdx[category]--;
        }
        return;
      case 'ArrowDown':
        if (this.selectedIdx[category] >= this.unselectedOptions[category].length - 1) {
          this.selectedIdx[category] = 0;
        } else {
          this.selectedIdx[category]++;
        }
        return;
      default:
        this.selectedIdx[category] = -1;
    }
    this.filterInput.next(value);
  }

  track(idx, item) {
    return item.id;
  }

  private initOptions(selected) {
    if (!this.options || !this.selectedOptions) {
      return;
    }
    if (!selected) {
      this.unselectedOptions = {};
      return;
    }

    for (const i in this.selectedOptions) {
      if (!this.selectedOptions.hasOwnProperty(i)) {
        continue;
      }
      let tmpSelectedOptions = [];
      let tmpUnselectedOptions = [];
      const countObj = this.selectedOptions[i].filter((item: SelectOptions) => item.id !== undefined).length;
      this.options.map(option => {
        if (countObj > 0) {
          selected[i].map(item => {
            if (item.id === option.id) {
              tmpSelectedOptions.push({ ...option, 'checkboxValue': item.checkboxValue });
            } else {
              tmpUnselectedOptions.push({ ...option, 'checkboxValue': item.checkboxValue });
            }
          });
        } else {
          if (selected[i].includes(option.id)) {
            if (!this.selectedOptions[i]) {
              tmpSelectedOptions = [option.id];
            } else {
              tmpSelectedOptions.push(option.id);
            }
          } else {
            if (!this.unselectedOptions[i]) {
              tmpUnselectedOptions = [option.id];
            } else {
              tmpUnselectedOptions.push(option.id);
            }
          }
        }
      });
      this.selectedOptions[i] = tmpSelectedOptions;
      this.unselectedOptions[i] = tmpUnselectedOptions;
    }

  }


  private checkSubcategoriesExceptGlobalAreEquals(selected) {
    const keys = Object.keys(selected);
    const filteredKeys = keys.filter(item => item !== 'GLOBAL');

    if (filteredKeys.length < this.subCategories.length - 1) {
      return this.buildGlobalOptions(this.selectedOptions, filteredKeys, false);
    }

    let countEmpty = 0;
    for (let i = 0; i < filteredKeys.length; i++) {
      if (selected[filteredKeys[i]].length === 0 || selected[filteredKeys[i]] === undefined) {
        countEmpty++;
      }
    }

    if (countEmpty === filteredKeys.length) {
      return this.buildGlobalOptions(this.selectedOptions, filteredKeys, undefined);
    }

    for (let i = 0; i < filteredKeys.length - 1; i++) {
      if (!this.arrayEquals(selected[filteredKeys[i]], selected[filteredKeys[i + 1]])) {
        return this.buildGlobalOptions(this.selectedOptions, filteredKeys, false);
      }
    }
    return this.buildGlobalOptions(this.selectedOptions, filteredKeys, true);
  }


  private arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val) => b.indexOf(val) > -1);
  }

  private buildSelectedOptions() {
    const tmpQueryParam = this.query[this.filtersName[0]] || this.query[this.filtersName[1]];

    const param = Array.isArray(tmpQueryParam) ? tmpQueryParam.join() : (tmpQueryParam ? tmpQueryParam : undefined);
    if (this.options && Object.keys(this.options).length > 0) {
      if (param) {
        if (!param.includes(':')) {
          const splitParamGlobal = param.split(',');
          this.loopInsideOptions(this.subCategories, this.options, splitParamGlobal, false);
        } else {
          const splitParamCategories = this.rebuiltParamSubCategory(param);
          this.loopInsideOptions(this.subCategories, this.options, splitParamCategories, true);
        }
      } else {
        this.unselectedOptions = this.unselectedOptions ? this.unselectedOptions : {};
      }
    }
  }

  private rebuiltParamSubCategory(urlString) {
    const rebuilt = urlString.slice(0, -1).split(';');
    const finalRebuilt = [];

    rebuilt.forEach((element) => {
      const subSplit = element.split(':');
      finalRebuilt[subSplit[0]] = subSplit[1].split(',');
    });

    return finalRebuilt;
  }

  private loopInsideOptions(subCategories, options, splitParam, excludeGlobal = false) {

    subCategories = excludeGlobal ? subCategories.filter(category => category !== 'GLOBAL') : subCategories;

    for (const category of subCategories) {
      this.selectedOptions[category] = [];
      this.unselectedOptions[category] = [];
      this.tmpSelectedOption[category] = [];
      for (const option of options) {
        if (
          splitParam[category] && splitParam[category].includes(option.id) ||
          (splitParam && splitParam.includes(option.id))
        ) {
          this.selectedOptions[category].push(category === 'GLOBAL' ? {...option, 'checkboxValue': true} : option.id);
          this.tmpSelectedOption[category].push(category === 'GLOBAL' ? {...option, 'checkboxValue': true} : option.id);
        } else {
          this.unselectedOptions[category].push(category === 'GLOBAL' ? {...option, 'checkboxValue': undefined} : option.id);
        }

      }
    }

    if (excludeGlobal) {
      this.selectedOptions['GLOBAL'] = [];
      this.unselectedOptions['GLOBAL'] = [];
      this.tmpSelectedOption['GLOBAL'] = [];
      options.map(option => {
        let checkMatches = 0;
        subCategories.forEach(element => {
          if (this.selectedOptions[element].indexOf(option.id) > -1) {
            checkMatches++;
          }
        });

        if (checkMatches > 0) {
          this.selectedOptions['GLOBAL'].push({ ...option, 'checkboxValue': checkMatches === subCategories.length });
          this.tmpSelectedOption['GLOBAL'].push({ ...option, 'checkboxValue': checkMatches === subCategories.length });
        }

        if (checkMatches === 0) {
          this.unselectedOptions['GLOBAL'].push({ ...option, 'checkboxValue': undefined });
        }
      });
    }

    return this.selectedOptions;

  }

  toggleSubCategories(category, categorySelected, options) {
    this.tmpSelected[category] = [];

    if (!categorySelected || categorySelected.length === 0) {
      options.map(option => {
        if (this.tmpSelected[category] && this.tmpSelected[category].indexOf(option.id) === -1) {
          this.tmpSelected[category].push(option.id);
        }
      });
    } else {
      if (categorySelected.length === Object.keys(options).length) {
        options.map(option => {
          if (this.tmpSelected[category] && this.tmpSelected[category].indexOf(option.id) > -1) {
            this.tmpSelected[category].splice(this.tmpSelected[category].indexOf(option.id), 1);
          }
        });
      } else {
        options.map(option => {
          if (this.tmpSelected[category] && this.tmpSelected[category].indexOf(option.id) === -1) {
            this.tmpSelected[category].push(option.id);
          }
        });
      }
    }

    this.selectedOptions[category] = this.tmpSelected[category];
    this.selectedIdx[category] = -1;

    this.checkSubcategoriesExceptGlobalAreEquals(this.selectedOptions);

    this.initOptions(this.selectedOptions);
    this.selectedChange.emit(this.selectedOptions);
  }

  refreshValue(value: any, category: string): void {
    if (!value) {
      return;
    }

    const globalOld = this.selectedOptions['GLOBAL'];
    const selectedOptionsDiff = this.arrayDiff(globalOld, value);
    this.selectedOptions[category] = value;
    const categoriesExcludeGlobal = this.subCategories.filter(item => item !== 'GLOBAL');
    if (category === 'GLOBAL') {
      this.options.map((option: any) => {
        let count = 0;
        categoriesExcludeGlobal.forEach(cat => {
          if (this.selectedOptions && this.selectedOptions['GLOBAL'] !== undefined &&
            this.selectedOptions[cat]?.indexOf(option.id) > -1 && selectedOptionsDiff?.findIndex(item => item.id === option.id) > -1) {
            count++;
          }
        });
        if (count === categoriesExcludeGlobal.length) {
          categoriesExcludeGlobal.forEach(item => {
            if (this.selectedOptions[item]?.indexOf(option.id) > -1 && this.selectedOptions['GLOBAL'].findIndex((x: SelectOptions) => x.id === option.id) === -1) {
              this.selectedOptions[item].splice(this.selectedOptions[item].indexOf(option.id), 1);
            }
            if (this.selectedOptions['GLOBAL'] && selectedOptionsDiff?.findIndex(el => el.checkboxValue === option.id) > -1) {
              this.selectedOptions['GLOBAL'].splice(this.selectedOptions['GLOBAL'].findIndex((x: SelectOptions) => x.id === option.id), 1);
            }
          });
        } else {
          categoriesExcludeGlobal.forEach(item => {
            if ((this.selectedOptions[item] === undefined || this.selectedOptions[item]?.indexOf(option.id) === -1) &&
              this.selectedOptions['GLOBAL'] !== undefined && this.selectedOptions['GLOBAL'].findIndex((x: SelectOptions) => x.id === option.id) > -1 &&
              this.selectedOptions['GLOBAL'][this.selectedOptions['GLOBAL'].findIndex((x: SelectOptions) => x.id === option.id)]['checkboxValue'] === true) {
              this.selectedOptions[item] ? this.selectedOptions[item].push(option.id) : this.selectedOptions[item] = [option.id];
            }
          });
        }
      });
    } else {
      this.selectedOptions['GLOBAL'] = [];
      let tmpGlobal = [];
      this.options.map((option: any) => {
        let countNoGlobal = 0;
        categoriesExcludeGlobal.forEach(cat => {
          if (this.selectedOptions[cat]?.indexOf(option.id) > -1 &&
            this.selectedOptions['GLOBAL'] !== undefined && this.selectedOptions['GLOBAL'] !== [] &&
            this.selectedOptions['GLOBAL'].findIndex((x: SelectOptions) => x.id === option.id) === -1
          ) {
            countNoGlobal++;
          }
        });

        tmpGlobal = this.getSelectedGlobalOptions(this.selectedOptions['GLOBAL'], option, countNoGlobal, categoriesExcludeGlobal);
      });
      this.selectedOptions['GLOBAL'] = tmpGlobal;
    }

    this.cd.detectChanges();
    this.selectedChange.emit(this.selectedOptions);
  }

  emitSelectedOptions(cat) {
    this.selectedIdx[cat] = -1;
    this.checkSubcategoriesExceptGlobalAreEquals(this.selectedOptions);

    this.initOptions(this.selectedOptions);
    this.selectedChange.emit(this.selectedOptions);
  }

  getSelectedGlobalOptions(selectedOptionsGlobal, option, noGlobalOptionsSum, categoriesNoGlobal) {
    const checkboxValue = noGlobalOptionsSum === categoriesNoGlobal.length ?
      true : (noGlobalOptionsSum === 0 ? undefined : false);

    if (!Array.isArray(selectedOptionsGlobal)) {
      selectedOptionsGlobal = [];
    }
    selectedOptionsGlobal.push({ ...option, checkboxValue });

    return selectedOptionsGlobal;
  }

  buildGlobalOptions(selectedOptions, categories, equals) {
    const oldGlobalOptions = [];
    this.selectedOptions['GLOBAL']?.forEach((filter: SelectOptions) => {
      if (filter.checkboxValue === true) {
        oldGlobalOptions.push(filter.id);
      }
    });
    this.selectedOptions['GLOBAL'] = [];
    const tmpCat = [];

    if (equals === false) {
      for (let i = 0; i < categories.length; i++) {
        selectedOptions[categories[i]].map(item => {
          const index = tmpCat.findIndex(el => el.id === item);
          if (index > -1) {
            tmpCat[index]['count'] += 1;
          } else {
            tmpCat.push({ 'id': item, 'count': 1 });
          }
        });
      }

      this.options.map(item => {
        const checkboxValue = tmpCat.some(el => (el.id === item.id && el.count === this.subCategories.length - 1)) ?
          true : (tmpCat.some(el => (el.id === item.id && el.count > 0)) ? false : undefined);

        this.selectedOptions['GLOBAL'].push({ ...item, checkboxValue });
      });
    } else {
      this.options.map(item => {
        this.selectedOptions['GLOBAL'].push({ ...item, 'checkboxValue': equals === true ? true : undefined });
      });
    }
  }

  arrayDiff(a, b) {
    a = a === undefined ? [] : a;
    if (b.length >= a.length) {
      return b.filter(item1 => !a.some(item2 => (item2.id === item1.id)));
    } else {
      return a.filter(item1 => !b.some(item2 => (item2.id === item1.id)));
    }
  }

}

