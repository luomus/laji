import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportMapComponent } from './import-map.component';

describe('ImportMapComponent', () => {
  let component: ImportMapComponent;
  let fixture: ComponentFixture<ImportMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
