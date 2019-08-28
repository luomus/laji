# Label Designer

This Angular library enables users to design their own printable labels.
Visuals and the fields for the label can be defined by the users.
This was developed specimen data in mind, but this can be used for other kinds of labels also.

## Gettings started
1. install the package either
   with npm `npm install --save label-designer` or 
   with yarn `yarn add label-designer`
2. Include the Label Designer Module
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

3. Use the Label Designer component
```
<ll-label-designer
  (html)="onHtml($event)"
  [data]="data"
  [(availableFields)]="availableFields"
  [setup]="setup"
  (setupChange)="onSetupChange($event)"
></ll-label-designer>
```

For more information on how to use the component see the documentation here.
