(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('img').forEach(function (img) {
        img.addEventListener('error', function () {
            img.remove();
        }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('is-active', itemIndex === currentSlide);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('is-active', itemIndex === currentSlide);
            dot.setAttribute('aria-current', itemIndex === currentSlide ? 'true' : 'false');
        });
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 6200);
    }

    if (slides.length) {
        showSlide(0);
        startHero();
        var prev = document.querySelector('.hero-prev');
        var next = document.querySelector('.hero-next');
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(currentSlide - 1);
                startHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(currentSlide + 1);
                startHero();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });
    }

    var filterInput = document.querySelector('.filter-input');
    var filterChips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('.empty-state');
    var activeFilter = 'all';

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var term = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var type = (card.getAttribute('data-type') || '').toLowerCase();
            var matchText = !term || text.indexOf(term) !== -1;
            var matchType = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1 || type.indexOf(activeFilter.toLowerCase()) !== -1;
            var show = matchText && matchType;
            card.style.display = show ? '' : 'none';
            if (show) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilter);
    }

    filterChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            filterChips.forEach(function (item) {
                item.classList.remove('is-active');
            });
            chip.classList.add('is-active');
            activeFilter = chip.getAttribute('data-filter') || 'all';
            applyFilter();
        });
    });

    document.querySelectorAll('.player-box').forEach(function (box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('.player-overlay');
        if (!video || !overlay) {
            return;
        }
        var url = video.getAttribute('data-play');
        var loaded = false;
        var hlsInstance = null;

        function attach() {
            if (!url || loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
            loaded = true;
        }

        function play() {
            attach();
            overlay.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!loaded) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
