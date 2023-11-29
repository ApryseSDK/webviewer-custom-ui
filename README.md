# WebViewer - Custom UI

[WebViewer](https://www.pdftron.com/documentation/web/) is a powerful JavaScript-based PDF Library that's part of the [PDFTron PDF SDK](https://www.pdftron.com).
This repo is specifically designed for any users interested in making their [own UI](https://www.pdftron.com/documentation/web/guides/core/).

![](docs/screenshots/webviewer-custom-ui-01.png)

This sample codebase demonstrates

- How to leverage PDFTron's document renderer without an `<iFrame>`
- How to define custom `<button>` elements and implement functionality from the PDFTron SDK such as
  - Zoom In/Out
  - Drawing Rectangles
  - Select Tool
  - Creating and Applying Redactions
- How to implement searching using [DocViewer Search APIs](https://www.pdftron.com/documentation/web/guides/advance-text-search/)

## Initial setup

Before you begin, make sure your development environment includes [Node.js](https://nodejs.org/en/).

## Install

```
git clone https://github.com/PDFTron/webviewer-custom-ui.git
cd webviewer-custom-ui
npm install
```

## Run

```
npm start
```

## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `build/` directory. See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

To test the build directory locally you can use [serve](https://www.npmjs.com/package/serve) or [http-server](https://www.npmjs.com/package/http-server). In case of serve, by default it strips the .html extension stripped from paths. We added serve.json configuration to disable cleanUrls option.

## WebViewer APIs

See [API documentation](https://www.pdftron.com/documentation/web/guides/ui/apis).

## Contributing

See [contributing](./CONTRIBUTING.md).

## License

See [license](./LICENSE).
![](https://onepixel.pdftron.com/webviewer-react-sample)
