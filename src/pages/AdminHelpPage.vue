<!-- eslint-disable -->
<template>
  <q-page padding>
    <h4>Getting started?</h4>
    <p>You made it here, so congrats: You got the app work on your computer 🎉. How to continue?</p>
    <ul>
      <li>
        Maybe you want to setup the camera?
        <a href="https://photobooth-app.org/setup/camera_setup/">Move on to camera setup documentation</a>
      </li>
      <li>
        Need some extras? Watch out for WLED integration, sync files and more
        <a href="https://photobooth-app.org/extras/">extras</a>.
      </li>
      <li>
        Got in trouble? Find help in the
        <a href="https://photobooth-app.org/support/troubleshooting/">troubleshooting guide</a>.
      </li>
      <li>
        Still problems?
        <a href="https://github.com/photobooth-app/photobooth-app/discussions">Reach out in a discussion</a>.
      </li>
    </ul>

    <h4>Links to landingpages, standalone gallery, ...</h4>
    <ul>
      <li><a href="#/standalone/gallery" target="_blank">Standalone Gallery</a></li>
      <li><a href="#/standalone/slideshow" target="_blank">Standalone Slideshow Random</a></li>
      <li><a href="#/slideshow/random" target="_blank">Slideshow Random (opens after timeout automatically)</a></li>
    </ul>
    <h4>Photobooth REST-API</h4>
    <p>
      The photobooth apps frontend is using the backends rest api. It's well documented and can be used to integrate further with your systems. Check
      the openapi documentation here.
    </p>
    <a href="/api/doc" target="_blank">API Schema</a>
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
};
</script>
