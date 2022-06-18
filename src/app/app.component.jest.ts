import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/angular';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { routes } from './router/app-router.module';
import { SharedModule } from './shared/shared.module';
import { SignUpComponent } from './sign-up/sign-up.component';
import userEvent from '@testing-library/user-event';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './login/login.component';
import { ActivateComponent } from './activate/activate.component';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { UserListComponent } from './home/user-list/user-list.component';
import { UserListItemComponent } from './home/user-list-item/user-list-item.component';
import { ProfileCardComponent } from './user/profile-card/profile-card.component';
import { LoggedInUser } from './shared/types';

let logoutCounter = 0;
const server = setupServer(
  rest.post('/api/1.0/users/token/:token', (req, res, ctx) => {
    return res(ctx.status(200))
  }),
  rest.get('/api/1.0/users', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
      content: [
        { id: 1, username: 'user1', email: 'user1@mail.com' },
      ],
      page: 0,
      size: 3,
      totalPages: 1,
    }))
  }),
  rest.get('/api/1.0/users/:id', (req, res, ctx) => {
    const id = Number(req.params['id']);
    return res(ctx.status(200), ctx.json({
      id,
      username: `user${id}`,
      email: `user${id}@mail.com`
    }))
  }),
  rest.post('/api/1.0/auth', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ id: 1, username: "user1"}))
  }),
  rest.post('/api/1.0/logout', (req, res, ctx) => {
    logoutCounter += 1;
    return res(ctx.status(200));
  })
);

beforeEach(() => {
  logoutCounter = 0;
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

afterEach(() => localStorage.clear());

const setup = async (path: string) => {
  const { navigate } = await render(AppComponent, {
    declarations: [
      HomeComponent,
      SignUpComponent,
      UserComponent,
      LoginComponent,
      ActivateComponent,
      UserListComponent,
      UserListItemComponent,
      ProfileCardComponent
    ],
    imports: [HttpClientModule, SharedModule, ReactiveFormsModule, FormsModule],
    routes: routes,
  });
  await navigate(path);
};

describe('Routing', () => {
  it.each`
    path               | pageId
    ${'/'}             | ${'home-page'}
    ${'/signup'}       | ${'sign-up-page'}
    ${'/login'}        | ${'login-page'}
    ${'/user/1'}       | ${'user-page'}
    ${'/user/2'}       | ${'user-page'}
    ${'/activate/123'} | ${'activation-page'}
    ${'/activate/456'} | ${'activation-page'}
  `('displays $pageId when path is $path', async ({ path, pageId }) => {
    await setup(path);
    const page = screen.queryByTestId(pageId);
    expect(page).toBeInTheDocument();
  });

  it.each`
    path         | title
    ${'/'}       | ${'Home'}
    ${'/signup'} | ${'Sign Up'}
    ${'/login'}  | ${'Login'}
  `('has link with title $title to $path', async ({ path, title }) => {
    await setup(path);
    const link = screen.queryByRole('link', { name: title });
    expect(link).toBeInTheDocument();
  });

  it.each`
    initialPath  | clickingTo   | visiblePage
    ${'/'}       | ${'Sign Up'} | ${'sign-up-page'}
    ${'/signup'} | ${'Home'}    | ${'home-page'}
    ${'/'}       | ${'Login'}   | ${'login-page'}
  `(
    'displays $visiblePage after clicking $clickingTo link',
    async ({ initialPath, clickingTo, visiblePage }) => {
      await setup(initialPath);
      const link = screen.getByRole('link', { name: clickingTo });
      await userEvent.click(link);
      const page = await screen.findByTestId(visiblePage);
      expect(page).toBeInTheDocument();
    }
  );

  it('navigates to user page when clicking the username on user list', async () => {
    await setup('/');
    const userListItem = await screen.findByText('user1');
    await userEvent.click(userListItem);
    const page = await screen.findByTestId("user-page");
    expect(page).toBeInTheDocument();
  })
});

describe('Login', () => {
  let button: any;
  const setupForm = async () => {
    await setup('/login');
    await userEvent.type(screen.getByLabelText('E-mail'), 'user1@mail.com');
    await userEvent.type(screen.getByLabelText('Password'), 'P4ssword');
    button = screen.getByRole('button', { name: 'Login' });
  };
  it('redirects to home page after successful login', async () => {
    await setupForm();
    await userEvent.click(button);
    const homePage = await screen.findByTestId('home-page');
    expect(homePage).toBeInTheDocument();
  })
  it('hides Login and Sign Up from nav bar after successful login', async () => {
    await setupForm();
    const loginLink = screen.getByRole('link', { name: 'Login'});
    const signUpLink = screen.getByRole('link', { name: 'Login'});
    await userEvent.click(button);
    await waitForElementToBeRemoved(loginLink);
    expect(signUpLink).not.toBeInTheDocument();
  })

  it('displays My Profile link on nav bar after successful login', async () => {
    await setupForm();
    expect(screen.queryByRole('link', { name: 'My Profile'})).not.toBeInTheDocument();
    await userEvent.click(button);
    const myProfileLink = await screen.findByRole('link', { name: 'My Profile'})
    expect(myProfileLink).toBeInTheDocument();
  })

  it('displays Logout link on nav bar after successful login', async () => {
    await setupForm();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    await userEvent.click(button);
    const logoutLink = await screen.findByText('Logout')
    expect(logoutLink).toBeInTheDocument();
  })

  it('displays User Page with logged in user id in url after clicking My Profile link on nav bar', async () => {
    await setupForm();
    await userEvent.click(button);
    const myProfileLink = await screen.findByRole('link', { name: 'My Profile'})
    await userEvent.click(myProfileLink);
    await screen.findByTestId('user-page');
    const header = await screen.findByRole('heading', { name: 'user1'});
    expect(header).toBeInTheDocument();
  })

  it('stores logged in state in local storage', async () => {
    await setupForm();
    await userEvent.click(button);
    await screen.findByTestId('home-page');
    const state = JSON.parse(localStorage.getItem('auth')!) as LoggedInUser;
    expect(state.isLoggedIn).toBe(true);
  })

  it('displays layout of logged in user', async () => {
    localStorage.setItem('auth', JSON.stringify({ isLoggedIn: true}))
    await setup('/');
    const myProfileLink = await screen.findByRole('link', { name: 'My Profile'})
    expect(myProfileLink).toBeInTheDocument();
  })

  it('displays Login and Sign Up after clicking Logout', async () => {
    await setupForm();
    await userEvent.click(button);
    const logoutLink = await screen.findByText('Logout')
    await userEvent.click(logoutLink);
    const loginLink = await screen.findByRole('link', { name: 'Login'})
    expect(loginLink).toBeInTheDocument();
    const signUpLink = await screen.findByRole('link', { name: 'Sign Up'})
    expect(signUpLink).toBeInTheDocument();
  })

  it('clears storage after user logs out', async () => {
    await setupForm();
    await userEvent.click(button);
    const logoutLink = await screen.findByText('Logout')
    await userEvent.click(logoutLink);
    await screen.findByRole('link', { name: 'Login'})
    const state = localStorage.getItem('auth');
    expect(state).toBeNull();
  })

  it('sends logout request to backend', async () => {
    await setupForm();
    await userEvent.click(button);
    const logoutLink = await screen.findByText('Logout')
    await userEvent.click(logoutLink);
    await screen.findByRole('link', { name: 'Login'})
    expect(logoutCounter).toBe(1);
  })

})