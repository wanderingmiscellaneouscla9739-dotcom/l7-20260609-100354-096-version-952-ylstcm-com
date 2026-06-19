(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var panels = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-panel]"));
        var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
        var backgrounds = Array.prototype.slice.call(hero.querySelectorAll(".hero-bg"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + panels.length) % panels.length;
            panels.forEach(function (panel, panelIndex) {
                panel.classList.toggle("active", panelIndex === index);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle("active", thumbIndex === index);
            });
            backgrounds.forEach(function (background, backgroundIndex) {
                background.classList.toggle("active", backgroundIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        thumbs.forEach(function (thumb, thumbIndex) {
            thumb.addEventListener("mouseenter", function () {
                show(thumbIndex);
                stop();
            });
            thumb.addEventListener("focus", function () {
                show(thumbIndex);
                stop();
            });
            thumb.addEventListener("mouseleave", start);
            thumb.addEventListener("blur", start);
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        if (panels.length > 1) {
            start();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initFilters() {
        var input = document.querySelector("[data-search]");
        var year = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!cards.length || (!input && !year)) {
            return;
        }
        if (input) {
            var params = new URLSearchParams(window.location.search);
            var keyword = params.get("q");
            if (keyword && !input.value) {
                input.value = keyword;
            }
        }
        function apply() {
            var query = normalize(input ? input.value : "");
            var selectedYear = normalize(year ? year.value : "");
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !selectedYear || cardYear === selectedYear;
                card.hidden = !(matchQuery && matchYear);
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        apply();
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var playButton = player.querySelector("[data-play]");
        var url = player.getAttribute("data-video-url");
        var hlsInstance = null;
        if (!video || !playButton || !url) {
            return;
        }

        function startPlayback() {
            playButton.hidden = true;
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                if (video.src !== url) {
                    video.src = url;
                    video.load();
                }
                video.play().catch(function () {
                    playButton.hidden = false;
                });
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                if (!hlsInstance) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {
                            playButton.hidden = false;
                        });
                    });
                } else {
                    video.play().catch(function () {
                        playButton.hidden = false;
                    });
                }
                return;
            }
            if (video.src !== url) {
                video.src = url;
                video.load();
            }
            video.play().catch(function () {
                playButton.hidden = false;
            });
        }

        playButton.addEventListener("click", startPlayback);
        player.addEventListener("click", function (event) {
            if (event.target === player && video.paused) {
                startPlayback();
            }
        });
        video.addEventListener("play", function () {
            playButton.hidden = true;
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
