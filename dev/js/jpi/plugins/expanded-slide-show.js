;/**
 * Used to expand a projects slide show
 */
JPI.ExpandedSlideShow = function() {
    "use strict";

    this.$element = jQuery(".expanded-slide-show");
    this.$currentCount = jQuery(".expanded-slide-show__current-count");
    this.$nav = jQuery(".expanded-slide-show__nav");

    this.timeout;

    this.$slides = {};
    this.current = 0;

    this.modal;

    this.displaySlide = function($expandedImage) {
        $expandedImage.attr("src", this.$slides[this.current].src);

        this.$currentCount.text(this.current + 1);
        var $currentBullet = jQuery(".expanded-slide-show__bullet:eq(" + this.current + ")");
        $currentBullet.addClass("expanded-slide-show__bullet--active");
    };

    // Changes the current slide to new slide
    this.changeSlide = function(newSlideIndex) {
        if (newSlideIndex >= this.$slides.length) {
            newSlideIndex = 0;
        }
        else if (newSlideIndex < 0) {
            newSlideIndex = this.$slides.length - 1;
        }

        if (newSlideIndex === this.current) {
            return;
        }

        this.current = newSlideIndex;

        var $expandedImageOld = jQuery(".expanded-slide-show__image--active");
        var $expandedImageNew = jQuery(".expanded-slide-show__image").not($expandedImageOld);

        jQuery(".expanded-slide-show__bullet--active").removeClass("expanded-slide-show__bullet--active");
        this.displaySlide($expandedImageNew);

        $expandedImageNew.addClass("expanded-slide-show__image--active");
        $expandedImageOld.removeClass("expanded-slide-show__image--active");
    };
    this.next = function() {
        this.changeSlide(this.current + 1);
    };
    this.previous = function() {
        this.changeSlide(this.current - 1);
    };

    this.onNavClick = function(e) {
        var direction = jQuery(e.target).attr("data-direction");
        this[direction]();
    };

    this.onBulletClick = function(e) {
        var slideId = jQuery(e.target).attr("data-slide-id");
        slideId = JPI.getInt(slideId);
        this.changeSlide(slideId);
    };

    this.onClose = function() {
        this.$element.removeClass("expanded-slide-show--closing");
        this.modal.close();
        this.timeout = null;
    };

    this.close = function() {
        this.$element.removeClass("expanded-slide-show--open").addClass("expanded-slide-show--closing");

        this.timeout = setTimeout(this.onClose.bind(this), 990);

        jQuery(".expanded-slide-show__close").off("click", this.close);
    };

    this.onCloseClick = function(e) {
        e.stopPropagation();
        this.close();
    };

    // Sets up slide show when image is clicked on
    this.open = function(slide, groupSelector) {
        clearTimeout(this.timeout);

        this.$slides = jQuery(slide)
            .parents(groupSelector)
            .find(".js-expandable-image")
        ;

        var slidesCount = this.$slides.length;

        jQuery(".expanded-slide-show__total-count").text(slidesCount);

        var $bulletsContainer = jQuery(".expanded-slide-show__bullets");
        $bulletsContainer.text("");

        // Only show navigations if there are more than one slide show image to slide through
        if (slidesCount > 1) {
            // Loops through all slide shows images and set up a bullet navigation for each
            for (var i = 0; i < slidesCount; i++) {
                // Checks if the current loop is the current image on slideShow
                if (this.$slides[i] === slide) {
                    this.current = i;
                }

                // Set up bullet navigation for slide
                JPI.renderNewElement("button", $bulletsContainer, {
                    "class": "expanded-slide-show__bullet",
                    "data-slide-id": i,
                });
            }

            this.$nav.show();
        }
        else {
            this.$nav.hide();
        }

        this.displaySlide(jQuery(".expanded-slide-show__image--active"));
        this.modal = new JPI.modal(this.$element);
        this.modal.open();
        this.$element.addClass("expanded-slide-show--open");

        this.$nav.on("click", this.onNavClick.bind(this));
        jQuery(".expanded-slide-show__bullet").on("click", this.onBulletClick.bind(this));
        jQuery(".expanded-slide-show__close").on("click", this.onCloseClick.bind(this));
    };

    return {
        open: this.open.bind(this),
        next: this.next.bind(this),
        previous: this.previous.bind(this),
        close: this.close.bind(this),
    };
};
