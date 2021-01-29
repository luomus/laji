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
import { interval as ObservableInterval, Subject, Subscription } from 'rxjs';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { FilterService } from '../../../shared/service/filter.service';
import { Router, ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';

export interface SelectOptions {
  id: string;
  value: string;
  category: string;
  info?: string;
  checkboxValue: boolean|undefined;
}

@Component({
  selector: 'laji-select-subcategories',
  templateUrl: './select-subcategories.component.html',
  styleUrls: ['./select-subcategories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSubcategoriesComponent implements OnInit, OnChanges, OnDestroy {
  private unsubscribe$ = new Subject<null>();

  @Input() options: [{[key: string]: SelectOptions[]}];
  @Input() title: string;
  @Input() filterPlaceHolder = 'Search...';
  @Input() useFilter = true;
  @Input() selected: object = {id: [], category: undefined};
  @Input() open = false;
  @Input() disabled = false;
  @Input() outputOnlyId = false;
  @Output() selectedChange = new EventEmitter<object>();
  @Input() multiple = true;
  @Input() info: string;
  @Input() loading = false;
  @Input() subCategories = [];
  @Input() subTitleBase = '';
  @Input() filtersName = [];
  @Input() filtersValues = [];
  @ViewChild('filter') filter: ElementRef;

  @Output() update = new EventEmitter<{id: string[] | string, category: string}>();

  selectedOptions = {};
  unselectedOptions = {};
  tmpSelectedOption = {};
  filterInput = new Subject<string>();
  filterBy: string;
  selectedIdx = [];
  parentTitle: string;
  status = {};
  tmpSelected = {};
  typeCheckbox = 2;

  constructor(
    private cd: ChangeDetectorRef,
    private filterService: FilterService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.filterInput
      .asObservable().pipe(
        takeUntil(this.unsubscribe$),
        debounceTime(200)
      )
      .subscribe((value) => {
        this.filterBy = value;
        this.cd.markForCheck();
      });
  }

  ngOnChanges() {
    if (this.disabled) {
      this.selected = [];
      this.open = false;
    }

    if (this.filtersValues.every(element => element === undefined)) {
      this.selected = [];
      this.tmpSelectedOption = [];
      this.selectedOptions = [];
    }
    this.initOptions(Object.keys(this.selected).length > 0 && this.selected !== undefined ? this.selected : this.buildSelectedOptions(this.filtersName));
    this.selected = Object.keys(this.tmpSelectedOption).length === 0 && this.tmpSelectedOption.constructor === Object ? this.selected : this.tmpSelectedOption;
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toggleValue(id: string, category: string) {
    this.selected = Object.keys(this.tmpSelectedOption).length === 0 && this.tmpSelectedOption.constructor === Object ? this.selected : this.tmpSelectedOption;
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
      if (typeof this.selected !== 'object' || this.selected === null) {
        this.selected = {};
      }
      this.selected[category] = [...this.selected[category] || [], id];
      if (category === 'GLOBAL') {
        this.subCategories.forEach(element => {
          if (element !== 'GLOBAL' && this.selected[element]) {
            this.selected[element] = this.selected[element].indexOf(id) === -1 ?  [...this.selected[element] || [], id] : [...this.selected[element]];
          }
        });
      }
    } else {
      this.selected[category] = id;
      if (category === 'GLOBAL') {
        this.subCategories.forEach(element => {
          if (element !== 'GLOBAL') {
            this.selected[element] = id;
          }
        });
      }
    }

    this.emitSelectedOptions(category);
  }

  remove(id: string, category: string) {
    this.selected[category] = this.selected[category].filter(value => value !== id);
    if (category === 'GLOBAL') {
      this.subCategories.forEach(element => {
        if (element !== 'GLOBAL') {
          this.selected[element] = this.selected[element].filter(value => value !== id);
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
      ObservableInterval(10).pipe(takeUntil(this.unsubscribe$), take(1))
        .subscribe(() => {
          try {
            // No IE support
            el.focus();
          } catch (e) { }
        });
    }
    this.selected = Object.keys(this.tmpSelectedOption).length === 0 && this.tmpSelectedOption.constructor === Object ? this.selected : this.tmpSelectedOption;
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
        this.initOptions(this.selected);
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
    if (!this.options || !this.selected) {
      return;
    }
    // this.selectedOptions = [];
    if (!selected) {
      this.unselectedOptions = [];
      return;
    }

  for (const i in this.selected) {
    this.selectedOptions[i] = [];
    this.unselectedOptions[i] = [];
    const countObj = this.selected[i].filter(item => item.checkboxValue === true).length;
    this.options[i].map(option => {
      if (countObj > 0) {
        selected[i].map(item => {
          if (item.id === option.id) {
            this.selectedOptions[i].push({...option, 'checkboxValue': item.checkboxValue});
          } else {
            this.unselectedOptions[i].push({...option, 'checkboxValue': item.checkboxValue});
          }
        });
      } else {
        if (selected[i].includes(option.id)) {
          if (!this.selectedOptions[i]) {
            this.selectedOptions[i] = option.id;
          } else {
            this.selectedOptions[i].push(option.id);
          }
        } else {
          if (!this.unselectedOptions[i]) {
            this.unselectedOptions[i] = option.id;
          } else {
            this.unselectedOptions[i].push(option.id);
          }
        }
      }
    });
  }

  }


  private checkSubcategoriesExceptGlobalAreEquals(selected) {
    const keys = Object.keys(selected);
    const filteredKeys = keys.filter(item => item !== 'GLOBAL');

    if (filteredKeys.length < this.subCategories.length - 1) {
      return false;
    }

    let countEmpty = 0;
    for (let i = 0; i < filteredKeys.length; i++) {
      if (selected[filteredKeys[i]].length === 0 || selected[filteredKeys[i]] === undefined) {
        countEmpty++;
      }
    }

    if (countEmpty === filteredKeys.length) {
      this.selected['GLOBAL'].map(x => x.checkboxValue = undefined);
      return false;
    }

    for (let i = 0; i < filteredKeys.length - 1; i++) {
        if (!this.arrayEquals(selected[filteredKeys[i]], selected[filteredKeys[i + 1]])) {
        return false;
      }
    }
    return true;
  }


  private arrayEquals(a, b) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val) => b.indexOf(val) > -1);
  }

  private buildSelectedOptions(filters) {
    const tmpOptions = this.options;
    this.activatedRoute.queryParams.subscribe(params => {
      const param = params[filters[0]] ? params[filters[0]] : (params[filters[1]] ? params[filters[1]] : undefined);
      if (Object.keys(this.options).length > 0) {
        if (param) {
          if (!param.includes(':')) {
            const splitParamGlobal = param.split(',');
            this.loopInsideOptions(this.subCategories, this.options, splitParamGlobal, false);
          } else {
            const splitParamCategories = this.rubuiltParamSubCategory(param);
            this.loopInsideOptions(this.subCategories, this.options, splitParamCategories, true);
          }
        } else {
          this.unselectedOptions = this.unselectedOptions ? this.unselectedOptions : [];
        }
      }
    });
  }

  private rubuiltParamSubCategory(urlString) {
     const rebuilt = urlString.slice(0, -1).split(';');
     const finalRebuilt = [];

     rebuilt.forEach((element, index) => {
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
      for (const option of options[category]) {
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
      options['GLOBAL'].map(option => {
        let checkMatches = 0;
        subCategories.forEach(element => {
          if (this.selectedOptions[element].indexOf(option.id) > -1) {
            checkMatches++;
          }
        });

        if (checkMatches > 0) {
            this.selectedOptions['GLOBAL'].push({...option, 'checkboxValue': checkMatches === subCategories.length ?
            true : false });
            this.tmpSelectedOption['GLOBAL'].push({...option, 'checkboxValue': checkMatches === subCategories.length ?
            true : false });
        }

        if (checkMatches === 0) {
          this.unselectedOptions['GLOBAL'].push({...option, 'checkboxValue': undefined});
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

      this.selected[category] = this.tmpSelected[category];
      this.selectedIdx[category] = -1;

      const tmpGlobalSelect = this.selected['GLOBAL'] ? this.selected['GLOBAL'].map(obj => {
        const newObj = Object.assign({}, obj);
        newObj.checkboxValue = true;
        return newObj;
      }) : [];
      this.selected['GLOBAL'] = this.checkSubcategoriesExceptGlobalAreEquals(this.selected) ?
      tmpGlobalSelect : (this.selected['GLOBAL'] ? this.selected['GLOBAL'] : []);


      this.initOptions(this.selected);
      if (this.outputOnlyId) {
        this.selectedChange.emit(this.selectedOptions);
      } else {
        this.selectedChange.emit(this.selectedOptions);
      }


  }

  selectedOptionsIsEmpty(obj) {
    if (!obj) {
      return true;
    }

    return Object.keys(obj).length === 0;
  }


  refreshValue(value: any, category: string): void {
    if (!value) {
      return;
    }

    this.selectedOptions[category] = value;
    const categoriesExcludeGlobal = this.subCategories.filter(item => item !== 'GLOBAL');
    if (category === 'GLOBAL') {
      this.options['GLOBAL'].map(option => {
        let count = 0;
        categoriesExcludeGlobal.forEach(cat => {
          if (this.selectedOptions && this.selectedOptions['GLOBAL'] !== undefined &&
          this.selectedOptions[cat] && this.selectedOptions[cat].indexOf(option.id) > -1) {
            count++;
          }
        });
        if (count === categoriesExcludeGlobal.length) {
          categoriesExcludeGlobal.forEach(item => {
              if (this.selectedOptions[item].indexOf(option.id) > -1 && this.selectedOptions['GLOBAL'].findIndex(x => x.id === option.id) === -1) {
                this.selectedOptions[item].splice(this.selectedOptions[item].indexOf(option.id), 1);
                this.selected[item].splice(this.selected[item].indexOf(option.id), 1);
              }
              if (this.selected['GLOBAL']) {
                this.selected['GLOBAL'].splice(this.selected['GLOBAL'].findIndex(x => x.id === option.id), 1);
              }
          });
        } else {
            categoriesExcludeGlobal.forEach(item => {
                if (this.selectedOptions[item] && this.selectedOptions[item].indexOf(option.id) === -1 &&
                  this.selectedOptions['GLOBAL'] !== undefined && this.selectedOptions['GLOBAL'].findIndex(x => x.id === option.id) > -1 &&
                  this.selectedOptions['GLOBAL'][this.selectedOptions['GLOBAL'].findIndex(x => x.id === option.id)]?.checkboxValue === true) {
                  this.selectedOptions[item].push(option.id);
                  this.selected[item].push(option.id);
                }
            });
        }
      });
    } else {
      this.selectedOptions['GLOBAL'] = [];
      this.options['GLOBAL'].map(option => {
        let countNoGlobal = 0;
        categoriesExcludeGlobal.forEach(cat => {
          if (this.selectedOptions[cat] && this.selectedOptions[cat].indexOf(option.id) > -1 &&
              this.selectedOptions['GLOBAL'] !== undefined && this.selectedOptions['GLOBAL'] !== []
              && this.selectedOptions['GLOBAL'].findIndex(x => x.id === option.id) === -1) {
            countNoGlobal++;
          }
        });

        if (this.selectedOptions['GLOBAL'] !== undefined && this.selectedOptions['GLOBAL'] !== []) {
          this.selectedOptions['GLOBAL'].push(
            {...option, checkboxValue: countNoGlobal === categoriesExcludeGlobal.length ?
              true : (countNoGlobal === 0 ? undefined : false)
            }
          );
        } else {
          this.selectedOptions['GLOBAL'] = [{...option, checkboxValue: countNoGlobal === categoriesExcludeGlobal.length ?
            true : (countNoGlobal === 0 ? undefined : false)
          }];
        }

        if (this.selected['GLOBAL'] !== undefined && this.selected['GLOBAL'] !== []) {
          this.selected['GLOBAL'].push(
            {...option, checkboxValue: countNoGlobal === categoriesExcludeGlobal.length ?
              true : (countNoGlobal === 0 ? undefined : false)
            }
          );
        } else {
          this.selected['GLOBAL'] = [{...option, checkboxValue: countNoGlobal === categoriesExcludeGlobal.length ?
            true : (countNoGlobal === 0 ? undefined : false)
          }];
        }

      });
    }

    this.cd.detectChanges();
    this.selectedChange.emit(this.selectedOptions);
  }

  emitSelectedOptions(cat)  {
    this.selectedIdx[cat] = -1;
    this.selected['GLOBAL'] = this.checkSubcategoriesExceptGlobalAreEquals(this.selected) ?
    this.selected[this.subCategories[1]] : (this.selected['GLOBAL'] ? this.selected['GLOBAL'] : []);

    this.initOptions(this.selected);
    if (this.outputOnlyId) {
      this.selectedChange.emit(this.selectedOptions);
    } else {
      this.selectedChange.emit(this.selectedOptions);
    }
  }

}

