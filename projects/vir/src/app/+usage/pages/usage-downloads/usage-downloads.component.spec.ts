import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UsageDownloadsComponent } from './usage-downloads.component';

describe('UsageByCollectionComponent', () => {
  let component: UsageDownloadsComponent;
  let fixture: ComponentFixture<UsageDownloadsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageDownloadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
