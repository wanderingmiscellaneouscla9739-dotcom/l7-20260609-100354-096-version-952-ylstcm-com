(function () {
  var root = document.body ? document.body.getAttribute('data-root') || './' : './';
  var header = document.querySelector('[data-header]');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 16) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      if (!query) {
        return;
      }
      window.location.href = root + 'library.html?q=' + encodeURIComponent(query);
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        restart();
      });
    }

    restart();
  }

  var filterPanel = document.querySelector('.js-filter-panel');
  if (filterPanel) {
    var input = filterPanel.querySelector('[data-filter-input]');
    var yearSelect = filterPanel.querySelector('[data-filter-year]');
    var typeSelect = filterPanel.querySelector('[data-filter-type]');
    var reset = filterPanel.querySelector('[data-clear-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function yearMatches(cardYear, selected) {
      var year = parseInt(cardYear, 10);
      if (!selected || selected === '全部年份') {
        return true;
      }
      if (selected.indexOf('-') > -1) {
        var parts = selected.split('-');
        var start = parseInt(parts[0], 10);
        var end = parseInt(parts[1], 10);
        return year >= start && year <= end;
      }
      if (selected === '更早') {
        return year < 1990;
      }
      return String(year) === selected;
    }

    function typeMatches(cardType, selected) {
      if (!selected || selected === '全部类型') {
        return true;
      }
      if (selected === '动漫') {
        return cardType.indexOf('动漫') > -1 || cardType.indexOf('动画') > -1;
      }
      return cardType.indexOf(selected) > -1;
    }

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = yearSelect ? yearSelect.value : '';
      var selectedType = typeSelect ? typeSelect.value : '';

      cards.forEach(function (card) {
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var year = card.getAttribute('data-year') || '';
        var region = (card.getAttribute('data-region') || '').toLowerCase();
        var type = card.getAttribute('data-type') || '';
        var genre = (card.getAttribute('data-genre') || '').toLowerCase();
        var text = title + ' ' + region + ' ' + type.toLowerCase() + ' ' + genre;
        var visible = (!query || text.indexOf(query) > -1) && yearMatches(year, selectedYear) && typeMatches(type, selectedType);
        card.classList.toggle('is-hidden-card', !visible);
      });
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '全部年份';
        }
        if (typeSelect) {
          typeSelect.value = '全部类型';
        }
        filterCards();
      });
    }

    filterCards();
  }
})();
