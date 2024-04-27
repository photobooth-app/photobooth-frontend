<!-- eslint-disable -->
<template>
  <q-page id="admin-1ststart-page" padding>
    <h3>1st Start</h3>
    <h4>Standalone pages, slideshows</h4>
    <p>
      The standalone page links can be used on another device to show the gallery and let users browse their photos, print it without blocking the
      photobooth.
    </p>
    <ul>
      <li><a href="#/standalone/gallery" target="_blank">Standalone Gallery</a></li>
      <li><a href="#/standalone/slideshow" target="_blank">Standalone Slideshow Random</a></li>
      <li><a href="#/slideshow/random" target="_blank">Slideshow Random (opens after timeout automatically)</a></li>
    </ul>
    <h4>REST-API</h4>
    <p>
      The photobooth comes with a REST-API. The frontend part of the app uses the same API. It's well documented and used to integrate further with
      your own systems. Check the openapi documentation, it's interactive so easy to test.
    </p>
    Open the <a href="/api/doc" target="_blank">API documentation of the photobooth-app</a>.
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
};
</script>
