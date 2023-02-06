import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificationSpeciesTableComponent } from './identification-species-table.component';

describe('IdentificationSpeciesTableComponent', () => {
  let component: IdentificationSpeciesTableComponent;
  let fixture: ComponentFixture<IdentificationSpeciesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificationSpeciesTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificationSpeciesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
