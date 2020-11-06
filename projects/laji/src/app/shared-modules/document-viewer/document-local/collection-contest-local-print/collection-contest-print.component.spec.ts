import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionContestPrintComponent } from './collection-contest-print.component';

describe('CollectionContestPrintComponent', () => {
  let component: CollectionContestPrintComponent;
  let fixture: ComponentFixture<CollectionContestPrintComponent>;

  beforeEach(async(() => {
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
