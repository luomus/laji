import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpeciesPieComponent } from './species-pie.component';

describe('SpeciesPieComponent', () => {
  let component: SpeciesPieComponent;
  let fixture: ComponentFixture<SpeciesPieComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeciesPieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeciesPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
