<template>
  <q-page padding>
    <h4>Getting started?</h4>
    <p>You made it here, so congrats: You got the app work on your computer 🎉. How to continue?</p>
    <ul>
      <li>Maybe you want to setup the camera? <a href="https://mgrl.github.io/photobooth-docs/setup/camera_setup/">Move on
          to camera
          setup documentation</a></li>
      <li>Need some extras? Watch out for WLED integration, sync files and more <a
          href="https://mgrl.github.io/photobooth-docs/extras/">extras</a>.</li>
      <li>Got in trouble? Find help in the <a
          href="https://mgrl.github.io/photobooth-docs/support/troubleshooting/">troubleshooting guide</a>.</li>
      <li>Still problems? <a href="https://github.com/mgrl/photobooth-app/discussions">Reach out in a discussion</a>.</li>
    </ul>

    <h4>Photobooth REST-API</h4>
    <p>The photobooth apps frontend is using the backends rest api.
      It's well documented and can be used to integrate
      further with your systems. Check the openapi documentation here.</p>
    <a href="/api/doc" target="_blank">API Schema</a>

  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
