import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../core/user.service';
import { User } from '../shared/types';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styles: [
  ]
})
export class UserComponent implements OnInit {

  status!: 'success' | 'fail' | 'inProgress';

  user!: User;

  constructor(private route: ActivatedRoute,
     private userService: UserService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.status = 'inProgress'
      this.userService.getUserById(params['id']).subscribe({
        next: (data) => {
          this.status = 'success';
          this.user = data as User;
        },
        error: () => {
          this.status = 'fail';
        }
      })
    })
  }

}
