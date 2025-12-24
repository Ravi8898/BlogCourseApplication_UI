import { Component } from '@angular/core';
// import { datadogRum } from '@datadog/browser-rum';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Vendor_Portal';

  ngOnInit() {
    // datadogRum.init({
    //   applicationId: 'f4eadd71-99f8-4384-afbb-6c89de0dfbb7',
    //   clientToken: 'pub46353a7ecd74f1e0bcfc5591fb4e0a3a',
    //   // `site` refers to the Datadog site parameter of your organization
    //   // see https://docs.datadoghq.com/getting_started/site/
    //   site: 'us3.datadoghq.com',
    //   service: 'vspeed-user-interaction',
    //   env: environment.production ? 'prod' : 'qa',
    //   // Specify a version number to identify the deployed version of your application in Datadog
    //   // version: '1.0.0',
    //   sessionSampleRate: 100,
    //   sessionReplaySampleRate: 20,
    //   trackUserInteractions: true,
    //   trackResources: true,
    //   trackLongTasks: true,
    //   defaultPrivacyLevel: 'mask-user-input',
    // });
  }

}
