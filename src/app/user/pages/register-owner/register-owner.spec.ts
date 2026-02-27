import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterOwner } from './register-owner';

describe('RegisterOwner', () => {
  let component: RegisterOwner;
  let fixture: ComponentFixture<RegisterOwner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterOwner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterOwner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
