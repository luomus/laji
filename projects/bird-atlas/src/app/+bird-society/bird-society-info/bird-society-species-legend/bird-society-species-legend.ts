import { ChangeDetectionStrategy, Component } from '@angular/core';
import { atlasClassStyleLookup } from '../bird-society-info-map/bird-society-info-map.component';

@Component({
  selector: 'ba-bird-society-species-legend',
  templateUrl: './bird-society-species-legend.html',
  styleUrls: ['./bird-society-species-legend.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BirdSocietySpeciesLegendComponent {
  legend = [
    {
      label: 'Epätodennäköinen',
      color: atlasClassStyleLookup['MY.atlasClassEnumA'].fillColor
    },
    {
      label: 'Mahdollinen',
      color: atlasClassStyleLookup['MY.atlasClassEnumB'].fillColor
    },
    {
      label: 'Todennäköinen',
      color: atlasClassStyleLookup['MY.atlasClassEnumC'].fillColor
    },
    {
      label: 'Varma',
      color: atlasClassStyleLookup['MY.atlasClassEnumD'].fillColor
    },
  ];
}
