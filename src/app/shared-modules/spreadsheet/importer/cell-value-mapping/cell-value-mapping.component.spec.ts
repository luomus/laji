import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CellValueMappingComponent } from './cell-value-mapping.component';

describe('CellValueMappingComponent', () => {
  let component: CellValueMappingComponent;
  let fixture: ComponentFixture<CellValueMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CellValueMappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CellValueMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
