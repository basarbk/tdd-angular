import { render, screen } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import userEvent from "@testing-library/user-event";

describe('SignUpComponent', () => {
  describe('Layout', () => {
    it('has Sign Up header', async () => {
      await render(SignUpComponent);
      const header = screen.getByRole('heading', { name: 'Sign Up' });
      expect(header).toBeInTheDocument();
    });
    it('has username input', async () => {
      await render(SignUpComponent);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('has email input', async () => {
      await render(SignUpComponent);
      expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    });

    it('has password input', async () => {
      await render(SignUpComponent);
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('has password type for password input', async () => {
      await render(SignUpComponent);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('has password repeat input', async () => {
      await render(SignUpComponent);
      expect(screen.getByLabelText('Password Repeat')).toBeInTheDocument();
    });

    it('has password type for password repeat input', async () => {
      await render(SignUpComponent);
      const input = screen.getByLabelText('Password Repeat');
      expect(input).toHaveAttribute('type', 'password');
    });
    it('has Sign Up button', async () => {
      await render(SignUpComponent);
      const button = screen.getByRole('button', { name: 'Sign Up' });
      expect(button).toBeInTheDocument();
    });
    it('disables the button initially', async () => {
      await render(SignUpComponent);
      const button = screen.getByRole('button', { name: 'Sign Up' });
      expect(button).toBeDisabled();
    });
  });
  describe('Interactions', () => {
    it('enabels the button when the password and password repeat fields have same value', async () => {
      await render(SignUpComponent);
      const password = screen.getByLabelText('Password');
      const passwordRepeat = screen.getByLabelText('Password Repeat');
      await userEvent.type(password, "P4ssword");
      await userEvent.type(passwordRepeat, "P4ssword");
      const button = screen.getByRole('button', { name: 'Sign Up' });
      expect(button).toBeEnabled();
    })
  });
});
