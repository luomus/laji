import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationResultsComponent } from './identification-results.component';

describe('IdentificationResultsComponent', () => {
  let component: IdentificationResultsComponent;
  let fixture: ComponentFixture<IdentificationResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificationResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
