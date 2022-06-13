import { HttpClientModule } from '@angular/common/http';
import { render, screen, waitFor } from '@testing-library/angular';
import { UserListComponent } from './user-list.component';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import userEvent from "@testing-library/user-event";
import { getPage } from './test-helper';
import { UserListItemComponent } from '../user-list-item/user-list-item.component';

const server = setupServer(
  rest.get('/api/1.0/users', (req, res, ctx) => {
    let size = Number.parseInt(req.url.searchParams.get('size')!);
    let page = Number.parseInt(req.url.searchParams.get('page')!);
    if(Number.isNaN(size)) {
      size = 5;
    }
    if(Number.isNaN(page)) {
      page = 0;
    }
    return res(ctx.status(200)
    , ctx.json(getPage(page, size)))
  })
  )
  
beforeAll(() => server.listen())
beforeEach(() => server.resetHandlers())
afterAll(() => server.close())

const setup = async () => {
  await render(UserListComponent, {
    declarations: [UserListItemComponent],
    imports: [ HttpClientModule]
  })
}

describe('User List', () => {

  it('displays three user in list', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.queryAllByText(/user/).length).toBe(3);
    })
  })

  it('displays next page button', async () => {
    await setup();
    await screen.findByText('user1');
    expect(screen.queryByText('next >')).toBeInTheDocument();
  })
  it('displays next page after clicking next', async () => {
    await setup();
    await screen.findByText('user1');
    await userEvent.click(screen.getByText('next >'));
    const firstUserInPage2 = await screen.findByText('user4');
    expect(firstUserInPage2).toBeInTheDocument();
  })
  it('hides next page button at last page', async () => {
    await setup();
    await screen.findByText('user1');
    await userEvent.click(screen.getByText('next >'));
    await screen.findByText('user4');
    await userEvent.click(screen.getByText('next >'));
    await screen.findByText('user7');
    expect(screen.queryByText('next >')).not.toBeInTheDocument();
  })
  it('does not display the previous page button in first page', async () => {
    await setup();
    await screen.findByText('user1');
    expect(screen.queryByText('< previous')).not.toBeInTheDocument();
  })
  it('displays previous page button in page 2', async () => {
    await setup();
    await screen.findByText('user1');
    await userEvent.click(screen.getByText('next >'));
    await screen.findByText('user4');
    expect(screen.queryByText('< previous')).toBeInTheDocument();
  })
  it('displays previous page after clicking previous page button', async () => {
    await setup();
    await screen.findByText('user1');
    await userEvent.click(screen.getByText('next >'));
    await screen.findByText('user4');
    await userEvent.click(screen.getByText('< previous'));
    const firstUserInFirstPage = await screen.findByText('user1');
    expect(firstUserInFirstPage).toBeInTheDocument();
  })
  it('displays spinner during the api call', async () => {
    await setup();
    const spinner = screen.getByRole('status')
    await screen.findByText('user1');
    expect(spinner).not.toBeInTheDocument();
  })
})