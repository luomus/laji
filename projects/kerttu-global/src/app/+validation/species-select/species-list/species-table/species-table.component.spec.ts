import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesTableComponent } from './species-table.component';

describe('SpeciesTableComponent', () => {
  let component: SpeciesTableComponent;
  let fixture: ComponentFixture<SpeciesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SpeciesTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
