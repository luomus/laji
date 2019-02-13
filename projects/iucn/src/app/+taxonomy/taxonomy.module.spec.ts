import { IucnTaxonomyModule } from './iucn-taxonomy.module';

describe('IucnTaxonomyModule', () => {
  let taxonomyModule: IucnTaxonomyModule;

  beforeEach(() => {
    taxonomyModule = new IucnTaxonomyModule();
  });

  it('should create an instance', () => {
    expect(taxonomyModule).toBeTruthy();
  });
});
