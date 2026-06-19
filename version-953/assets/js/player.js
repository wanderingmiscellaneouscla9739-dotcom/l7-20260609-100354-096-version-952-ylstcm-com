(function () {
  function initializeMoviePlayer(rootId, url) {
    const root = document.getElementById(rootId);

    if (!root) {
      return;
    }

    const video = root.querySelector("video");
    const cover = root.querySelector(".play-cover");
    const button = root.querySelector(".play-button");
    let loaded = false;
    let hls = null;

    function attach() {
      if (loaded || !video || !url) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }

      video.src = url;
    }

    function begin(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      attach();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      if (video) {
        video.controls = true;
        const playResult = video.play();

        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }

    if (cover) {
      cover.addEventListener("click", begin);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          begin();
        }
      });

      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  window.initializeMoviePlayer = initializeMoviePlayer;
})();
