export class LocalizedError extends Error {
	context?: Record<string, string>;
	localized = true;
	constructor(translationKey: string, context?: Record<string, string>)  {
		super(translationKey);
		this.context = context;
	}
}

