import { TaxonomyModule } from './taxonomy.module';

describe('TaxonomyModule', () => {
  let taxonomyModule: TaxonomyModule;

  beforeEach(() => {
    taxonomyModule = new TaxonomyModule();
  });

  it('should create an instance', () => {
    expect(taxonomyModule).toBeTruthy();
  });
});
