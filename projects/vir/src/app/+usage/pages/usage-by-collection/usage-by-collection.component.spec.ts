import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageByCollectionComponent } from './usage-by-collection.component';

describe('UsageByCollectionComponent', () => {
  let component: UsageByCollectionComponent;
  let fixture: ComponentFixture<UsageByCollectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageByCollectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageByCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
