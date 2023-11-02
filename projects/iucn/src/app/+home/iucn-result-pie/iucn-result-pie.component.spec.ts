import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IucnResultPieComponent } from './iucn-result-pie.component';

describe('IucnResultPieComponent', () => {
  let component: IucnResultPieComponent;
  let fixture: ComponentFixture<IucnResultPieComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IucnResultPieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IucnResultPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
