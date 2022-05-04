import { render, screen, waitFor } from '@testing-library/angular';
import { SignUpComponent } from './sign-up.component';
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { HttpClientModule } from '@angular/common/http';

let requestBody: any;
let counter = 0;
const server = setupServer(
  rest.post('/api/1.0/users', (req, res, ctx) => {
    requestBody = req.body
    counter += 1;
    return res(ctx.status(200), ctx.json({}))
  })
);

beforeEach(() => {
  counter = 0;
})

beforeAll(() => server.listen() )

afterAll(() => server.close())


const setup = async () => {
  await render(SignUpComponent, {
    imports: [HttpClientModule]
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
    let button: any;
    const setupForm = async () => {
      await setup();
      const username = screen.getByLabelText('Username');
      const email = screen.getByLabelText('E-mail');
      const password = screen.getByLabelText('Password');
      const passwordRepeat = screen.getByLabelText('Password Repeat');
      await userEvent.type(username, "user1");
      await userEvent.type(email, "user1@mail.com");
      await userEvent.type(password, "P4ssword");
      await userEvent.type(passwordRepeat, "P4ssword");
      button = screen.getByRole('button', { name: 'Sign Up' });
    }
    it('enables the button when the password and password repeat fields have same value', async () => {
      await setupForm();
      expect(button).toBeEnabled();
    })
    it('sends username, email and password to backend after clicking the button', async () => {
      await setupForm();
      await userEvent.click(button);

      await waitFor(() => {
        expect(requestBody).toEqual({
          username: "user1",
          password: "P4ssword",
          email: "user1@mail.com"
        })
      })
    })
    it('disables button when there is an ongoing api call', async () => {
      await setupForm();
      await userEvent.click(button);
      await userEvent.click(button);
      await waitFor(() => {
        expect(counter).toBe(1);
      })
    })
    it('displays spinner after clicking the submit', async () => {
      await setupForm();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      await userEvent.click(button);
      expect(screen.queryByRole("status")).toBeInTheDocument();
    })
  });
});
