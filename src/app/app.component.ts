import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle } from '@capacitor/core';

const { StatusBar, SplashScreen } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    if (this.platform.is('hybrid')) {
      StatusBar.setBackgroundColor({ color: '#02023e' });
      StatusBar.setStyle({ style: StatusBarStyle.Dark });

      this.platform.ready()
        .then(async () => {
          await SplashScreen.hide();
        });
    }
  }
}
