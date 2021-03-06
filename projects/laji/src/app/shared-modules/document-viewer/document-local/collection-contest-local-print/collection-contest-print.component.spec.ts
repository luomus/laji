import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CollectionContestPrintComponent } from './collection-contest-print.component';

describe('CollectionContestPrintComponent', () => {
  let component: CollectionContestPrintComponent;
  let fixture: ComponentFixture<CollectionContestPrintComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionContestPrintComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionContestPrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
