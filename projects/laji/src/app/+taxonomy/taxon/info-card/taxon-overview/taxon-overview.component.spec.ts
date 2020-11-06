import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxonOverviewComponent } from './taxon-overview.component';

describe('TaxonOverviewComponent', () => {
  let component: TaxonOverviewComponent;
  let fixture: ComponentFixture<TaxonOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
