import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NafiTemplatesComponent } from './nafi-templates.component';

describe('NafiTemplatesComponent', () => {
  let component: NafiTemplatesComponent;
  let fixture: ComponentFixture<NafiTemplatesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NafiTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NafiTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
