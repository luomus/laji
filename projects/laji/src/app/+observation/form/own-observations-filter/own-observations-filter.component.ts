import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

export type OwnFilterState = 'asObserver' | 'asEditor' | 'asBoth' | 'asNone' | 'unset';
export type QualityIssuesFilterState = 'BOTH' | 'NO_ISSUES' | 'ONLY_ISSUES';

type OwnFilterChangeLookup = {
  [checkbox in ('asObserver' | 'asEditor' | 'exclude')]: {
    [currentState in OwnFilterState]: {
      [checkboxVal in ('true' | 'false')]: OwnFilterState
    }
  }
};
const ownFilterChangeLookup: OwnFilterChangeLookup = {
  'asObserver': { // checkbox
    'asObserver': { // current state
      true: 'asObserver', // next state
      false: 'unset'
    },
    'asEditor': {
      true: 'asBoth',
      false: 'asEditor'
    },
    'asBoth': {
      true: 'asBoth',
      false: 'asEditor'
    },
    'asNone': {
      true: 'asObserver',
      false: 'asNone'
    },
    'unset': {
      true: 'asObserver',
      false: 'unset'
    }
  },
  'asEditor': { // checkbox
    'asObserver': { // current state
      true: 'asBoth', // next state
      false: 'asObserver'
    },
    'asEditor': {
      true: 'asEditor',
      false: 'unset'
    },
    'asBoth': {
      true: 'asBoth',
      false: 'asObserver'
    },
    'asNone': {
      true: 'asEditor',
      false: 'asNone'
    },
    'unset': {
      true: 'asEditor',
      false: 'unset'
    }
  },
  'exclude': { // checkbox
    'asObserver': { // current state
      true: 'asNone', // next state
      false: 'asObserver'
    },
    'asEditor': {
      true: 'asNone',
      false: 'asEditor'
    },
    'asBoth': {
      true: 'asNone',
      false: 'asBoth'
    },
    'asNone': {
      true: 'asNone',
      false: 'unset'
    },
    'unset': {
      true: 'asNone',
      false: 'unset'
    }
  }
};

@Component({
  selector: 'laji-own-observations-filter',
  templateUrl: `./own-observations-filter.component.html`,
  styleUrls: ['./own-observations-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnObservationsFilterComponent {
  @Input() asObserverOrEditor: OwnFilterState = 'unset';
  @Input() includeQualityIssues: QualityIssuesFilterState = 'BOTH';
  @Output() ownFilterChange = new EventEmitter<OwnFilterState>();
  @Output() qualityIssuesFilterChange = new EventEmitter<QualityIssuesFilterState>();

  constructor(private cdr: ChangeDetectorRef) {}

  onOwnFilterStateCheckboxChange(cb: 'asObserver' | 'asEditor' | 'exclude', value: boolean) {
    this.asObserverOrEditor = ownFilterChangeLookup[cb][this.asObserverOrEditor][value.toString()];
    this.ownFilterChange.emit(this.asObserverOrEditor);
    this.cdr.markForCheck();
  }

  onIncludeQualityIssuesChange(state: QualityIssuesFilterState[]) {
    this.includeQualityIssues = state[0];
    this.qualityIssuesFilterChange.emit(this.includeQualityIssues);
    this.cdr.markForCheck();
  }
}
