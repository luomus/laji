import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ObservationFormQuery } from '../observation-form-query.interface';

export type OwnFilterModel = Pick<ObservationFormQuery, 'asObserver' | 'asEditor' | 'asNotEditorOrObserver'>;

type State = OwnFilterModel & { quality: string };

@Component({
  selector: 'laji-own-observations-filter',
  templateUrl: `./own-observations-filter.component.html`,
  styleUrls: ['./own-observations-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwnObservationsFilterComponent implements OnInit {
  @Input() asObserver: ObservationFormQuery['asObserver'];
  @Input() asEditor: ObservationFormQuery['asEditor'];
  @Input() asNotEditorOrObserver: ObservationFormQuery['asNotEditorOrObserver'];
  @Input() includeQualityIssues: string;
  @Output() ownFilterChange = new EventEmitter<OwnFilterModel>();
  @Output() qualityIssuesFilterChange = new EventEmitter<string>();

  state: State;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.state = {
      asObserver: this.asObserver,
      asEditor: this.asEditor,
      asNotEditorOrObserver: this.asNotEditorOrObserver,
      quality: this.includeQualityIssues
    };
  }

  private updateState(state: Partial<State>) {
    const nextState = {...this.state, ...state};
    const {quality, ...ownFilter} = nextState;
    this.ownFilterChange.emit(ownFilter);
    if (quality !== this.state.quality) {
      this.qualityIssuesFilterChange.emit(quality);
    }
    this.state = nextState;
    this.cdr.markForCheck();
  }

  private obsFormChange(state: Partial<OwnFilterModel>) {
    const nextState = {...this.state, ...state};
    const observerAndEditorSelected = (!this.state.asObserver || !this.state.asEditor) && nextState.asObserver && nextState.asEditor;
    if (observerAndEditorSelected) {
      nextState.quality = 'BOTH';
    }
    this.updateState(nextState);
  }

  onAsObserverChange(value: boolean) {
    this.obsFormChange({asObserver: value, asNotEditorOrObserver: false});
  }

  onAsEditorChange(value: boolean) {
     this.obsFormChange({asEditor: value, asNotEditorOrObserver: false});
  }

  OnAsNotEditorOrObserver(value: boolean) {
    this.obsFormChange(value
      ? {asObserver: false, asEditor: false, asNotEditorOrObserver: value}
      : {asNotEditorOrObserver: value}
    );
  }

  onIncludeQualityIssuesChange(state: string[]) {
    this.updateState({quality: state[0]});
  }
}
