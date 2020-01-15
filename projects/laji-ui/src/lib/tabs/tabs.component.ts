import {
  Component, ContentChildren, AfterViewInit, QueryList, ChangeDetectorRef,
  ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, AfterContentInit
} from '@angular/core';
import { TabComponent } from './tab/tab.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { color } from '../vars';

@Component({
  selector: 'lu-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('activeTab', [
      state('inactive', style({
        'background-color': color.neutral[3],
        'color': color.neutral[6]
      })),
      state('active', style({
        'background-color': color.neutral[2],
        'color': color.neutral[7]
      })),
      transition('inactive=>active', animate('100ms')),
      transition('active=>inactive', animate('200ms'))
    ])
  ]
})
export class TabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabComponents !: QueryList<TabComponent>;

  @Output() select = new EventEmitter<number>();

  private _selectedIndex = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
    this.tabComponents.toArray()[this.selectedIndex].active = true;
  }

  @Input() set selectedIndex(idx) {
    const updateActive = this.updateActiveComponents(this._selectedIndex);
    this._selectedIndex = idx;
    if (this.tabComponents) {
      updateActive(idx);
    }
  }
  get selectedIndex() {
    return this._selectedIndex;
  }

  onSelect(tabIndex: number) {
    const updateActive = this.updateActiveComponents(this.selectedIndex);
    this._selectedIndex = tabIndex;
    updateActive(tabIndex);
    this.select.next(tabIndex);
  }

  updateActiveComponents = oldIdx => newIdx => {
      this.tabComponents.toArray()[oldIdx].active = false;
      this.tabComponents.toArray()[newIdx].active = true;
      this.cdr.markForCheck();
  }
}
