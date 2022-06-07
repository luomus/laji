import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpertiseByContinentComponent } from './expertise-by-continent.component';

describe('ExpertiseByContinentComponent', () => {
  let component: ExpertiseByContinentComponent;
  let fixture: ComponentFixture<ExpertiseByContinentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpertiseByContinentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpertiseByContinentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
