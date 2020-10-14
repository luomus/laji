#!/usr/bin/env bash

# This script needs to be run at the root of laji.fi project and on Mac

rm -rf release-builds
npm run build:label-designer-electron
npm run package:label-designer-linux
npm run package:label-designer-mac
npm run package:label-designer-win

mv release-builds/Label\ Designer-win32-ia32/LabelDesigner.exe release-builds/Label\ Designer-win32-ia32/label-designer.exe

# cp $HOME/.wine/drive_c/Program\ Files/7-Zip/7z.exe /usr/local/lib/node_modules/electron-installer-windows/vendor/squirrel/
# cp $HOME/.wine/drive_c/Program\ Files/7-Zip/7z.dll /usr/local/lib/node_modules/electron-installer-windows/vendor/squirrel/

electron-installer-windows --src release-builds/Label\ Designer-win32-ia32 --config ./projects/label-designer-electron/electron-installer-windows-config.json --dest ./release-builds/label-designer/

cd release-builds

# Linux
tar -czvf label-designer-linux-x64.tar.gz Label\ Designer-linux-x64

# mac
zip -9 -r label-designer-darwin-x64.zip Label\ Designer-darwin-x64

# win
zip -9 -r label-designer-windows.zip label-designer

