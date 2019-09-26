import { Component, ContentChildren, AfterViewInit, QueryList, ChangeDetectorRef, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
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
export class TabsComponent implements AfterViewInit {
  @ContentChildren(TabComponent) tabComponents !: QueryList<TabComponent>;

  @Input() selectedIndex = 0;
  @Output() select = new EventEmitter<number>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    Promise.resolve(null).then(() => this.tabComponents.first.active = true);
  }

  onSelect(tabIndex: number) {
    this.tabComponents.toArray()[this.selectedIndex].active = false;
    this.selectedIndex = tabIndex;
    this.tabComponents.toArray()[tabIndex].active = true;
    this.select.next(tabIndex);
  }
}
