import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiomonResultMapComponent } from './biomon-result-map.component';

describe('BiomonResultMapComponent', () => {
  let component: BiomonResultMapComponent;
  let fixture: ComponentFixture<BiomonResultMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BiomonResultMapComponent]
    });
    fixture = TestBed.createComponent(BiomonResultMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
