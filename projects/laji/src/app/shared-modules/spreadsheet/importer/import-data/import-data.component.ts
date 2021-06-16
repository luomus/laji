import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { LoadedElementsStore } from 'projects/laji-ui/src/lib/tabs/tab-utils';
import { ImportTableColumn } from 'projects/laji/src/app/+haseka/tools/model/import-table-column';

@Component({
  selector: 'laji-import-data',
  templateUrl: './import-data.component.html',
  styleUrls: ['./import-data.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportDataComponent implements OnInit {
  @Input() mappedData: {[key: string]: any}[] = [];
  @Input() showOnlyErroneous = false;
  @Input() dataColumns: ImportTableColumn[] = [];
  @Input() colMap: {[key: string]: string} = {};

  activeTabIndex = 0;
  loadedTabs = new LoadedElementsStore(['list', 'map']);

  ngOnInit(): void {
    this.loadedTabs.load(this.activeTabIndex);
  }

  setActiveTab(newActive: number) {
    this.activeTabIndex = newActive;
    this.loadedTabs.load(newActive);
  }
}
