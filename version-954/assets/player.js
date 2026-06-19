(function () {
  function startPlayer(shell) {
    if (!shell || shell.dataset.ready === '1') {
      var videoReady = shell && shell.querySelector('video');
      if (videoReady) {
        videoReady.play().catch(function () {});
      }
      return;
    }

    var video = shell.querySelector('video');
    var src = shell.getAttribute('data-src');

    if (!video || !src) {
      return;
    }

    shell.dataset.ready = '1';
    shell.classList.add('is-playing');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        autoStartLoad: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = src;
    video.play().catch(function () {});
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var button = shell.querySelector('.play-mask');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        startPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        startPlayer(shell);
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    }
  });
})();
