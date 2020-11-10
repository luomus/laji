import { ObservationMapModule } from './observation-map.module';

describe('ObservationMapModule', () => {
  let observationMapModule: ObservationMapModule;

  beforeEach(() => {
    observationMapModule = new ObservationMapModule();
  });

  it('should create an instance', () => {
    expect(observationMapModule).toBeTruthy();
  });
});
