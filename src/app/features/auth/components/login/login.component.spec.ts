import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error for invalid login', () => {
    component.username = 'wrong';
    component.password = 'wrong';
    component.login();
    expect(component.error).toBe('Invalid username or password');
  });

  it('should not show error for valid login', () => {
    component.username = 'admin';
    component.password = 'admin';
    component.login();
    expect(component.error).toBe('');
  });
});
