import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadRequestComponent } from './download-request.component';

describe('DownloadRequestComponent', () => {
  let component: DownloadRequestComponent;
  let fixture: ComponentFixture<DownloadRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
