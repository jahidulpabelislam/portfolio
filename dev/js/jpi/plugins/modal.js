;JPI.modal = function($modal) {
    "use strict";

    this.$body = jQuery("body");
    this.$page = jQuery(".page-container");

    this.lastFocused = null;

    this.$focusables = null;
    this.$firstFocusable = null;
    this.$lastFocusable = null;

    this.close = function() {
        if (!$modal.hasClass("is-open")) {
            return;
        }

        this.$body.removeClass("no-scroll");
        this.$page.attr("aria-hidden", "false");

        $modal.removeClass("is-open");
        $modal.attr({
            "tabindex": -1,
            "aria-hidden": true,
            "hidden": "hidden",
        });

        if (this.lastFocused) {
            this.lastFocused.focus();
        }

        $modal.trigger("closed");
    };

    this.triggerClose = function() {
        var $closeButton = $modal.find(".js-modal-close");
        if ($closeButton.length) {
            $closeButton.trigger("click");
            return;
        }

        this.close();
    };

    this.onModalClick = function(e) {
        // Close if clicked outside of the modal content elem
        var $clickedElem = jQuery(e.target);
        if ($clickedElem.children(".modal__content").length && !$clickedElem.closest(".modal__content").length) {
            this.triggerClose();
        }
    };

    this.onBackwardTab = function(e) {
        if (document.activeElement === this.$firstFocusable[0]) {
            e.preventDefault();
            this.$lastFocusable.focus();
        }
    };

    this.onForwardTab = function(e) {
        if (document.activeElement === this.$lastFocusable[0]) {
            e.preventDefault();
            this.$firstFocusable.focus();
        }
    };

    this.onKeyDown = function(e) {
        switch (e.keyCode || e.key) {
            case 9:
            case "Tab":
                if (this.$focusables.length <= 1) {
                    e.preventDefault();
                    break;
                }

                if (e.shiftKey) {
                    this.onBackwardTab(e);
                }
                else {
                    this.onForwardTab(e);
                }
                break;
            case 27:
            case "Escape":
                this.triggerClose();
                break;
        }
    };

    this.open = function() {
        this.lastFocused = document.activeElement;

        this.$body.addClass("no-scroll");
        this.$page.attr("aria-hidden", "true");

        $modal.attr({
            "tabindex": 0,
            "aria-hidden": false,
            "hidden": false,
        });
        $modal.addClass("is-open");

        this.$focusables = JPI.getFocusableChildren($modal);
        var focusablesLength = this.$focusables.length;
        if (focusablesLength) {
            this.$firstFocusable = jQuery(this.$focusables[0]);
            this.$lastFocusable = jQuery(this.$focusables[focusablesLength - 1]);

            this.$firstFocusable.focus();
        }
        else {
            $modal.focus();
        }

        $modal.trigger("opened");

        $modal.on("click", this.onModalClick.bind(this));
        $modal.on("click", ".js-modal-close", this.close.bind(this));
        $modal.on("keydown", this.onKeyDown.bind(this));
    };

    return {
        open: this.open.bind(this),
        close: this.close.bind(this),
    };
};
