import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WbcSpeciesResultListComponent } from './wbc-species-result-list.component';

describe('WbcSpeciesResultListComponent', () => {
  let component: WbcSpeciesResultListComponent;
  let fixture: ComponentFixture<WbcSpeciesResultListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WbcSpeciesResultListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WbcSpeciesResultListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
