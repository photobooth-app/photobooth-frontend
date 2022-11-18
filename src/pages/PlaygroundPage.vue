<template>
  <q-page padding>
    <button onclick="contactServer">Click Here</button>
    <q-btn label="websocket contact" @click="contactServer()" />
    autofocus timer:
    <q-btn label="on" @click="loadData('/cmd/autofocus/on')" />
    <q-btn label="off" @click="loadData('/cmd/autofocus/off')" />
    <br /><br />
    debug:
    <q-btn label="on" @click="loadData('/cmd/debug/on')" />
    <q-btn label="off" @click="loadData('/cmd/debug/off')" />
    <br /><br />

    debug overlay:
    <q-btn label="on" @click="loadData('/cmd/debugoverlay/on')" />
    <q-btn label="off" @click="loadData('/cmd/debugoverlay/off')" />
    <br /><br />

    exposure_mode:
    <q-btn label="normal" @click="loadData('/cmd/exposuremode/normal')" />
    <q-btn label="short" @click="loadData('/cmd/exposuremode/short')" />
    <q-btn label="long" disable @click="loadData('/cmd/exposuremode/long')" />
    <q-btn
      label="custom"
      disable
      @click="loadData('/cmd/exposuremode/custom')"
    />
    <br /><br />

    config:
    <q-btn label="load" @click="loadData('/cmd/config/load')" />
    <q-btn label="save" @click="loadData('/cmd/config/save')" />
    <q-btn label="reset" @click="loadData('/cmd/config/reset')" />
    <br /><br />

    capture:
    <a id="countdown" href="javascript:cmdGet('/cmd/infoled/countdown')"
      >countdown</a
    ><br />

    <div>
      Latest LocationService results: <span id="locationservice"></span>
      <a target="_new" id="mapslink" href="#">open in maps</a>
    </div>
    <form target="_blank" method="post" action="/cmd/capture">
      <input type="text" name="filename" value="test.jpeg" /><input
        type="submit"
        value="take hq pic"
      />
    </form>

    Last Focuser Run results
    <LineChart :chart-data="datasetsfull" />
    <div style="width: 500px">
      <canvas id="myChart"></canvas>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

const socket = new WebSocket("ws://photobooth:8001");
socket.addEventListener("open", function (event) {
  socket.send("Connection Established");
});

socket.addEventListener("message", function (event) {
  console.log(event.data);
});

export default {
  // name: 'PageName',
  setup() {
    const $q = useQuasar();
    const data = ref(null);

    function contactServer() {
      socket.send("Initialize");
    }

    function loadData(url) {
      api
        .get(url)
        .then((response) => {
          data.value = response.data;
          console.log(response);
        })
        .catch(() => {
          console.log("error");
        });
    }

    return { data, loadData, contactServer };
  },
};
</script>
