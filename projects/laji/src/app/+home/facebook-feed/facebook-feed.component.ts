import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'laji-facebook-feed',
  template: `<iframe src="//www.facebook.com/plugins/likebox.php?href=https%3A%2F%2Fwww.facebook.com%2Flajitietokeskus&stream=true&width=250&height=400&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" width="250" height="400" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FacebookFeedComponent {}
