import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/shared/types';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {

  @Input() user!: User;

  constructor() { }

  ngOnInit(): void {
  }

}
