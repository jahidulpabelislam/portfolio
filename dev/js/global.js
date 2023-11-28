var JPI = JPI || {};

//=include ./third-party/jquery.min.js
//=include ./jpi/helpers.js
//=include ./jpi/plugins/modal.js
//=include ./jpi/components/nav.js
//=include ./jpi/components/cookie-modal.js

;(function() {
    "use strict";

    var $body = jQuery("html, body");
    var $nav = jQuery(".nav");
    var $mainContent = jQuery(".main-content");

    JPI.scrollTo = function($el, offset) {
        offset = offset || 0;
        $body.animate(
            {
                scrollTop: $el.offset().top - $nav.height() - offset,
            },
            1000
        );
    };

    jQuery(".js-scroll-to-content").on("click", function() {
        JPI.scrollTo($mainContent);
    });

    jQuery(".js-scroll-to").on("click", function(e) {
        e.preventDefault();

        var $el = jQuery(this);

        var $target = jQuery($el.attr("href"));
        if ($target.length) {
            JPI.scrollTo($target);
        }
    });
})();
