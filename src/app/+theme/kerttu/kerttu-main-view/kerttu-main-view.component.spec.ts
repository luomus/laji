import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KerttuMainViewComponent } from './kerttu-main-view.component';

describe('KerttuMainViewComponent', () => {
  let component: KerttuMainViewComponent;
  let fixture: ComponentFixture<KerttuMainViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KerttuMainViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KerttuMainViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
