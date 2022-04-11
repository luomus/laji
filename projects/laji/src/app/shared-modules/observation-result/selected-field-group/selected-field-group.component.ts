import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ColumnSelector } from '../../../shared/columnselector/ColumnSelector';

@Component({
  selector: 'laji-selected-field-group',
  templateUrl: './selected-field-group.component.html',
  styleUrls: ['./selected-field-group.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedFieldGroupComponent {

  @Input() header: string;
  @Input() fields: string[] = [];
  @Input() selected: string[] = [];
  @Input() required: string[] = [];
  @Input() columnsLookup: any = {};

  @Input() columnSelector: ColumnSelector;

  @Output() toggle = new EventEmitter<string>();
  @Output() moveUp = new EventEmitter<string>();
  @Output() moveDown = new EventEmitter<string>();

  onToggle(field: string) {
    if (this.required.indexOf(field) === -1) {
      if (!this.isMultiColumnGisField(field)) {
        this.toggle.emit(field);

        if (this.columnSelector) {
          this.columnSelector.toggleSelectedField(field);
        }

        return;
      }

      this.getFieldColumnArray(field).forEach(column => {
        if (this.columnSelector) {
          this.columnSelector.toggleSelectedField(column);
        }
      });
    }
  }

  onMoveUp(field: string[]) {
    const indexOfField = this.selected.indexOf(field[0]);

    if (indexOfField > 0) {
      const widthOfNextGroup = this.getFieldColumnArrayLength(this.selected[indexOfField - 1]);

      field.forEach(column => {
        this.moveUp.emit(column);

        if (this.columnSelector) {
          this.columnSelector.moveFieldByName(column, -1 * widthOfNextGroup);
        }
      });
    }
  }

  onMoveDown(field: string[]) {
    const lastSelected = this.selected.length - 1;
    const indexOfField = this.selected.indexOf(field[field.length - 1]);

    if (indexOfField < lastSelected) {
      const widthOfNextGroup = this.getFieldColumnArrayLength(this.selected[indexOfField + 1]);

      field.reverse().forEach(column => {
        this.moveDown.emit(column);

        if (this.columnSelector) {
          this.columnSelector.moveFieldByName(column, widthOfNextGroup);
        }
      });
    }
  }

  isMultiColumnGisField(field: string) {
    return /gathering\.conversions\.(wgs84|euref|ykj)(CenterPoint)?$/.test(field);
  }

  getFieldColumnArray(field: string) {
    if (!field) {
      return undefined;
    } else if (/gathering\.conversions\.(wgs84|euref|ykj)(CenterPoint)(.(lat|lon))?$/.test(field)) {
      return [
        field + '.lat',
        field + '.lon'
      ];
    } else if (/gathering\.conversions\.(wgs84|euref|ykj)(.(lat|lon)(Min|Max))?$/.test(field)) {
      return [
        field + '.latMin',
        field + '.latMax',
        field + '.lonMin',
        field + '.lonMax',
      ];
    } else {
      return [ field ];
    }
  }

  getFieldColumnArrayLength(field: string) {
    return this.getFieldColumnArray(field)?.length || 0;
  }

  getIndexArray(field: string[]) {
    let last = 0;
    return field.map(column => {
      const index = this.selected.indexOf(column, last);
      last = index;
      return index;
    });
  }
}
