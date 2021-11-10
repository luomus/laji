import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
	selector: 'es-pdf-modal',
	template: `
		<div class="panel"><iframe [src]="safeUrl" frameborder="0"></iframe></div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfModalComponent {
	public safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
	@Input() set url(u: string) {
		this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(u);
	}

	constructor(private sanitizer: DomSanitizer) {}
}
