import { Component } from '@angular/core';
import {OmniSearchComponent} from "../../shared";



@Component({
  selector: 'laji-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css'],
  directives: [OmniSearchComponent]
})
export class SearchBarComponent {}
