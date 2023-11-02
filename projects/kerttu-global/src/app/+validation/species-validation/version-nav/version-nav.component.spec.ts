import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionNavComponent } from './version-nav.component';

describe('VersionNavComponent', () => {
  let component: VersionNavComponent;
  let fixture: ComponentFixture<VersionNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VersionNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
