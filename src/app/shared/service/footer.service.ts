import {Injectable} from "@angular/core";

@Injectable()
export class FooterService {
  private _footerVisible:boolean = true;

  set footerVisible(visible) {
    if (visible !== this._footerVisible) {
      this._footerVisible = visible;
    }
  }

  get footerVisible() {
    return this._footerVisible;
  }
}
