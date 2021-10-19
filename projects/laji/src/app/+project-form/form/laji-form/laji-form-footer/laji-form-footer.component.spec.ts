import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LajiFormFooterComponent } from './laji-form-footer.component';

describe('DocumentFormFooterComponent', () => {
  let component: LajiFormFooterComponent;
  let fixture: ComponentFixture<LajiFormFooterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LajiFormFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LajiFormFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
