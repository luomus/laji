<a name="4.0.1"></a>
# 4.0.1 (2020-05-12)

### Bug fix
* **editor:** fix QR code not responding to size settings  

<a name="4.0.0"></a>
# 4.0.0 (2020-04-26)

### Features
* **core:** update to angular 9 and update dependencies.

<a name="3.3.2"></a>
# 3.3.2 (2020-02-18)

### Bug fix
* **editor:** fix skip & repeat not reacting to inputs

<a name="3.3.1"></a>
# 3.3.1 (2020-02-17)

### Features
* **editor:** change repeat to use individual labels instead the whole data.

### Bug fix
* **editor:** fix skip & repeat inputs not reacting to array presses  

<a name="3.3.0"></a>
# 3.3.0 (2020-02-17)

### Features
* **editor:** added option to skip n labels from the start of the pdf.
* **editor:** added option to repeat labels n times when generating the pdf.
* **editor:** added option to include separator only if following field is empty.

### Bug fix
* **core:** remove empty page between pages  

<a name="3.2.4"></a>
# 3.2.4 (2019-12-20)

### Bug fix
* **core:** fix the issue where page margins where making the content smaller

<a name="3.2.3"></a>
# 3.2.3 (2019-12-05)

### Bug fix
* **core:** fix the issue where firefox would not include QRCode in the print

<a name="3.2.2"></a>
# 3.2.2 (2019-12-04)

### Features
* **core:** use canvas instead of svg for faster page rendering

<a name="3.2.1"></a>
# 3.2.1 (2019-11-25)

### Bug fixes

* **editor:** fix adding fields dropdown not showing all the available fields.

<a name="3.2.0"></a>
# 3.2.0 (2019-10-25)

### Features
* **editor:** added column mapping when user is importing a file.
* **editor:** added more options to line spacing.
* **editor:** Moved add to backside select in label field higher.
* **editor:** improved border printing on the pdf.
* **editor:** improved loading pdf indicator.

### Bug fixes
* **editor:** fix an issue with two sided printing where the text lines where not rendered correctly

<a name="3.1.8"></a>
# 3.1.8 (2019-10-18)

### Features
* **core:** added default font to presets.
* **editor:** keep label value when using text type field.

### Bug fixes
* **editor:** fixed some of the fonts not being rendered correctly on the pdf
* **tools:** schema service now recognises lists with enum
* **tools:** fix schema service only picking first object from an array of objects

<a name="3.1.7"></a>
# 3.1.7 (2019-10-09)

* **tools:** fix schema service only picking first object from an array of objects

<a name="3.1.6"></a>
# 3.1.6 (2019-10-08)

### Features
* **editor:** when opening a setup will now try to update the label to match current language.

### Bug fixes
* **editor:** when loading setup merge the defaultAvailableFields mappings to the loaded data 
* **editor:** fixed few typos 

<a name="3.1.5"></a>
# 3.1.5 (2019-09-05)

### Features
* **doc:** added link to demo to README.nd

<a name="3.1.4"></a>
# 3.1.4 (2019-09-05)

### Features
* **editor:** added menu item to clear data only on the editor
* **generator:** pre-fill free text fields with the field value

<a name="3.1.3"></a>
# 3.1.3 (2019-09-03)

### Features
* **core:** added method to convert data according to schema to match available fields.
* **core:** new interface to better describe what kind of data can be used as data for the labels.
* **core:** base parameter in schemaToAvailableFields is now optional.

<a name="3.1.1"></a>
# 3.1.1 (2019-08-30)

### Features

* **core:** release instructions pages on [github.io](https://luomus.github.io/label-designer/)
* **core:** update documentation

<a name="3.1.0"></a>
# 3.1.0 (2019-08-28)

### Features

* **editor:** Added better documentation to the components
* **generator:** warn user if range contains non numeric characters

<a name="3.0.0"></a>
# 3.0.0 (2019-08-28)

### BREAKING CHANGES

* **core:** Renamed FormService to SchemaService
* **editor:** Renamed LabelMakerComponent to LabelDesignerComponent
* **editor:** html event from the editor will now return desired filename and html instead of just html  

### Features

* **editor:** Show file/template name on the top right of the edit window
* **editor:** warning when you try to move from one file to another and have unsaved changes 
* **editor:** ask for file name when making label pdf
* **generator:** generating data to text fields will now empty the text field value if there is no value in the generator dialog
* **editor:** added text transform option with capitalize, uppercase and lowercase values.
