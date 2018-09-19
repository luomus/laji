import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IucnClassComponent } from './iucn-class.component';

describe('IucnClassComponent', () => {
  let component: IucnClassComponent;
  let fixture: ComponentFixture<IucnClassComponent>;

  beforeEach(async(() => {
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
