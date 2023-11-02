import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonStatusComponent } from './taxon-status.component';

describe('TaxonStatusComponent', () => {
  let component: TaxonStatusComponent;
  let fixture: ComponentFixture<TaxonStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
