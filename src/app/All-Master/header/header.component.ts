import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input() showElement: boolean = false;
  todaye: Date = new Date;
  username: string | null = '';
  token: string | null = '';

  constructor(private router: Router, private http: HttpClient) { 
    this.username = localStorage.getItem('username');
    this.token = localStorage.getItem('token');
  }

  handleLogout(event: MouseEvent) {
    console.log('Logout clicked');
    // Prevent default behavior of the anchor tag
    event.preventDefault();

    // Call the logout function
    this.logout();
  }

  logout() {
    console.log('Logging out user');
    const token = localStorage.getItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userdata');
    localStorage.removeItem('adminAccess');
    localStorage.removeItem('logintype');
    localStorage.removeItem('roleName');
    localStorage.removeItem('conditionList');
    localStorage.removeItem('conditionListJson');

    const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
    });
    let url = `${environment.baseUrl}/auth/logout`
    return this.http.post(url, {}, { headers }).subscribe(
      res => {
      // Clear storage after successful logout
      localStorage.clear();
      // Redirect to login/home page
      this.router.navigate(['']);
    },
     err => {
      console.error('Logout failed', err);
      // Optional: still clear local data
      localStorage.clear();
      this.router.navigate(['']);
    });
  }
}
