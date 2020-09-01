import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageMyDownloadsComponent } from './usage-my-downloads.component';

describe('UsageByPersonComponent', () => {
  let component: UsageMyDownloadsComponent;
  let fixture: ComponentFixture<UsageMyDownloadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageMyDownloadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageMyDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
