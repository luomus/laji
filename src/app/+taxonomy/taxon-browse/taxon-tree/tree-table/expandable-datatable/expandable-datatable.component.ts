import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DatatableTemplatesComponent } from '../../../../../shared-modules/datatable/datatable-templates/datatable-templates.component';
import { CacheService } from '../../../../../shared/service/cache.service';
import { TreeNode } from '../model/tree-node.interface';

const CACHE_COLUMN_SETINGS = 'tree-table-col-width';
interface Settings {[key: string]: {width: string}}

@Component({
  selector: 'laji-expandable-datatable',
  templateUrl: './expandable-datatable.component.html',
  styleUrls: ['./expandable-datatable.component.css']
})
export class ExpandableDatatableComponent implements OnInit, OnChanges {
  private static settings: Settings;

  @Input() rows = [];
  _columns = [];

  @Input() activeId: string;
  @Input() expanderColWidth = 200;
  rowClass = this._rowClass();

  @Output() toggle = new EventEmitter<TreeNode>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() toggleAll = new EventEmitter<TreeNode>();

  @ViewChild('expander') expanderTpl: TemplateRef<any>;
  expanderLabelTpl: TemplateRef<any>;
  expanderLabelProp: string;
  @ViewChild('datatableTemplates') datatableTemplates: DatatableTemplatesComponent;

  @Input() set columns(columns: any) {
    const settings$ = ExpandableDatatableComponent.settings ?
      of(ExpandableDatatableComponent.settings) :
      this.cacheService.getItem<Settings>(CACHE_COLUMN_SETINGS)
        .pipe(
          map(value => value || {}),
          tap(value => ExpandableDatatableComponent.settings = value)
        );

    settings$.subscribe(settings => {
      this.expanderLabelTpl = undefined;
      this.expanderLabelProp = undefined;

      this._columns = columns.map((column, i) => {
        if (!column.headerTemplate) {
          column.headerTemplate = this.datatableTemplates.header;
        }
        if (typeof column.cellTemplate === 'string') {
          column.cellTemplate = this.datatableTemplates[column.cellTemplate];
        }
        if (!column.prop) {
          column.prop = column.name;
        }
        if (settings && settings[column.name] && settings[column.name].width) {
          column.width = settings[column.name].width;
        }
        column.sortable = false;

        if (i === 0) {
          if (column.cellTemplate) {
            this.expanderLabelTpl = column.cellTemplate;
          }
          this.expanderLabelProp = column.prop;

          column = {
            ...column,
            cellTemplate: this.expanderTpl,
            frozenLeft: true,
            width: this.expanderColWidth
          };
        }

        return column;
      });

      this.cd.markForCheck();
    });
  }

  constructor(
    private cacheService: CacheService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.activeId) {
      this.rowClass = this._rowClass(this.activeId);
    } else if (changes.expanderColWidth) {
      if (this._columns.length > 0) {
        this._columns[0].width = this.expanderColWidth;
        this._columns = [...this._columns];
      }
    }
  }

  onRowSelect(event) {
    if (event.type !== 'click' || event.type === 'dblClick') {
      return;
    }

    if (event.column.prop === this.expanderLabelProp) {
      this.toggle.emit(event.row.node);
    } else {
      this.rowSelect.emit(event);
    }
  }

  onResize(event) {
    if (event && event.column && event.column.name && event.column.prop !== this.expanderLabelProp && event.newValue) {
      ExpandableDatatableComponent.settings[event.column.name] = {width: event.newValue};
      this.cacheService.setItem<Settings>(CACHE_COLUMN_SETINGS, ExpandableDatatableComponent.settings)
        .subscribe(() => {}, () => {});
    }
  }

  onToggleAllClick(event, node: TreeNode) {
    this.toggleAll.emit(node);
    event.stopPropagation();
  }

  private _rowClass(activeId?: string) {
    return (row) => {
      if (row.id === activeId) {
        return 'active link';
      }
      return 'link';
    }
  }
}
