;new (function() {
    "use strict";

    this.$items = jQuery(".timeline__item");

    this.setItemHeights = function() {
        this.$items.css("height", ""); // reset

        var maxHeight = 0;
        this.$items.each(function(i, elem) {
            var height = jQuery(elem).outerHeight(true);
            if (height > maxHeight) {
                maxHeight = height;
            }
        });

        this.$items.css("height", maxHeight * 2);
    };

    this.init = function() {
        this.setItemHeights();

        var slideShow = new JPI.SlideShow({
            selector: ".timeline",
            viewportSelector: ".timeline__viewport",
            slidesContainerSelector: ".timeline__items",
            slideSelector: ".timeline__item",
            bulletsSelector: false,
            bulletSelector: false,
            navSelector: ".timeline__nav",
            slidesPerView: 2,
            autoplay: false,
            loop: false,
            breakpoints: {
                desktop: {
                    slidesPerView: 3,
                },
            },
        });

        slideShow.start();
    };

    jQuery(window).on("resize", this.setItemHeights.bind(this));

    jQuery(window).on("load", this.init.bind(this));
})();
