import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ColumnSelector } from '../../../../shared/columnselector/ColumnSelector';

@Component({
  selector: 'laji-selected-parents',
  templateUrl: './selected-parents.component.html',
  styleUrls: ['./selected-parents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectedParentsComponent {
  @Input() header!: string;
  @Input() parents: string[] = [];
  @Input() selected: string[] = [];
  @Input() columnSelector!: ColumnSelector;

  private parentFields(parent: string): string[] {
    return ['parent.' + parent + '.scientificName',
            'parent.' + parent + '.scientificNameAuthorship'];
  }

  onToggle(parent: string) {
    this.parentFields(parent).
      forEach(p => this.columnSelector.toggleSelectedField(p));
  }

  onMoveUp(parent: string, event: any) {
    event.stopPropagation();

    const fields = this.parentFields(parent);

    this.columnSelector.moveFieldByName(fields[0], -1);

    const order = fields.map(f => this.columnSelector.columns.indexOf(f));

    if (order[0] > order[1] || order[1] > order[0] + 1) {
      this.columnSelector.moveFieldByName(fields[1], -1);
    }
  }

  onMoveDown(parent: string, event: any) {
    event.stopPropagation();

    const fields = this.parentFields(parent);

    this.columnSelector.moveFieldByName(fields[1], 1);

    const order = fields.map(f => this.columnSelector.columns.indexOf(f));

    if (order[0] > order[1] || order[0] < order[1] - 1) {
      this.columnSelector.moveFieldByName(fields[0], 1);
    }
  }
}
