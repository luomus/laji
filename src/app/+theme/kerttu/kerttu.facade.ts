import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  map,
} from 'rxjs/operators';
import { hotObjectObserver } from '../../shared/observable/hot-object-observer';

export enum Step {
  fillExpertise,
  annotateLetters,
  annotateRecordings,
  done
}

export interface IKerttuState {
  step: Step;
}

let _state: IKerttuState = {
  step: Step.fillExpertise
};

@Injectable()
export class KerttuFacade implements OnDestroy {

  private readonly store  = new BehaviorSubject<IKerttuState>(_state);
  readonly state$ = this.store.asObservable();

  readonly step$ = this.state$.pipe(map((state) => state.step), distinctUntilChanged());

  readonly vm$: Observable<IKerttuState> = hotObjectObserver<IKerttuState>({
    step: this.step$
  });

  constructor() {}

  ngOnDestroy(): void {

  }

  goToStep(step: Step) {
    this.updateState({..._state, step});
  }

  clear() {
    this.updateState({..._state, step: Step.fillExpertise});
  }

  private updateState(state: IKerttuState) {
    this.store.next(_state = state);
  }
}
