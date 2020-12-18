import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonOverviewComponent } from './taxon-overview.component';

describe('TaxonOverviewComponent', () => {
  let component: TaxonOverviewComponent;
  let fixture: ComponentFixture<TaxonOverviewComponent>;

  beforeEach(waitForAsync(() => {
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
