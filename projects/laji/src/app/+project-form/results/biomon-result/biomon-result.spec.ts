import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiomonResultComponent } from './biomon-result.component';

describe('BiomonResultComponent', () => {
  let component: BiomonResultComponent;
  let fixture: ComponentFixture<BiomonResultComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BiomonResultComponent]
    });
    fixture = TestBed.createComponent(BiomonResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
