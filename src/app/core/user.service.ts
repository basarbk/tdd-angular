import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private httpClient : HttpClient) { }
  
  signUp(body: { username: string, email: string, password: string}){
    return this.httpClient.post("/api/1.0/users", body)
  }

  isEmailTaken(value: string) {
    return this.httpClient.post('/api/1.0/user/email', {email: value})
  }

  activate(token: string) {
    return this.httpClient.post('/api/1.0/users/token/' + token, {});
  }

  loadUsers(){
    return this.httpClient.get('/api/1.0/users');
  }
}
