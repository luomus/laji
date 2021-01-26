import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PageSizeSelectComponent } from './page-size-select.component';

describe('PageSizeSelectComponent', () => {
  let component: PageSizeSelectComponent;
  let fixture: ComponentFixture<PageSizeSelectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PageSizeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageSizeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
