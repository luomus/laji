import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FactsComponent } from './facts.component';

describe('FactsComponent', () => {
  let component: FactsComponent;
  let fixture: ComponentFixture<FactsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
