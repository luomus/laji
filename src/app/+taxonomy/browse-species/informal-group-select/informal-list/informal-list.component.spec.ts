import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformalListComponent } from './informal-list.component';

describe('InformalListComponent', () => {
  let component: InformalListComponent;
  let fixture: ComponentFixture<InformalListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformalListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
