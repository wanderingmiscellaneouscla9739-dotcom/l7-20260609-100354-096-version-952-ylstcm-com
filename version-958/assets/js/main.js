(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function searchableText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-category'),
            card.textContent
        ].join(' ').toLowerCase();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));
    var clearButtons = Array.prototype.slice.call(document.querySelectorAll('[data-clear-search]'));
    var filterRows = Array.prototype.slice.call(document.querySelectorAll('[data-filter-row]'));
    var activeFilter = '';

    function applySearch(value) {
        var keyword = normalize(value);
        var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
        cards.forEach(function (card) {
            var text = searchableText(card);
            var passKeyword = !keyword || text.indexOf(keyword) !== -1;
            var passFilter = !activeFilter || text.indexOf(activeFilter) !== -1;
            card.classList.toggle('is-hidden', !(passKeyword && passFilter));
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            applySearch(input.value);
        });
    });

    clearButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            searchInputs.forEach(function (input) {
                input.value = '';
            });
            activeFilter = '';
            document.querySelectorAll('[data-filter-value]').forEach(function (filterButton) {
                filterButton.classList.remove('is-active');
            });
            var firstFilter = document.querySelector('[data-filter-value=""]');
            if (firstFilter) {
                firstFilter.classList.add('is-active');
            }
            applySearch('');
        });
    });

    filterRows.forEach(function (row) {
        var buttons = Array.prototype.slice.call(row.querySelectorAll('[data-filter-value]'));
        if (buttons[0]) {
            buttons[0].classList.add('is-active');
        }
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                activeFilter = normalize(button.getAttribute('data-filter-value'));
                var input = searchInputs[0];
                applySearch(input ? input.value : '');
            });
        });
    });

    document.querySelectorAll('[data-player]').forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.play-overlay');
        var stream = box.getAttribute('data-stream');
        var ready = false;
        var hls = null;

        function bind() {
            if (ready || !video || !stream) {
                return;
            }
            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
                return;
            }

            video.src = stream;
        }

        function play() {
            bind();
            box.classList.add('player-active');
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                box.classList.add('player-active');
            });
            video.addEventListener('ended', function () {
                box.classList.remove('player-active');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
})();
