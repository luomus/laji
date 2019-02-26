import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MunicipalityMonitoringOwnSubmissionsComponent } from './municipality-monitoring-own-submissions.component';

describe('MunicipalityMonitoringOwnSubmissionsComponent', () => {
  let component: MunicipalityMonitoringOwnSubmissionsComponent;
  let fixture: ComponentFixture<MunicipalityMonitoringOwnSubmissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MunicipalityMonitoringOwnSubmissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MunicipalityMonitoringOwnSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
