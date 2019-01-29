import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonDescriptionsComponent } from './taxon-descriptions.component';

describe('TaxonDescriptionsComponent', () => {
  let component: TaxonDescriptionsComponent;
  let fixture: ComponentFixture<TaxonDescriptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonDescriptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonDescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
