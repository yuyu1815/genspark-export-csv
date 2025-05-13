# HTML to Figma Plugin

This Figma plugin allows you to convert HTML code to Figma designs. It uses the [@builder.io/html-to-figma](https://github.com/BuilderIO/html-to-figma) library to convert HTML and CSS to Figma nodes.

## Features

- Convert HTML code to Figma designs
- Simple and intuitive user interface
- Creates a new page with the converted design
- Supports basic HTML and CSS properties

## Installation

### Development Installation

1. Clone this repository
2. Navigate to the `figma` directory
3. Run the build script:
   ```
   build.bat
   ```
   This will install dependencies and build the plugin.
4. Open Figma
5. Go to Plugins > Development > Import plugin from manifest...
6. Select the `manifest.json` file in the `figma` directory

### Manual Installation

1. Clone this repository
2. Navigate to the `figma` directory
3. Install dependencies:
   ```
   npm install
   ```
4. Build the plugin:
   ```
   npm run build
   ```
5. Open Figma
6. Go to Plugins > Development > Import plugin from manifest...
7. Select the `manifest.json` file in the `figma` directory

## Usage

1. Open Figma
2. Open a design file
3. Go to Plugins > HTML to Figma > Convert HTML to Figma
4. Paste your HTML code in the text area
5. Click "Convert to Figma"
6. The plugin will create a new page with the converted design

## Limitations

- Complex layouts may not convert perfectly
- Some CSS properties are not supported
- External resources like images may not load correctly
- JavaScript functionality is not preserved

## Development

### Project Structure

- `src/`: Source code
  - `code.ts`: Main plugin code
  - `ui.tsx`: UI code
  - `ui.html`: UI HTML template
- `manifest.json`: Plugin manifest
- `webpack.config.js`: Webpack configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: npm package configuration
- `build.bat`: Build script

### Building

To build the plugin, run:

```
npm run build
```

This will create a `dist` directory with the built plugin files.

## License

MIT