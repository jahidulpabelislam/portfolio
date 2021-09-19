var JPI = JPI || {};

//=include ./third-party/jquery.min.js
//=include ./jpi/helpers.js
//=include ./jpi/components/nav.js
//=include ./jpi/components/cookie-banner.js

;(function() {

    "use strict";

    var global = {
        body: null,
        nav: null,
        mainContentElem: null,
    };

    var fn = {

        scrollToContent: function() {
            global.body.animate({
                scrollTop: global.mainContentElem.offset().top - global.nav.height(),
            }, 1000);
        },

        initListeners: function() {
            jQuery(".js-scroll-to-content").on("click", fn.scrollToContent);
        },

        init: function() {
            global.body = jQuery("html, body");
            global.nav = jQuery(".nav");
            global.mainContentElem = jQuery(".main-content");

            fn.initListeners();
        },
    };

    jQuery(fn.init);

})();