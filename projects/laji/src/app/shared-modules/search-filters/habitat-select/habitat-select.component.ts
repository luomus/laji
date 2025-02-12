import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'laji-habitat-select',
  templateUrl: './habitat-select.component.html',
  styleUrls: ['./habitat-select.component.scss']
})
export class HabitatSelectComponent implements OnChanges, OnDestroy {
  @Input() query: any;
  @Input() info: string | undefined;

  habitat?: string[];
  habitatSpecific?: string[];
  onlyPrimary?: boolean;

  private subUpdate?: Subscription;

  @Output() habitatSelect = new EventEmitter<{primaryHabitat?: string[]; anyHabitat?: string[]}>();

  ngOnChanges() {
    this.setQuery(this.query);
  }

  ngOnDestroy() {
    if (this.subUpdate) {
      this.subUpdate.unsubscribe();
    }
  }

  onSelect() {
    const habitatQuery = this.getHabitatQuery();
    if (this.onlyPrimary) {
      this.habitatSelect.emit({primaryHabitat: habitatQuery});
    } else {
      this.habitatSelect.emit({anyHabitat: habitatQuery});
    }
  }

  onOnlyPrimaryChange() {
    this.onlyPrimary = !this.onlyPrimary;
    this.onSelect();
  }

  private getHabitatQuery(): string[] {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let habitatQuery = this.habitat!;
    if (this.habitatSpecific && this.habitatSpecific.length > 0) {
      const specific = this.habitatSpecific.join(',');
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      habitatQuery = this.habitat!.map(hab => (hab + '[' + specific + ']'));
    }
    return habitatQuery;
  }

  private setQuery(query: any) {
    if (query.primaryHabitat && query.primaryHabitat.length > 0) {
      this.setHabitatQuery(query.primaryHabitat);
      this.onlyPrimary = true;
    } else if (query.anyHabitat && query.anyHabitat.length > 0) {
      this.setHabitatQuery(query.anyHabitat);
      this.onlyPrimary = false;
    } else {
      this.habitat = undefined;
      this.habitatSpecific = undefined;
    }
  }

  private setHabitatQuery(habitatQuery: string[]) {
    const match = habitatQuery[0].match('\\[.*]');
    const specific = match ? match[0] : '';
    this.habitatSpecific = specific && specific.length > 2 ? specific.substring(1, specific.length - 1).split(',') : undefined;

    this.habitat = habitatQuery.map(hab => (hab.replace(specific, '')));
  }
}
