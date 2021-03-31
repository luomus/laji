import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TaxonInfoRowComponent } from './taxon-info-row.component';

describe('TaxonInfoRowComponent', () => {
  let component: TaxonInfoRowComponent;
  let fixture: ComponentFixture<TaxonInfoRowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TaxonInfoRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaxonInfoRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
