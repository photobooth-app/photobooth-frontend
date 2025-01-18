<h1 align="center"><img src="https://raw.githubusercontent.com/photobooth-app/photobooth-frontend/refs/heads/main/public/icons/logo-text-blue-transparent.png" alt="photobooth app logo" /></h1>
<h2 align="center">Frontend</h2>

This repository is the Vue3 frontend for the [photobooth-app](https://github.com/photobooth-app/photobooth-app). The repo is used for development only. The SPA build is [written directly to the photobooth-app](https://github.com/photobooth-app/photobooth-app/tree/main/photobooth/web_spa) manually for every release if updates to the frontend are needed.

If you just want to use the photobooth app, you don't need this repository. Go over to the documentation and follow the [installation](https://photobooth-app.org/setup/installation/).

## Setup the frontend repo for development

Following guide is just very basic instructions. If you run into issues, please post in the [github discussions](https://github.com/photobooth-app/photobooth-app/discussions). Also the [framework's website Quasar](https://quasar.dev/start/quick-start) is helpful.

## Prerequisites

- VS Code
- Node 20 incl. npm
- photobooth-app installed and started

## Setup the repo

```sh
git clone https://github.com/photobooth-app/photobooth-frontend.git
cd photobooth-frontend

npm install
```

### Start the frontend in development mode

In development mode hot-code reloading, error reporting, etc. is enabled. Also the Vue3 development tool in the browser console is usable to explore the storage state.

```sh
quasar dev
```

After starting `quasar dev`, it starts a proxy server on port 9000. So browse to http://localhost:9000 and it will open the development version of the frontend.
Requests to the backend are transparently forwarded by the proxy to the photobooth-app listening to port 8000 usually.
So to develop the frontend you also need the photobooth-app installed and started in the background. The app has a virtual camera that is used by default so there is no hardware required to develop the frontend.

### Build the frontend

Once coding is finished, the frontend can be build so the photobooth-app serves the updated frontend without the need of the dev proxy server:

```sh
quasar build
```

The build is written to `../photobooth-app/photobooth/web_spa/`.
