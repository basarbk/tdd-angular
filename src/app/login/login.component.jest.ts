import { render, screen, waitFor } from '@testing-library/angular';
import { LoginComponent } from './login.component';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

let requestBody: any;
let counter = 0;
const server = setupServer(
  rest.post('/api/1.0/auth', (req, res, ctx) => {
    requestBody = req.body;
    counter += 1;
    if(requestBody.email === 'failing-user@mail.com') {
      return res(ctx.status(401), ctx.json({
        message: 'Incorrect Credentials'
      }))
    }
    return res(ctx.status(200), ctx.json({}));
  })
);

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

const setup = async () => {
  await render(LoginComponent, {
    imports: [HttpClientModule, SharedModule, FormsModule],
  });
};

describe('LoginComponent', () => {
  describe('Layout', () => {
    it('has Login header', async () => {
      await setup();
      const header = screen.getByRole('heading', { name: 'Login' });
      expect(header).toBeInTheDocument();
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

    it('has Login button', async () => {
      await setup();
      const button = screen.getByRole('button', { name: 'Login' });
      expect(button).toBeInTheDocument();
    });
    it('disables the button initially', async () => {
      await setup();
      const button = screen.getByRole('button', { name: 'Login' });
      expect(button).toBeDisabled();
    });
  });
  describe('Interactions', () => {
    let button: any;
    let emailInput : HTMLInputElement;
    let passwordInput : HTMLInputElement;
    const setupForm = async (values?: {email: string}) => {
      await setup();
      emailInput = screen.getByLabelText('E-mail');
      passwordInput = screen.getByLabelText('Password');
      await userEvent.type(emailInput, values?.email || 'user1@mail.com');
      await userEvent.type(passwordInput, 'P4ssword');
      button = screen.getByRole('button', { name: 'Login' });
    };
    it('enables the button when all the fields have valid input', async () => {
      await setupForm();
      expect(button).toBeEnabled();
    });
    it('sends email and password to backend after clicking the button', async () => {
      await setupForm();
      await userEvent.click(button);

      await waitFor(() => {
        expect(requestBody).toEqual({
          password: 'P4ssword',
          email: 'user1@mail.com',
        });
      });
    });
    it('disables button when there is an ongoing api call', async () => {
      await setupForm();
      await userEvent.click(button);
      await userEvent.click(button);
      await waitFor(() => {
        expect(counter).toBe(1);
      });
    });
    it('displays spinner after clicking the submit', async () => {
      await setupForm();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      await userEvent.click(button);
      expect(screen.queryByRole('status')).toBeInTheDocument();
    });

    it('displays validation error coming from backend after submit failure', async () => {
      await setupForm({email: 'failing-user@mail.com'});
      await userEvent.click(button);
      const errorMessage = await screen.findByText(
        'Incorrect Credentials'
      );
      expect(errorMessage).toBeInTheDocument();
    });
    it('hides spinner after Login request fails', async () => {
      await setupForm({email: 'failing-user@mail.com'});
      await userEvent.click(button);
      await screen.findByText(
        'Incorrect Credentials'
      );
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    })
    it('does not enable button when fields are invalid', async ()=> {
      await setupForm({email: 'a'});
      expect(button).toBeDisabled();
    })

    it('clears authentication fail message when email field is changed', async () => {
      await setupForm({email: 'failing-user@mail.com'});
      await userEvent.click(button);
      const errorMessage = await screen.findByText(
        'Incorrect Credentials'
      );
      await userEvent.type(emailInput, 'new@mail.com')
      expect(errorMessage).not.toBeInTheDocument();
    });
    it('clears authentication fail message when password field is changed', async () => {
      await setupForm({email: 'failing-user@mail.com'});
      await userEvent.click(button);
      const errorMessage = await screen.findByText(
        'Incorrect Credentials'
      );
      await userEvent.type(passwordInput, 'P4ssword2')
      expect(errorMessage).not.toBeInTheDocument();
    });
  });
  describe('Validation', () => {
    it.each`
      label                | inputValue                     | message
      ${'E-mail'}          | ${'{space}{backspace}'}        | ${'E-mail is required'}
      ${'E-mail'}          | ${'wrong-format'}              | ${'Invalid e-mail address'}
      ${'Password'}        | ${'{space}{backspace}'}        | ${'Password is required'}
    `(
      'displays $message when $label has the value "$inputValue"',
      async ({ label, inputValue, message }) => {
        await setup();
        expect(screen.queryByText(message)).not.toBeInTheDocument();
        const input = screen.getByLabelText(label);
        await userEvent.type(input, inputValue);
        await userEvent.tab();
        const errorMessage = await screen.findByText(message);
        expect(errorMessage).toBeInTheDocument();
      }
    );
  });
});
