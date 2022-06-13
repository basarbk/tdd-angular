import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/user.service';
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

  fetchingData = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(pageNumber: number = 0){
    this.fetchingData = true;
    this.userService.loadUsers(pageNumber).subscribe(responseBody => {
      this.page = responseBody as UserPage;
      this.fetchingData = false;
    })
  }

  get hasNextPage(){
    const { page, totalPages } = this.page;
    return totalPages > page + 1;
  }

  get hasPreviousPage(){
    return this.page.page != 0;
  }

}
