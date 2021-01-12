import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';

@Component({
  selector: 'laji-kerttu-count',
  templateUrl: './kerttu-count.component.html',
  styleUrls: ['./kerttu-count.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KerttuCountComponent implements OnInit {
  @Input() label: string;
  @Input() count: number;
  @Input() additionalDescription: string;

  constructor() { }

  ngOnInit(): void {
  }

}
