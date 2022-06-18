import { Injectable } from '@angular/core';
import { LoggedInUser, User } from '../shared/types';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  loggedInUser : LoggedInUser = {
    id: 0,
    username: '',
    email: '',
    isLoggedIn: false
  }

  constructor() { }

  setLoggedInUser(user: User) {
    this.loggedInUser = {
      ...user,
      isLoggedIn: true
    }
  }
}
