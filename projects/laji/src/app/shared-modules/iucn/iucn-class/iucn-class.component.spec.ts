import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { IucnClassComponent } from './iucn-class.component';

describe('IucnClassComponent', () => {
  let component: IucnClassComponent;
  let fixture: ComponentFixture<IucnClassComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ IucnClassComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IucnClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
