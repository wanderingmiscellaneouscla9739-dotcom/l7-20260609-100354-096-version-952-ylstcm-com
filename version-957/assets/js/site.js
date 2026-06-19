(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = qs('[data-mobile-toggle]');
    var nav = qs('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var panels = qsa('[data-hero-panel]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function render(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      panels.forEach(function (panel, panelIndex) {
        panel.classList.toggle('is-active', panelIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        render(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        render(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        render(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        render(index);
        restart();
      });
    });

    render(0);
    restart();
  }

  function initFilters() {
    var panels = qsa('[data-filter-panel]');

    panels.forEach(function (panel) {
      var input = qs('[data-filter-input]', panel);
      var typeSelect = qs('[data-filter-type]', panel);
      var yearSelect = qs('[data-filter-year]', panel);
      var count = qs('[data-filter-count]', panel);
      var list = panel.parentElement ? qs('[data-filter-list]', panel.parentElement) : null;
      var cards = list ? qsa('[data-title]', list) : [];

      function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var type = typeSelect ? typeSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matched = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          card.classList.toggle('is-filtered-out', !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '显示 ' + visible + ' 部';
        }
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilters);
          control.addEventListener('change', applyFilters);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && input) {
        input.value = query;
      }

      applyFilters();
    });
  }

  var hlsLoader = null;

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function playWithSource(video, sourceUrl) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      return video.play();
    }

    return loadHlsScript().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);

        return new Promise(function (resolve) {
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            resolve(video.play());
          });
        });
      }

      video.src = sourceUrl;
      return video.play();
    });
  }

  function initPlayers() {
    var players = qsa('[data-player]');

    players.forEach(function (box) {
      var button = qs('[data-play-button]', box);
      var video = qs('video', box);
      var status = qs('[data-player-status]', box);
      var sourceUrl = box.getAttribute('data-video-url');

      if (!button || !video || !sourceUrl) {
        return;
      }

      button.addEventListener('click', function () {
        box.classList.add('is-playing');

        if (status) {
          status.textContent = '正在连接高清播放线路...';
        }

        playWithSource(video, sourceUrl).then(function () {
          if (status) {
            status.textContent = '';
          }
        }).catch(function () {
          if (status) {
            status.textContent = '播放源加载失败，请刷新页面或稍后重试。';
          }

          box.classList.remove('is-playing');
        });
      });
    });
  }

  function initScrollToPlayer() {
    qsa('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var player = qs('[data-player]');

        if (player) {
          player.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayers();
    initScrollToPlayer();
  });
})();
