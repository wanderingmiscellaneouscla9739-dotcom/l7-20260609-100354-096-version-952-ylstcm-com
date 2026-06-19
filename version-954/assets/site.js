(function () {
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var searchInput = document.querySelector('[data-page-search]');
  var sortSelect = document.querySelector('[data-sort]');
  var list = document.querySelector('.searchable-list');
  var emptyState = document.querySelector('[data-empty-state]');

  if (searchInput && searchInput.hasAttribute('data-url-query')) {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q');
    if (keyword) {
      searchInput.value = keyword;
    }
  }

  function getItems() {
    if (!list) {
      return [];
    }
    return Array.prototype.slice.call(list.children).filter(function (item) {
      return item.nodeType === 1;
    });
  }

  function applyFilter() {
    if (!list || !searchInput) {
      return;
    }

    var keyword = searchInput.value.trim().toLowerCase();
    var visible = 0;

    getItems().forEach(function (item) {
      var text = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
      var matched = !keyword || text.indexOf(keyword) !== -1;
      item.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  function applySort() {
    if (!list || !sortSelect) {
      return;
    }

    var value = sortSelect.value;
    var items = getItems();

    items.sort(function (a, b) {
      if (value === 'title') {
        return (a.getAttribute('data-title') || a.textContent).localeCompare(b.getAttribute('data-title') || b.textContent, 'zh-Hans-CN');
      }
      if (value === 'hot') {
        return Number(b.getAttribute('data-heat') || 0) - Number(a.getAttribute('data-heat') || 0);
      }
      return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
    });

    items.forEach(function (item) {
      list.appendChild(item);
    });

    applyFilter();
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', applySort);
    applySort();
  }
})();
