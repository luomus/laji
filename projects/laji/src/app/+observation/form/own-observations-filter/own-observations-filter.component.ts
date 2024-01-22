import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { ObservationFormQuery } from '../observation-form-query.interface';

export type OwnFilterModel = Pick<ObservationFormQuery, 'asObserver' | 'asEditor' | 'asNotEditorOrObserver'>;

@Component({
  selector: 'laji-own-observations-filter',
  templateUrl: `./own-observations-filter.component.html`,
  styleUrls: ['./own-observations-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnObservationsFilterComponent {
  @Input() asObserver: ObservationFormQuery['asObserver'];
  @Input() asEditor: ObservationFormQuery['asEditor'];
  @Input() asNotEditorOrObserver: ObservationFormQuery['asNotEditorOrObserver'];
  @Input() includeQualityIssues: string;
  @Output() asObserverChange = new EventEmitter<boolean>();
  @Output() asEditorChange = new EventEmitter<boolean>();
  @Output() asNotEditorOrObserverChange = new EventEmitter<boolean>();
  @Output() asEditorOrObserverChange = new EventEmitter<boolean>();
  @Output() qualityIssuesFilterChange = new EventEmitter<string>();

  private observerEditorSideEffects(value) {
    if (value && !this.includeQualityIssues) {
      this.includeQualityIssues = 'BOTH';
      this.qualityIssuesFilterChange.emit(this.includeQualityIssues);
    }
    if (value) {
      this.asNotEditorOrObserver = false;
      this.asNotEditorOrObserverChange.emit(false);
    }
  }

  onAsObserverChange(value: boolean) {
    this.observerEditorSideEffects(value);
    this.asObserver = value;
    this.asObserverChange.emit(value);
  }

  onAsEditorChange(value: boolean) {
    this.observerEditorSideEffects(value);
    this.asEditor = value;
    this.asEditorChange.emit(value);
  }

  onAsNotEditorOrObserverChange(value: boolean) {
    this.asNotEditorOrObserver = value;
    this.asNotEditorOrObserverChange.emit(value);
    if (value) {
      this.asEditor = false;
      this.asObserver = false;
      this.asEditorOrObserverChange.emit(false);
    }
  }

  onIncludeQualityIssuesChange(value: string) {
    this.includeQualityIssues = value;
    this.qualityIssuesFilterChange.emit(value);
  }
}
