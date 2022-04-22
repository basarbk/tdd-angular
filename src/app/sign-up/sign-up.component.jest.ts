import { render, screen } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import userEvent from "@testing-library/user-event";
import "whatwg-fetch";
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

const setup = async () => {
  await render(SignUpComponent, {
    imports: [HttpClientTestingModule]
  });
}

describe('SignUpComponent', () => {
  describe('Layout', () => {
    it('has Sign Up header', async () => {
      await setup();
      const header = screen.getByRole('heading', { name: 'Sign Up' });
      expect(header).toBeInTheDocument();
    });
    it('has username input', async () => {
      await setup();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('has email input', async () => {
      await setup();
      expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    });

    it('has password input', async () => {
      await setup();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('has password type for password input', async () => {
      await setup();
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('has password repeat input', async () => {
      await setup();
      expect(screen.getByLabelText('Password Repeat')).toBeInTheDocument();
    });

    it('has password type for password repeat input', async () => {
      await setup();
      const input = screen.getByLabelText('Password Repeat');
      expect(input).toHaveAttribute('type', 'password');
    });
    it('has Sign Up button', async () => {
      await setup();
      const button = screen.getByRole('button', { name: 'Sign Up' });
      expect(button).toBeInTheDocument();
    });
    it('disables the button initially', async () => {
      await setup();
      const button = screen.getByRole('button', { name: 'Sign Up' });
      expect(button).toBeDisabled();
    });
  });
  describe('Interactions', () => {
    it('enables the button when the password and password repeat fields have same value', async () => {
      await setup();
      const password = screen.getByLabelText('Password');
      const passwordRepeat = screen.getByLabelText('Password Repeat');
      await userEvent.type(password, "P4ssword");
      await userEvent.type(passwordRepeat, "P4ssword");
      const button = screen.getByRole('button', { name: 'Sign Up' });
      expect(button).toBeEnabled();
    })
    it('sends username, email and password to backend after clicking the button', async () => {
      await setup();
      let httpTestingController = TestBed.inject(HttpTestingController);
      const username = screen.getByLabelText('Username');
      const email = screen.getByLabelText('E-mail');
      const password = screen.getByLabelText('Password');
      const passwordRepeat = screen.getByLabelText('Password Repeat');
      await userEvent.type(username, "user1");
      await userEvent.type(email, "user1@mail.com");
      await userEvent.type(password, "P4ssword");
      await userEvent.type(passwordRepeat, "P4ssword");
      const button = screen.getByRole('button', { name: 'Sign Up' });
      await userEvent.click(button);
      const req = httpTestingController.expectOne("/api/1.0/users");
      const requestBody = req.request.body;
      expect(requestBody).toEqual({
        username: "user1",
        password: "P4ssword",
        email: "user1@mail.com"
      })
      
    })
  });
});
