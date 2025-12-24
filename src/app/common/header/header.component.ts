import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() showElement: boolean = false;
  todaye: Date = new Date;
  username: string | null = '';
  roleName: string | null = '';
  logintype: any = '';
  userdata: any;

  constructor(private router: Router) {
    this.username = localStorage.getItem('username');
    this.logintype = localStorage.getItem('logintype');
    this.roleName = localStorage.getItem('roleName');
    this.userdata = JSON.parse(localStorage.getItem('userdata') || '{}');
  }

  handleLogout(event: MouseEvent) {
    // Prevent default behavior of the anchor tag
    event.preventDefault();

    // Call the logout function
    this.logout();

    // Open the URL in a new window
    const newWindow = window.open('https://vspeed.adani.com/saml/logout', '_blank');

    // Automatically close the new window after 3 seconds (or any suitable time)
    setTimeout(() => {
      if (newWindow) {
        newWindow.close();
      }
    }, 3000);
  }

  logout() {
    localStorage.clear();

    // localStorage.removeItem('username');
    // localStorage.removeItem('token');
    // localStorage.removeItem('role');
    // localStorage.removeItem('userdata');
    // localStorage.removeItem('adminAccess');
    // localStorage.removeItem('logintype');
    // localStorage.removeItem('roleName');

    this.router.navigate(['']);
  }
}
