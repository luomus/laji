import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PrintTaxonHeaderComponent } from './print-taxon-header.component';

describe('PrintTaxonHeaderComponent', () => {
  let component: PrintTaxonHeaderComponent;
  let fixture: ComponentFixture<PrintTaxonHeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PrintTaxonHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintTaxonHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
