import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user.service';
import { AuthenticationService } from '../../core/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styles: ['span { cursor: pointer;}'
  ]
})
export class NavbarComponent implements OnInit {

  constructor(readonly authenticationService: AuthenticationService,
    private userService: UserService) { }

  ngOnInit(): void {
  }

  logout(){
    this.authenticationService.logout();
    this.userService.logout().subscribe(() => {})
  }

}
