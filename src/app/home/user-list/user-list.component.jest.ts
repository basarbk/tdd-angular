import { HttpClientModule } from '@angular/common/http';
import { render, screen, waitFor } from '@testing-library/angular';
import { UserListComponent } from './user-list.component';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { getPage } from './user-list.component.spec';

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
    return res(ctx.status(200), ctx.json(getPage(page, size)))
  })
  )
  
beforeAll(() => server.listen())
beforeEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('User List', () => {

  it('displays three user in list', async () => {
    await render(UserListComponent, {
      imports: [ HttpClientModule]
    })
    await waitFor(() => {
      expect(screen.queryAllByText(/user/).length).toBe(3);
    })
  })

})