# Desktop QR Reader

![Electron Build](https://github.com/jdlubrano/desktop-qr-reader/workflows/Electron%20Build/badge.svg)

## Development Setup

```
yarn install
yarn start
```

## Build Process

This Electron app was created with [electron-forge](https://www.electronforge.io/)
and is bundled with [Webpack](https://www.electronforge.io/templates/webpack-template).

```
yarn make
```

## Release Process

```
yarn version --new-version x.x.x
git push
git push --tags
# CI will push binaries for Linux and Windows
```
