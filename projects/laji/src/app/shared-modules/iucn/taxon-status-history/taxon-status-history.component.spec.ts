import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonStatusHistoryComponent } from './taxon-status-history.component';

describe('TaxonStatusHistoryComponent', () => {
  let component: TaxonStatusHistoryComponent;
  let fixture: ComponentFixture<TaxonStatusHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonStatusHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonStatusHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
