import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecureInfoComponent } from './secure-info.component';

describe('SecureInfoComponent', () => {
  let component: SecureInfoComponent;
  let fixture: ComponentFixture<SecureInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecureInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecureInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
