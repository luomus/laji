# Using as Angular module

Installation steps 
1. Make sure that you all the [dependencies](../dependencies.html) installed.
2. Import the `LabelDesignerModule` from `label-designer` package in the module 
where you want to use it.
```
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LabelDesignerModule } from 'label-designer';
@NgModule({
    imports: [
        BrowserModule,
        LabelDesignerModule
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```
3. Use the `ll-label-designer` tag where ever needed.
```
<ll-label-designer
      (html)="onHtml($event)"
      [data]="data"
      [(availableFields)]="availableFields"
      [setup]="setup"
      (setupChange)="onSetupChange($event)"
></ll-label-designer>
```

More information about all the inputs and outputs [here](../../components/LabelDesignerComponent.html).


