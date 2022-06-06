import { render, screen, waitFor } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

type UniqueEmailCheck = {
  email: string
}

let requestBody: any;
let counter = 0;
const server = setupServer(
  rest.post('/api/1.0/users', (req, res, ctx) => {
    requestBody = req.body;
    counter += 1;
    if(requestBody.email === 'not-unique@mail.com') {
      return res(ctx.status(400), ctx.json({
        validationErrors: { email: 'E-mail in use'}
      }))
    }
    return res(ctx.status(200), ctx.json({}));
  }),
  rest.post('/api/1.0/user/email', (req, res, ctx) => {
    const body = req.body as UniqueEmailCheck
    if(body.email === 'non-unique-email@mail.com') {
      return res(ctx.status(200), ctx.json({}))
    }
    return res(ctx.status(404), ctx.json({}));
  })
);

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

const setup = async () => {
  await render(SignUpComponent, {
    imports: [HttpClientModule, SharedModule, ReactiveFormsModule],
  });
};

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
    let button: any;
    const setupForm = async (values?: {email: string}) => {
      await setup();
      const username = screen.getByLabelText('Username');
      const email = screen.getByLabelText('E-mail');
      const password = screen.getByLabelText('Password');
      const passwordRepeat = screen.getByLabelText('Password Repeat');
      await userEvent.type(username, 'user1');
      await userEvent.type(email, values?.email || 'user1@mail.com');
      await userEvent.type(password, 'P4ssword');
      await userEvent.type(passwordRepeat, 'P4ssword');
      button = screen.getByRole('button', { name: 'Sign Up' });
    };
    it('enables the button when all the fields have valid input', async () => {
      await setupForm();
      expect(button).toBeEnabled();
    });
    it('sends username, email and password to backend after clicking the button', async () => {
      await setupForm();
      await userEvent.click(button);

      await waitFor(() => {
        expect(requestBody).toEqual({
          username: 'user1',
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
    it('displays account activation notification after successful sign up request', async () => {
      await setupForm();
      expect(
        screen.queryByText('Please check your e-mail to activate your account')
      ).not.toBeInTheDocument();
      await userEvent.click(button);
      const text = await screen.findByText(
        'Please check your e-mail to activate your account'
      );
      expect(text).toBeInTheDocument();
    });
    it('hides sign up form after successful sign up request', async () => {
      await setupForm();
      const form = screen.getByTestId('form-sign-up');
      await userEvent.click(button);
      await screen.findByText(
        'Please check your e-mail to activate your account'
      );
      expect(form).not.toBeInTheDocument();
    });
    it('displays validation error coming from backend after submit failure', async () => {
      await setupForm({email: 'not-unique@mail.com'});
      await userEvent.click(button);
      const errorMessage = await screen.findByText(
        'E-mail in use'
      );
      expect(errorMessage).toBeInTheDocument();
    });
    it('hides spinner after sign up request fails', async () => {
      await setupForm({email: 'not-unique@mail.com'});
      await userEvent.click(button);
      await screen.findByText(
        'E-mail in use'
      );
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    })
  });
  describe('Validation', () => {
    it.each`
      label                | inputValue                     | message
      ${'Username'}        | ${'{space}{backspace}'}        | ${'Username is required'}
      ${'Username'}        | ${'123'}                       | ${'Username must be at least 4 characters long'}
      ${'E-mail'}          | ${'{space}{backspace}'}        | ${'E-mail is required'}
      ${'E-mail'}          | ${'wrong-format'}              | ${'Invalid e-mail address'}
      ${'Password'}        | ${'{space}{backspace}'}        | ${'Password is required'}
      ${'Password'}        | ${'password'}                  | ${'Password must have at least 1 uppercase, 1 lowecase letter and 1 number'}
      ${'Password'}        | ${'passWORD'}                  | ${'Password must have at least 1 uppercase, 1 lowecase letter and 1 number'}
      ${'Password'}        | ${'pass1234'}                  | ${'Password must have at least 1 uppercase, 1 lowecase letter and 1 number'}
      ${'Password'}        | ${'PASS1234'}                  | ${'Password must have at least 1 uppercase, 1 lowecase letter and 1 number'}
      ${'Password Repeat'} | ${'pass'}                      | ${'Password mismatch'}
      ${'E-mail'}          | ${'non-unique-email@mail.com'} | ${'E-mail in use'}
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
