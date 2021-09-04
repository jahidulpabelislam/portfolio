;(function() {

    "use strict";

    var global = {
        window: jQuery(window),
        nav: null,
        header: null,
        menuButton: null,
        linksContainers: null,
    };

    var fn = {

        toggleMobileMenu: function() {
            global.nav.toggleClass("nav--open");
            global.linksContainers.slideToggle();
        },

        reset: function() {
            if (window.innerWidth >= JPI.getInt(JPI.breakpoints.tablet)) {
                global.linksContainers.css("display", "");
            }

            // Set the correct class on nav depending on current scroll position
            var navHeight = global.nav.height();
            var scrollPos = global.window.scrollTop() + navHeight;
            var headerHeight = global.header.height();

            if (!headerHeight || scrollPos >= headerHeight) {
                global.nav.addClass("nav--scrolled");
            }
            else {
                global.nav.removeClass("nav--scrolled");
            }
        },

        // Code to collapse mobile menu when user clicks anywhere off it.
        onNavClick: function(e) {
            if (
                global.nav.hasClass("nav--open") &&
                !jQuery(e.target).closest(".nav").length &&
                global.menuButton.css("display") !== "none"
            ) {
                global.menuButton.click();
            }
        },

        initListeners: function() {
            jQuery(window).on("click", fn.onNavClick);
            global.window.on("scroll orientationchange resize", JPI.debounce(fn.reset, 150));
            global.menuButton.on("click", fn.toggleMobileMenu);
        },

        init: function() {
            global.nav = jQuery(".nav");
            global.menuButton = jQuery(".nav__mobile-toggle");
            global.linksContainers = jQuery(".nav__links-container");
            global.header = jQuery(".header");

            fn.initListeners();
            fn.reset();
        },
    };

    global.window.on("jpi-css-loaded", fn.init);

})();
