import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import {
  distinctUntilChanged,
  map,
} from 'rxjs/operators';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';

export enum Step {
  empty,
  sheetLoadError,
  fileAlreadyUploadedPartially,
  fileAlreadyUploaded,
  invalidFileType,
  invalidFormId,
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

  canDeactivateStatus = true;

  private readonly formSub: Subscription;

  constructor() {
    // canDeactiveStatus i.e. whether the user can leave the page without confirmation message
    // depends on the state of the importer, as it is okay to leave if importing is not ongoing
    this.vm$.pipe(
      map(vm => {
        if ([Step.empty, Step.doneOk, Step.doneWithErrors].includes(vm.step)) {
          return true;
        } else {
          return false;
        }
      })
    ).subscribe(inWhitelist => {
      this.canDeactivateStatus = inWhitelist;
    });
  }

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
