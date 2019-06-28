import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickLinksComponent } from './quick-links.component';

describe('QuickLinksComponent', () => {
  let component: QuickLinksComponent;
  let fixture: ComponentFixture<QuickLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
