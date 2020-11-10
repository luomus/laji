import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  map,
} from 'rxjs/operators';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';

export enum Step {
  empty,
  fileAlreadyUploadedPartially,
  fileAlreadyUploaded,
  ambiguousColumns,
  invalidFileType,
  importingFile,
  colMapping,
  dataMapping,
  importReady,
  validating,
  invalidData,
  importing,
  doneOk,
  doneWithErrors
}

export interface ISpreadsheetState {
  hasUserMapping: boolean;
  step: Step;
  filename: string;
  mappingFilename: string;
}

let _state: ISpreadsheetState = {
  hasUserMapping: false,
  step: Step.empty,
  filename: '',
  mappingFilename: '',
};

@Injectable()
export class SpreadsheetFacade implements OnDestroy {

  private readonly store  = new BehaviorSubject<ISpreadsheetState>(_state);
  readonly state$ = this.store.asObservable();

  readonly hasUserMapping$ = this.state$.pipe(map((state) => state.hasUserMapping), distinctUntilChanged());
  readonly step$ = this.state$.pipe(map((state) => state.step), distinctUntilChanged());
  readonly filename$ = this.state$.pipe(map((state) => state.filename), distinctUntilChanged());
  readonly mappingFilename$ = this.state$.pipe(map((state) => state.mappingFilename), distinctUntilChanged());

  readonly vm$: Observable<ISpreadsheetState> = hotObjectObserver<ISpreadsheetState>({
    hasUserMapping: this.hasUserMapping$,
    step: this.step$,
    filename: this.filename$,
    mappingFilename: this.mappingFilename$
  });

  private readonly formSub: Subscription;

  constructor() {}

  ngOnDestroy(): void {
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }

  setFilename(filename: string) {
    this.updateState({..._state, filename});
  }

  setMappingFilename(mappingFilename: string) {
    this.updateState({..._state, mappingFilename});
  }

  goToStep(step: Step) {
    this.updateState({..._state, step});
  }

  clear() {
    this.updateState({..._state, filename: '', step: Step.empty});
  }

  hasUserMapping(hasUserMapping: boolean) {
    this.updateState({..._state, hasUserMapping});
  }

  private updateState(state: ISpreadsheetState) {
    this.store.next(_state = state);
  }
}
