import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/user.service';
import { UserPage } from 'src/app/shared/types';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  page: UserPage = {
    content: [],
    page: 0,
    size: 3,
    totalPages: 0
  }

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.loadUsers().subscribe(responseBody => {
      this.page = responseBody as UserPage;
    })
  }

}
