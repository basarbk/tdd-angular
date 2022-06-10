import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { render, screen } from '@testing-library/angular';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { routes } from './router/app-router.module';
import { SharedModule } from './shared/shared.module';
import { SignUpComponent } from './sign-up/sign-up.component';

const setup = async (path: string) => {
  const { navigate } = await render(AppComponent, {
    declarations: [HomeComponent, SignUpComponent],
    imports: [HttpClientModule, SharedModule, ReactiveFormsModule],
    routes: routes,
  });
  await navigate(path);
};

describe('Routing', () => {
  it.each`
    path         | pageId
    ${'/'}       | ${'home-page'}
    ${'/signup'} | ${'sign-up-page'}
    ${'/login'}  | ${'login-page'}
    ${'/user/1'} | ${'user-page'}
    ${'/user/2'} | ${'user-page'}
  `('displays $pageId when path is $path', async ({ path, pageId }) => {
    await setup(path);
    const page = screen.queryByTestId(pageId);
    expect(page).toBeInTheDocument();
  });
});
