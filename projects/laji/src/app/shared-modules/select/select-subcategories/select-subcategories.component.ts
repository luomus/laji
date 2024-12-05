import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild
} from '@angular/core';
import { Subject } from 'rxjs';
import { WarehouseQueryInterface } from '../../../shared/model/WarehouseQueryInterface';
import { SelectOption as SelectComponentOptions } from '../select/select.component';
import { Util } from '../../../shared/service/util.service';
import { CheckboxType } from '../checkbox/checkbox.component';

export interface SelectOptions extends SelectComponentOptions {
  category: string;
}

@Component({
  selector: 'laji-select-subcategories',
  templateUrl: './select-subcategories.component.html',
  styleUrls: ['./select-subcategories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSubcategoriesComponent implements OnChanges {

  @Input() query!: WarehouseQueryInterface;
  @Input() options!: SelectComponentOptions[];
  @Input() title?: string;
  @Input() open = false;
  @Input() disabled = false;
  @Input() outputOnlyId = false;
  @Output() selectedChange = new EventEmitter<{ [key: string]: (SelectComponentOptions | string)[] }>();
  @Input() multiple = true;
  @Input() info?: string;
  @Input() loading = false;
  @Input() subCategories = [];
  @Input() subTitleBase = '';
  @Input() filtersName: (keyof WarehouseQueryInterface)[] = [];
  @Input() filtersValues: string[] = [];
  @ViewChild('filter') filter?: ElementRef;

  @Output() update = new EventEmitter<{ id: string[] | string; category: string }>();

  selectedOptions = <{ [key: string]: (SelectComponentOptions | string)[] }>{};
  unselectedOptions = <{ [key: string]: (SelectComponentOptions | string)[] }>{};
  tmpSelectedOption = <{ [key: string]: (SelectComponentOptions | string)[] }>{};
  filterInput = new Subject<string>();
  filterBy?: string;
  selectedIdx: number[] = [];
  parentTitle?: string;
  status = {};
  tmpSelected: Record<string, any> = {};
  typeCheckbox = 2;
  checkBoxTypes = CheckboxType;

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

  toggleValue(id: string, category: string) {
    this.selectedOptions = Util.isEmptyObj(this.tmpSelectedOption) ? this.selectedOptions : this.tmpSelectedOption;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.selectedIdx![category as any] = 0;
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

  toggle(event: any, el: any, typeCheckbox = 0) {
    if (event.target.classList.contains('no-propagation')) {
      return;
    }
    this.open = !this.open;
    this.typeCheckbox = typeCheckbox;
    this.selectedOptions = Util.isEmptyObj(this.tmpSelectedOption) ? this.selectedOptions : this.tmpSelectedOption;
  }

  labelClick(event: any) {
    if (event.target.classList.contains('no-propagation')) {
      event.preventDefault();
    }
  }

  private initOptions(selected: any) {
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
      let tmpSelectedOptions: any[] = [];
      let tmpUnselectedOptions: any[] = [];
      const countObj = this.selectedOptions[i].filter(
        (item: SelectComponentOptions | string) => typeof item !== 'string' && item.id !== undefined
      ).length;
      this.options.map(option => {
        if (countObj > 0) {
          selected[i].map((item: any) => {
            if (item.id === option.id) {
              tmpSelectedOptions.push({ ...option, checkboxValue: item.checkboxValue });
            } else {
              tmpUnselectedOptions.push({ ...option, checkboxValue: item.checkboxValue });
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


  private checkSubcategoriesExceptGlobalAreEquals(selected: any) {
    const keys = Object.keys(selected);
    const filteredKeys = keys.filter(item => item !== 'GLOBAL');

    if (filteredKeys.length < this.subCategories.length - 1) {
      return this.buildGlobalOptions(this.selectedOptions, filteredKeys, false);
    }

    let countEmpty = 0;
    for (const filteredKey of filteredKeys) {
      if (selected[filteredKey].length === 0 || selected[filteredKey] === undefined) {
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


  private arrayEquals(a: any, b: any) {
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val) => b.indexOf(val) > -1);
  }

  private buildSelectedOptions() {
    const tmpQueryParam = this.query[this.filtersName[0] as keyof WarehouseQueryInterface] || this.query[this.filtersName[1] as keyof WarehouseQueryInterface];

    const param = Array.isArray(tmpQueryParam) ? (tmpQueryParam as any).join() : (tmpQueryParam ? tmpQueryParam : undefined);
    if (this.options && Object.keys(this.options).length > 0) {
      if (param) {
        if (!param.includes(':')) {
          const splitParamGlobal = param.split(',');
          this.loopInsideOptions(this.subCategories, this.options, splitParamGlobal, false);
        } else {
          const splitParamCategories = arrFromUrlString(param);
          this.loopInsideOptions(this.subCategories, this.options, splitParamCategories, true);
        }
      } else {
        this.unselectedOptions = this.unselectedOptions ? this.unselectedOptions : {};
      }
    }

    function arrFromUrlString(urlString: string): string[] {
      const rebuilt = urlString.split(';').filter(s => s.length > 0);
      const finalRebuilt: any[] = [];

      rebuilt.forEach((element) => {
        const subSplit = element.split(':');
        finalRebuilt[subSplit[0] as any] = subSplit[1].split(',');
      });

      return finalRebuilt;
    }
  }

  private loopInsideOptions(subCategories: any[], options: any[], splitParam: any[], excludeGlobal = false) {

    subCategories = excludeGlobal ? subCategories.filter(category => category !== 'GLOBAL') : subCategories;

    this.selectedOptions['GLOBAL'] = [];
    this.unselectedOptions['GLOBAL'] = [];
    this.tmpSelectedOption['GLOBAL'] = [];

    for (const category of subCategories) {
      this.selectedOptions[category] = [];
      this.unselectedOptions[category] = [];
      this.tmpSelectedOption[category] = [];
      for (const option of options) {
        if (
          splitParam[category] && splitParam[category].includes(option.id) ||
          (splitParam && splitParam.includes(option.id))
        ) {
          this.selectedOptions[category].push(category === 'GLOBAL' ? {...option, checkboxValue: true} : option.id);
          this.tmpSelectedOption[category].push(category === 'GLOBAL' ? {...option, checkboxValue: true} : option.id);
        } else {
          this.unselectedOptions[category].push(category === 'GLOBAL' ? {...option, checkboxValue: undefined} : option.id);
        }

      }
    }

    if (excludeGlobal) {
      options.map(option => {
        let checkMatches = 0;
        subCategories.forEach(element => {
          if (this.selectedOptions[element].indexOf(option.id) > -1) {
            checkMatches++;
          }
        });

        if (checkMatches > 0) {
          this.selectedOptions['GLOBAL'].push({ ...option, checkboxValue: checkMatches === subCategories.length });
          this.tmpSelectedOption['GLOBAL'].push({ ...option, checkboxValue: checkMatches === subCategories.length });
        }

        if (checkMatches === 0) {
          this.unselectedOptions['GLOBAL'].push({ ...option, checkboxValue: undefined });
        }
      });
    }

    return this.selectedOptions;

  }

  toggleSubCategories(category: string, categorySelected: any, options: any) {
    this.tmpSelected[category] = [];

    if (!categorySelected || categorySelected.length === 0) {
      options.map((option: any) => {
        if (this.tmpSelected[category] && this.tmpSelected[category].indexOf(option.id) === -1) {
          this.tmpSelected[category].push(option.id);
        }
      });
    } else {
      if (categorySelected.length === Object.keys(options).length) {
        options.map((option: any) => {
          if (this.tmpSelected[category] && this.tmpSelected[category].indexOf(option.id) > -1) {
            this.tmpSelected[category].splice(this.tmpSelected[category].indexOf(option.id), 1);
          }
        });
      } else {
        options.map((option: any) => {
          if (this.tmpSelected[category] && this.tmpSelected[category].indexOf(option.id) === -1) {
            this.tmpSelected[category].push(option.id);
          }
        });
      }
    }

    this.selectedOptions[category] = this.tmpSelected[category];
    this.selectedIdx[category as any] = -1;

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
            this.selectedOptions[cat]?.indexOf(option.id) > -1 && selectedOptionsDiff?.findIndex((item: any) => item.id === option.id) > -1) {
            count++;
          }
        });
        if (count === categoriesExcludeGlobal.length) {
          categoriesExcludeGlobal.forEach(item => {
            if (
              this.selectedOptions[item]?.indexOf(option.id) > -1
              && this.selectedOptions['GLOBAL'].findIndex((x: SelectComponentOptions | string) => !(typeof x === 'string')
              && x.id === option.id) === -1
            ) {
              this.selectedOptions[item].splice(this.selectedOptions[item].indexOf(option.id), 1);
            }
            if (this.selectedOptions['GLOBAL'] && selectedOptionsDiff?.findIndex((el: any) => el.checkboxValue === option.id) > -1) {
              this.selectedOptions['GLOBAL']
                .splice(this.selectedOptions['GLOBAL']
                .findIndex(
                  (x: SelectComponentOptions | string) => !(typeof x === 'string') && x.id === option.id),
                  1
                );
            }
          });
        } else {
          categoriesExcludeGlobal.forEach(item => {
            if (
              (this.selectedOptions[item] === undefined || this.selectedOptions[item]?.indexOf(option.id) === -1)
              && this.selectedOptions['GLOBAL'] !== undefined
              && this.selectedOptions['GLOBAL'].findIndex((x: SelectComponentOptions | string) => !(typeof x === 'string')
              && x.id === option.id) > -1
              && (this.selectedOptions['GLOBAL'] as any)[this.selectedOptions['GLOBAL'].findIndex(
                (x: SelectComponentOptions | string) => !(typeof x === 'string') && x.id === option.id
              )]['checkboxValue'] === true
            ) {
              if (this.selectedOptions[item]) {
                this.selectedOptions[item].push(option.id);
              } else {
                this.selectedOptions[item] = [option.id];
              }
            }
          });
        }
      });
    } else {
      this.selectedOptions['GLOBAL'] = [];
      let tmpGlobal: any[] = [];
      this.options.map((option: any) => {
        let countNoGlobal = 0;
        categoriesExcludeGlobal.forEach(cat => {
          if (this.selectedOptions[cat]?.indexOf(option.id) > -1 &&
            this.selectedOptions['GLOBAL'] !== undefined && !this.selectedOptions['GLOBAL'].length &&
            this.selectedOptions['GLOBAL'].findIndex((x: SelectComponentOptions | string) => !(typeof x === 'string') && x.id === option.id) === -1
          ) {
            countNoGlobal++;
          }
        });

        tmpGlobal = this.getSelectedGlobalOptions(this.selectedOptions['GLOBAL'], option, countNoGlobal, categoriesExcludeGlobal);
      });
      this.selectedOptions['GLOBAL'] = tmpGlobal;
    }
    this.selectedOptions = {...this.selectedOptions};
    this.selectedChange.emit(this.selectedOptions);
  }

  emitSelectedOptions(cat: any) {
    this.selectedIdx[cat] = -1;
    this.checkSubcategoriesExceptGlobalAreEquals(this.selectedOptions);

    this.initOptions(this.selectedOptions);
    this.selectedChange.emit(this.selectedOptions);
  }

  getSelectedGlobalOptions(selectedOptionsGlobal: any, option: any, noGlobalOptionsSum: any, categoriesNoGlobal: any) {
    const checkboxValue = noGlobalOptionsSum === categoriesNoGlobal.length ?
      true : (noGlobalOptionsSum === 0 ? undefined : false);

    if (!Array.isArray(selectedOptionsGlobal)) {
      selectedOptionsGlobal = [];
    }
    selectedOptionsGlobal.push({ ...option, checkboxValue });

    return selectedOptionsGlobal;
  }

  buildGlobalOptions(selectedOptions: any, categories: any, equals: any) {
    const oldGlobalOptions = [];
    this.selectedOptions['GLOBAL']?.forEach((filter: SelectComponentOptions | string) => {
      if (!(typeof filter === 'string') && filter.checkboxValue === true) {
        oldGlobalOptions.push(filter.id);
      }
    });
    this.selectedOptions['GLOBAL'] = [];
    const tmpCat: any[] = [];

    if (equals === false) {
      for (const category of categories) {
        selectedOptions[category].map((item: any) => {
          const index = tmpCat.findIndex(el => el.id === item);
          if (index > -1) {
            tmpCat[index]['count'] += 1;
          } else {
            tmpCat.push({ id: item, count: 1 });
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
        this.selectedOptions['GLOBAL'].push({ ...item, checkboxValue: equals === true ? true : undefined });
      });
    }
  }

  arrayDiff(a: any, b: any) {
    a = a === undefined ? [] : a;
    if (b.length >= a.length) {
      return b.filter((item1: any) => !a.some((item2: any) => (item2.id === item1.id)));
    } else {
      return a.filter((item1: any) => !b.some((item2: any) => (item2.id === item1.id)));
    }
  }

}
