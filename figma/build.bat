@echo off
echo Building HTML to Figma plugin...

echo Building html-to-figma-lib dependency...
cd ..\html\html-to-figma
npm install
npm run build:package
cd ..\..\figma

echo Installing dependencies...
npm install

echo Building plugin...
npm run build

echo Done!
echo Plugin files are in the dist directory.
echo To use the plugin in Figma:
echo 1. Open Figma
echo 2. Go to Plugins > Development > Import plugin from manifest...
echo 3. Select the manifest.json file in this directory
