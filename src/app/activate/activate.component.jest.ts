import { HttpClientModule } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { render, screen, waitFor } from "@testing-library/angular";
import { Observable, Subscriber } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { ActivateComponent } from "./activate.component";
import { setupServer } from 'msw/node';
import { rest } from 'msw';

type RouteParams = {
  id: string
}

let subscriber!: Subscriber<RouteParams>;

const setup = async () => {
  const observable = new Observable<RouteParams>(sub => subscriber = sub)
  await render(ActivateComponent, {
    declarations: [ AlertComponent ],
    imports: [HttpClientModule],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          params: observable
        }
      }
    ]

  })
}

let counter = 0;

const server = setupServer(
  rest.post('/api/1.0/users/token/:token', (req, res, ctx) => {
    counter += 1;
    if(req.params['token'] === '456') {
      return res(ctx.status(400), ctx.json({}))
    }
    return res(ctx.status(200))
  })
);

beforeEach(() => {
  counter = 0;
  server.resetHandlers();
});

beforeAll(() => server.listen());

afterAll(() => server.close());

describe('Account Activation Page', () => {

  it('sends account activation request', async () => {
    await setup();
    subscriber.next({id: '123'});
    await waitFor(() => {
      expect(counter).toBe(1);
    })
  })
  it('displays activation success message when token is valid', async () => {
    await setup();
    subscriber.next({id: '123'});
    const message = await screen.findByText('Account is activated');
    expect(message).toBeInTheDocument();
  })
  it('displays activation failure message when token is invalid', async () => {
    await setup();
    subscriber.next({id: '456'});
    const message = await screen.findByText('Activation failure');
    expect(message).toBeInTheDocument();
  })
  it('displays spinner during activation api call', async () => {
    await setup();
    subscriber.next({id: '456'});
    const spinner = await screen.findByRole('status');
    await screen.findByText('Activation failure');
    expect(spinner).not.toBeInTheDocument();
  })


})