import { Input, Component, OnInit } from '@angular/core';
import { AreaService } from '../../../../../shared/service/area.service';

@Component({
  selector: 'laji-np-area-form',
  templateUrl: './np-area-form.component.html',
  styleUrls: ['./np-area-form.component.css']
})
export class NpAreaFormComponent implements OnInit {
  @Input() lang;
  @Input() visible;

  countries: any;
  municipalities: any;
  biogeographicalProvinces: any;

  constructor(
    private areaService: AreaService
  ) {}

  ngOnInit() {
    this.areaService.getCountries(this.lang).subscribe(value => {
      this.countries = value;
    });

    this.areaService.getMunicipalities(this.lang).subscribe(value => {
      this.municipalities = value;
    });

    this.areaService.getBiogeographicalProvinces(this.lang).subscribe(value => {
      this.biogeographicalProvinces = value;
    });
  }
}
