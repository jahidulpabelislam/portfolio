;new (function() {
    "use strict";

    this.transitionSpeedSecs = 700;
    this.cookieKey = "cookie-modal-closed";
    this.cookieClickedValue = "true";
    this.cookieExpirationDays = 30;

    this.hasClosedBefore = function() {
        return JPI.checkCookieValue(this.cookieKey, this.cookieClickedValue);
    };

    this.setCookie = function() {
        JPI.setCookie(this.cookieKey, this.cookieClickedValue, this.cookieExpirationDays);
    };

    this.close = function() {
        this.$element.fadeOut(
            this.transitionSpeedSecs,
            function() {
                this.$element.remove();
            }.bind(this)
        );
        this.setCookie();
    };

    this.initDisplay = function() {
        if (this.hasClosedBefore()) {
            this.setCookie();
            this.$element.remove();
        }
        else {
            this.modal = new JPI.modal(this.$element);
            this.modal.open();
        }
    };

    this.init = function() {
        this.$element = jQuery(".cookie-modal");

        jQuery(".cookie-modal__close").on("click", this.close.bind(this));

        this.initDisplay();
    };

    jQuery(window).on("jpi-css-loaded", this.init.bind(this));
})();
