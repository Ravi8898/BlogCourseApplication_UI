import { Component } from '@angular/core';

@Component({
  selector: 'app-saml-callback',
  templateUrl: './saml-callback.component.html',
  styleUrls: ['./saml-callback.component.scss']
})
export class SamlCallbackComponent {

  ngOnInit(): void {

    window.location.href='https://vspeed.adani.com/saml/login'
  }


}
