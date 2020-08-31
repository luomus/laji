import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageDownloadsComponent } from './usage-downloads.component';

describe('UsageByCollectionComponent', () => {
  let component: UsageDownloadsComponent;
  let fixture: ComponentFixture<UsageDownloadsComponent>;

  beforeEach(async(() => {
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
