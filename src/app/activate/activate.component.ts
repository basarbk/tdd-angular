import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styles: [
  ]
})
export class ActivateComponent implements OnInit {

  activationStatus!: 'success' | 'fail' | 'inProgress';

  constructor(private route: ActivatedRoute, private userService: UserService) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.activationStatus = 'inProgress'
      this.userService.activate(params['id']).subscribe({
        next: () => {
          this.activationStatus = 'success';
        },
        error: () => {
          this.activationStatus = 'fail';
        }
      })
    })
  }

}
