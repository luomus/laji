import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeciesToolsComponent } from './species-tools.component';

describe('SpeciesToolsComponent', () => {
  let component: SpeciesToolsComponent;
  let fixture: ComponentFixture<SpeciesToolsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeciesToolsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
