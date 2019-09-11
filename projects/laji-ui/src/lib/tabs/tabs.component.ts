import { Component, ContentChildren, AfterViewInit, QueryList, ComponentFactoryResolver, ViewChild, ViewContainerRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { TabComponent } from './tab/tab.component';

@Component({
  selector: 'lu-tabs',
  templateUrl: './tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent implements AfterViewInit {
  @ContentChildren(TabComponent) tabComponents !: QueryList<TabComponent>;

  selectedIndex = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    Promise.resolve(null).then(() => this.tabComponents.first.active = true);
  }

  onSelect(tabIndex: number) {
    this.tabComponents.toArray()[this.selectedIndex].active = false;
    this.selectedIndex = tabIndex;
    this.tabComponents.toArray()[tabIndex].active = true;
  }
}
