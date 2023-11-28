;new (function() {
    "use strict";

    var $window = jQuery(window);

    this.$element = jQuery(".nav");

    var $header = jQuery(".header");

    this.reset = function() {
        // Set the correct class on nav depending on current scroll position
        var navHeight = this.$element.height();
        var scrollPos = $window.scrollTop() + navHeight;
        var headerHeight = $header.height();

        if (!headerHeight || scrollPos >= headerHeight) {
            this.$element.addClass("nav--scrolled");
        }
        else {
            this.$element.removeClass("nav--scrolled");
        }
    };

    this.init = function() {
        this.reset();

        $window.on("scroll orientationchange resize", JPI.debounce(this.reset.bind(this), 150));
    };

    $window.on("jpi-css-loaded", this.init.bind(this));
})();
