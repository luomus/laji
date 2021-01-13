import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PillListComponent } from './pill-list.component';

describe('PillListComponent', () => {
  let component: PillListComponent;
  let fixture: ComponentFixture<PillListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PillListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PillListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
