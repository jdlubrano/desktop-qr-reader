# Desktop QR Reader

[![Build Status](https://travis-ci.com/jdlubrano/desktop-qr-reader.svg?branch=master)](https://travis-ci.com/jdlubrano/desktop-qr-reader)

[![Build status](https://ci.appveyor.com/api/projects/status/436awsjbi63kk7sk/branch/master?svg=true)](https://ci.appveyor.com/project/jdlubrano/desktop-qr-reader/branch/master)

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
