(function () {
  var body = document.body;
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('.site-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      body.classList.remove('nav-open');
    });
  });

  var hero = document.getElementById('heroSlider');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        resetTimer();
      });
    });

    hero.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    hero.addEventListener('mouseleave', function () {
      resetTimer();
    });

    showSlide(0);
    startTimer();
  }

  var input = document.getElementById('movieSearchInput');
  var category = document.getElementById('movieCategoryFilter');
  var year = document.getElementById('movieYearFilter');
  var list = document.getElementById('searchableMovieList');
  var empty = document.getElementById('emptyState');

  if (input && category && year && list) {
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var categoryValue = category.value;
      var yearValue = year.value;
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchedCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matched = matchedKeyword && matchedCategory && matchedYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', applyFilter);
    category.addEventListener('change', applyFilter);
    year.addEventListener('change', applyFilter);
    applyFilter();
  }
})();

function initMoviePlayer(mediaUrl) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.querySelector('.play-overlay');
  if (!video || !mediaUrl) {
    return;
  }

  var loaded = false;
  var hls = null;

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function playVideo() {
    hideOverlay();
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {});
    }
  }

  function loadVideo() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = mediaUrl;
      video.addEventListener('loadedmetadata', playVideo, { once: true });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(mediaUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
      return;
    }

    video.src = mediaUrl;
    video.addEventListener('loadedmetadata', playVideo, { once: true });
  }

  function start() {
    loadVideo();
    playVideo();
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', hideOverlay);

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
