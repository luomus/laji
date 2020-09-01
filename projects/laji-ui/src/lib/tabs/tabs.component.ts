import {
  Component, ContentChildren, AfterViewInit, QueryList, ChangeDetectorRef,
  ChangeDetectionStrategy, Input, Output, EventEmitter, OnInit, AfterContentInit, OnDestroy
} from '@angular/core';
import { TabComponent } from './tab/tab.component';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { color } from '../vars';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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
export class TabsComponent implements AfterContentInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  private _tabComponents: QueryList<TabComponent>;
  @ContentChildren(TabComponent) set tabComponents(tabs: QueryList<TabComponent>) {
    this._tabComponents = tabs;
    this.reload();
  }
  get tabComponents(): QueryList<TabComponent> {
    return this._tabComponents;
  }

  @Output() selectedChange = new EventEmitter<number>();

  private _selectedIndex = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterContentInit(): void {
  }

  @Input() set selectedIndex(idx) {
    this._selectedIndex = idx;
    if (this.tabComponents) {
      this.updateActiveComponents(idx);
    }
  }
  get selectedIndex() {
    return this._selectedIndex;
  }

  onSelect(tabIndex: number) {
    this._selectedIndex = tabIndex;
    this.updateActiveComponents(tabIndex);
    this.selectedChange.next(tabIndex);
  }

  updateActiveComponents(newIdx: number) {
    this.tabComponents.toArray().forEach((tab, idx) => {
      if (idx === newIdx) {
        tab.active = true;
      } else {
        tab.active = false;
      }
    });
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  reload() {
    this.unsubscribe$.next();
    const tabs = this.tabComponents.toArray();
    if (tabs[this.selectedIndex]) {
      tabs[this.selectedIndex].active = true;
    }
    tabs.forEach((tab) => {
      tab.inputChange.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
        this.cdr.markForCheck();
      });
    });
    this.cdr.markForCheck();
  }
}
