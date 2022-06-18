import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../shared/shared.module';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [SharedModule, 
        HttpClientTestingModule, 
        FormsModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Layout', () => {
    it('has Login header', () => {
      const loginPage = fixture.nativeElement as HTMLElement;
      const h1 = loginPage.querySelector('h1');
      expect(h1?.textContent).toBe('Login');
    })

    it('has email input', () => {
      const loginPage = fixture.nativeElement as HTMLElement;
      const label = loginPage.querySelector('label[for="email"]');
      const input = loginPage.querySelector('input[id="email"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('E-mail');
    })

    it('has password input', () => {
      const loginPage = fixture.nativeElement as HTMLElement;
      const label = loginPage.querySelector('label[for="password"]');
      const input = loginPage.querySelector('input[id="password"]');
      expect(input).toBeTruthy();
      expect(label).toBeTruthy();
      expect(label?.textContent).toContain('Password');
    })

    it('has password type for password input', () => {
      const loginPage = fixture.nativeElement as HTMLElement;
      const input = loginPage.querySelector('input[id="password"]') as HTMLInputElement;
      expect(input.type).toBe('password');
    })

    it('has Login button', () => {
      const loginPage = fixture.nativeElement as HTMLElement;
      const button = loginPage.querySelector('button');
      expect(button?.textContent).toContain('Login');
    })

    it('disables the button initially', () => {
      const loginPage = fixture.nativeElement as HTMLElement;
      const button = loginPage.querySelector('button');
      expect(button?.disabled).toBeTruthy();
    })
  })
  describe('Interactions', () => {
    let button : any;
    let httpTestingController : HttpTestingController;
    let loginPage: HTMLElement;
    let emailInput : HTMLInputElement;
    let passwordInput : HTMLInputElement;
    const setupForm = async (email = 'user1@mail.com') => {
      httpTestingController = TestBed.inject(HttpTestingController);

      loginPage = fixture.nativeElement as HTMLElement;

      await fixture.whenStable();
      emailInput = loginPage.querySelector('input[id="email"]') as HTMLInputElement;
      passwordInput = loginPage.querySelector('input[id="password"]') as HTMLInputElement;
      emailInput.value = email;
      emailInput.dispatchEvent(new Event('input'));
      emailInput.dispatchEvent(new Event('blur'));
      passwordInput.value = "P4ssword";
      passwordInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      button = loginPage.querySelector('button');
    }

    it('enables the button when all the fields have valid input', async () => {
      await setupForm();
      expect(button?.disabled).toBeFalsy();
    })
    it('does not enable button when fields are invalid', async () => {
      await setupForm('a');
      expect(button?.disabled).toBeTruthy();
    })

    it('sends email and password to backend after clicking the button', async () => {
      await setupForm();
      fixture.detectChanges();
      button?.click();
      const req = httpTestingController.expectOne("/api/1.0/auth");
      const requestBody = req.request.body;
      expect(requestBody).toEqual({
        password: "P4ssword",
        email: "user1@mail.com"
      })
    })

    it('disables button when there is an ongoing api call', async () => {
      await setupForm();
      button.click();
      fixture.detectChanges();
      button.click();
      httpTestingController.expectOne("/api/1.0/auth");
      expect(button.disabled).toBeTruthy();
    })

    it('displays spinner after clicking the submit', async () => {
      await setupForm();
      expect(loginPage.querySelector('span[role="status"]')).toBeFalsy();
      button.click();
      fixture.detectChanges();
      expect(loginPage.querySelector('span[role="status"]')).toBeTruthy();
    })

    it('displays error after submit failure', async () => {
      await setupForm();
      button.click();
      const req = httpTestingController.expectOne("/api/1.0/auth");
      req.flush({
        message: 'Incorrect Credentials'
      }, {
        status: 401,
        statusText: 'Unauthorized'
      });
      fixture.detectChanges();
      const error = loginPage.querySelector(`.alert`);
      expect(error?.textContent).toContain("Incorrect Credentials");
    })

    it('hides spinner after sign up request fails', async () => {
      await setupForm();
      button.click();
      const req = httpTestingController.expectOne("/api/1.0/auth");
      req.flush({
        message: 'Incorrect Credentials'
      }, {
        status: 401,
        statusText: 'Unauthorized'
      });
      fixture.detectChanges();
      expect(loginPage.querySelector('span[role="status"]')).toBeFalsy();
    })

    it('clears error after email field is changed', async() => {
      await setupForm();
      button.click();
      const req = httpTestingController.expectOne("/api/1.0/auth");
      req.flush({
        message: 'Incorrect Credentials'
      }, {
        status: 401,
        statusText: 'Unauthorized'
      });
      fixture.detectChanges();
      emailInput.value = "valid@mail.com";
      emailInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(loginPage.querySelector(`.alert`)).toBeFalsy();
    })
    it('clears error after password field is changed', async() => {
      await setupForm();
      button.click();
      const req = httpTestingController.expectOne("/api/1.0/auth");
      req.flush({
        message: 'Incorrect Credentials'
      }, {
        status: 401,
        statusText: 'Unauthorized'
      });
      fixture.detectChanges();
      passwordInput.value = "P4ssword2";
      passwordInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(loginPage.querySelector(`.alert`)).toBeFalsy();
    })
  })

  describe('Validation', () => {
    const testCases = [
      { field: 'email', value: '', error: 'E-mail is required'},
      { field: 'email', value: 'wrong-format', error: 'Invalid e-mail address'},
      { field: 'password', value: '', error: 'Password is required'},
    ]

    testCases.forEach(({field, value, error }) => {
      it(`displays ${error} when ${field} has '${value}'`, async () => {
        await fixture.whenStable();
        const loginPage = fixture.nativeElement as HTMLElement;
        expect(loginPage.querySelector(`div[data-testid="${field}-validation"]`)).toBeNull();
        const input = loginPage.querySelector(`input[id="${field}"]`) as HTMLInputElement;
        input.value = value;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('blur'));
        fixture.detectChanges();
        const validationElement = loginPage.querySelector(`div[data-testid="${field}-validation"]`);
        expect(validationElement?.textContent).toContain(error);
      })
    })
  })
});
