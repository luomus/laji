import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserMappingButtonComponent } from './user-mapping-button.component';

describe('LoadFileComponent', () => {
  let component: UserMappingButtonComponent;
  let fixture: ComponentFixture<UserMappingButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserMappingButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMappingButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
