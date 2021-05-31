import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesComponent } from './types.component';

describe('TypeSpecimensComponent', () => {
  let component: TypesComponent;
  let fixture: ComponentFixture<TypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
