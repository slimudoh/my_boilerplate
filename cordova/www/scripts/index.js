(function() {
  "use strict";
  var timers;

  document.addEventListener("deviceready", onDeviceReady.bind(this), false);

  function onDeviceReady() {
    document.addEventListener("pause", onPause.bind(this), false);
    document.addEventListener("resume", onResume.bind(this), false);
    document.addEventListener("offline", onOffline.bind(this), false);
    init();
  }

  function onPause() {
    timers = setTimeout(function() {
      navigator.app.exitApp();
    }, 60000);
  }

  function onResume() {
    if (timers) {
      clearTimeout(timers);
    }
  }

  function onOffline() {
    navigator.notification.alert(
      " It seems there is a problem with the network",
      null,
      "Alert",
      "Ok"
    );
    navigator.notification.beep(1);
  }

  function checkConnection() {
    var networkState = navigator.connection.type;
    var states = {};

    states[Connection.UNKNOWN] = "Unknown connection";
    states[Connection.ETHERNET] = "Ethernet connection";
    states[Connection.WIFI] = "WiFi connection";
    states[Connection.CELL_2G] = "Cell 2G connection";
    states[Connection.CELL_3G] = "Cell 3G connection";
    states[Connection.CELL_4G] = "Cell 4G connection";
    states[Connection.CELL] = "Cell generic connection";
    states[Connection.NONE] = "No network connection";

    return states[networkState];
  }

  function init() {
    var loader = document.querySelector("#loader");
    var login = document.querySelector("#login");
    var offline = document.querySelector("#offline");
    var networkConnect = checkConnection();

    setTimeout(function() {
      if (networkConnect === "No network connection") {
        loader.style.display = "none";
        offline.style.display = "block";
        return;
      }

      loader.style.display = "none";
      login.style.display = "block";
    }, 5000);

    if ("addEventListener" in document) {
      document.addEventListener(
        "DOMContentLoaded",
        function() {
          FastClick.attach(document.body);
        },
        false
      );
    }
  }

  document
    .querySelector(".offline__retry")
    .addEventListener("click", function() {
      var loader = document.querySelector("#loader");
      loader.style.display = "block";
      init();
    });
})();
