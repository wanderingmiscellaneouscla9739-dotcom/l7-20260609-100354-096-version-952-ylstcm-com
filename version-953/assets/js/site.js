(function () {
  const body = document.body;
  const mobileToggle = document.querySelector("[data-mobile-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function () {
      const open = mobilePanel.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
      body.classList.toggle("is-locked", open);
    });
  }

  const hero = document.querySelector("[data-hero-slider]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let index = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const q = params.get("q") || "";
  const searchInputs = Array.from(document.querySelectorAll("[data-filter-input]"));
  const yearSelects = Array.from(document.querySelectorAll("[data-year-filter]"));
  const categorySelects = Array.from(document.querySelectorAll("[data-category-filter]"));
  const lists = Array.from(document.querySelectorAll("[data-search-list]"));

  searchInputs.forEach(function (input) {
    if (q && !input.value) {
      input.value = q;
    }
  });

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters() {
    const keyword = normalize(searchInputs[0] ? searchInputs[0].value : q);
    const year = yearSelects[0] ? yearSelects[0].value : "";
    const category = categorySelects[0] ? categorySelects[0].value : "";

    lists.forEach(function (list) {
      const cards = Array.from(list.querySelectorAll("[data-movie-card]"));
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-category")
        ].join(" "));
        const yearOk = !year || card.getAttribute("data-year") === year;
        const categoryOk = !category || card.getAttribute("data-category") === category;
        const keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        const match = yearOk && categoryOk && keywordOk;

        card.style.display = match ? "" : "none";

        if (match) {
          visible += 1;
        }
      });

      const empty = list.parentElement.querySelector("[data-empty-state]");

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyFilters);
  });

  yearSelects.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });

  categorySelects.forEach(function (select) {
    select.addEventListener("change", applyFilters);
  });

  if (lists.length) {
    applyFilters();
  }

  const backTop = document.querySelector("[data-back-top]");

  if (backTop) {
    window.addEventListener("scroll", function () {
      backTop.classList.toggle("is-visible", window.scrollY > 500);
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }
})();
