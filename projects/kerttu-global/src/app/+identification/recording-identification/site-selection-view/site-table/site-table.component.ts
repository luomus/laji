import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  TemplateRef,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { IGlobalSite } from '../../../../kerttu-global-shared/models';
import { DatatableColumn } from '../../../../../../../laji/src/app/shared-modules/datatable/model/datatable-column';

@Component({
  selector: 'bsg-site-table',
  templateUrl: './site-table.component.html',
  styleUrls: ['./site-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SiteTableComponent implements OnInit, OnChanges {
  @ViewChild('deleteTpl', { static: true }) deleteTpl: TemplateRef<any>;

  @Input() sites: IGlobalSite[] = [];
  @Input() selectedSites: number[] = [];
  @Input() height = '100%';

  columns: DatatableColumn[] = [];
  data: IGlobalSite[] = [];

  @Output() selectedSitesChange = new EventEmitter<number[]>();

  ngOnInit() {
    this.columns = [
      {
        name: 'id',
        label: 'siteSelection.site.id',
        width: 50
      },
      {
        name: 'name',
        label: 'siteSelection.site.name',
        width: 100
      },
      {
        name: 'country',
        label: 'siteSelection.site.country',
        width: 100
      },
      {
        cellTemplate: this.deleteTpl,
        sortable: false,
        width: 50
      }
    ];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.sites || changes.selectedSites) {
      this.data = (this.sites || []).filter(s => (this.selectedSites || []).includes(s.id));
    }
  }

  onRemove(id: number) {
    this.selectedSites = this.selectedSites.filter(siteId => siteId !== id);
    this.selectedSitesChange.emit(this.selectedSites);
  }
}
