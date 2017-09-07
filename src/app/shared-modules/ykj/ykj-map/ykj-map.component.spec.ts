import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YkjMapComponent } from './ykj-map.component';

describe('YkjMapComponent', () => {
  let component: YkjMapComponent;
  let fixture: ComponentFixture<YkjMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YkjMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YkjMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
