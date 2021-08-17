;/**
 * Holds all functions needed for a project slide show
 */
window.jpi = window.jpi || {};
(function(jQuery, jpi) {

    "use strict";

    var getXPosition = function(e) {
        return e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    };

    var removeSelector = function(selector) {
        return selector.substring(1);
    }

    window.jpi.SlideShow = function(options) {

        var defaults = {
            selector: ".slide-show",
            viewportSelector: ".slide-show__viewport",
            slidesContainerSelector: ".slide-show__slides",
            slideSelector: ".slide-show__slide",
            bulletsSelector: ".slide-show__bullets",
            bulletSelector: ".slide-show__bullet",
            navSelector: ".slide-show__nav",

            slidesPerView: 1,

            durationPerSlide: 5000, // Milliseconds
        };

        options = jQuery.extend(defaults, options || {});

        var slideShow = jQuery(options.selector);
        var viewport = slideShow.find(options.viewportSelector);
        var container = slideShow.find(options.slidesContainerSelector);
        var slides = slideShow.find(options.slideSelector);

        var bulletsContainer;
        var bullets;
        if (options.bulletsSelector && options.bulletSelector) {
            bulletsContainer = slideShow.find(options.bulletsSelector);
            bullets = slideShow.find(options.bulletSelector);
        }

        var navs = slideShow.find(options.navSelector);

        var internal;

        // Resets the transition duration of a slide show
        var resetTransition = function() {
            container.css("transition-duration", "");
        };

        // Widens slide show to fit all slides
        var widenSlideShow = function() {
            var slideWidth = viewport.innerWidth();

            if (options.slidesPerView) {
                slideWidth = slideWidth / options.slidesPerView;
            }

            slides.css("width", slideWidth + "px");

            container.css("width", slideWidth * slides.length + "px");
        };

        // Moves current slide to correct position
        var resetToCurrentSlide = function() {
            var position = slideShow.find(options.slideSelector + "--active").position();
            container.css({
                transitionDuration: "0s",
                left: "-" + position.left + "px",
            });

            resetTransition();
        };

        // Adjusts all slides in slide show to fit
        var repositionSlides = function() {
            widenSlideShow();
            resetToCurrentSlide();
        };

        var moveToSlide = function(nextSlide) {
            var currentSlide = slideShow.find(options.slideSelector + "--active");

            currentSlide.removeClass(removeSelector(options.slideSelector) + "--active");

            if (bullets) {
                bullets.filter(options.bulletSelector + ".slide-show__bullet--active")
                    .removeClass(removeSelector(options.bulletSelector)  + "--active")
                ;
            }
            nextSlide.addClass(removeSelector(options.slideSelector) + "--active");

            var position = nextSlide.position();

            container.css("left", "-" + position.left + "px");

            if (bullets) {
                var newSlideID = nextSlide.attr("id");
                bullets.filter("[data-slide-id='#" + newSlideID + "']")
                    .addClass(removeSelector(options.bulletSelector) + "--active")
                ;
            }


            jpi.helpers.getFocusableChildren(currentSlide).attr("tabindex", -1);
            jpi.helpers.getFocusableChildren(nextSlide).attr("tabindex", "");
        };

        // Moves to next or previous slide
        var move = function(direction) {
            var oldSlide = slideShow.find(options.slideSelector + "--active");

            var nextSlide;
            if (direction === "previous") {
                nextSlide = oldSlide.prev();
                if (!nextSlide.length) {
                    nextSlide = slides.last();
                }
            }
            else {
                nextSlide = oldSlide.next();
                if (!nextSlide.length) {
                    nextSlide = slides.first();
                }
            }

            moveToSlide(nextSlide);
        };

        // Sets up events when the user wants to change slides with drag control
        var onSlideDrag = function(startEvent) {
            var dragMove, dragEnd;

            var slidesContainerDom = container[0];
            var slidesContainerLeft = container.position().left;

            var startX = getXPosition(startEvent);

            var removeListeners = function() {
                slidesContainerDom.removeEventListener("touchmove", dragMove);
                slidesContainerDom.removeEventListener("mousemove", dragMove);
                slidesContainerDom.removeEventListener("touchend", dragEnd);
                slidesContainerDom.removeEventListener("mouseup", dragEnd);
                slidesContainerDom.removeEventListener("mouseleave", dragEnd);
            };
            var dragCancel = function() {
                resetToCurrentSlide();
                resume();
                removeListeners();
            };
            dragMove = function(e) {
                var endX = getXPosition(e);
                var diff = startX - endX;

                container.css({
                    transitionDuration: "0s",
                    left: (slidesContainerLeft - diff) + "px",
                });
            };
            dragEnd = function(e) {
                var endX = getXPosition(e);

                var diff = startX - endX;
                if (Math.abs(diff) >= 15) {
                    resetTransition();
                    move(diff < 0 ? "previous" : "next");
                    resume();
                    removeListeners();
                    return;
                }

                dragCancel();
            };

            pause();
            slidesContainerDom.addEventListener("touchmove", dragMove);
            slidesContainerDom.addEventListener("mousemove", dragMove);
            slidesContainerDom.addEventListener("touchend", dragEnd);
            slidesContainerDom.addEventListener("mouseup", dragEnd);
            slidesContainerDom.addEventListener("mouseleave", dragEnd);
        };

        // Pause a slide show by clearing the interval function on slide show id
        var pause = function() {
            clearInterval(internal);
        };

        var stop = function() {
            var slidesContainer = container[0];
            slidesContainer.removeEventListener("mousedown", onSlideDrag);
            slidesContainer.removeEventListener("touchstart", onSlideDrag);

            clearInterval(internal);
        };

        // Resumes a slide show by slide show element id
        var resume = function() {
            internal = setInterval(function() {
                move("next");
            }, options.durationPerSlide);
        };

        // Function when bullet was clicked to change slide show to a particular slide
        var changeToSlide = function(e) {
            var bulletElem = jQuery(e.target);
            var clickedSlideId = bulletElem.attr("data-slide-id");
            var nextSlide = slideShow.find(clickedSlideId);

            pause();
            moveToSlide(nextSlide);
            resume();
        };

        var start = function() {
            var count = slides.length;

            if (count <= 0) {
                if (bulletsContainer) {
                    bulletsContainer.hide();
                }
                if (navs) {
                    navs.hide();
                }

                return;
            }

            var firstSlide = slides.first();

            var inactiveSlides = slides.not(firstSlide);

            jpi.helpers.getFocusableChildren(inactiveSlides).attr("tabindex", -1);

            firstSlide.addClass(removeSelector(options.slideSelector) + "--active");

            if (bullets) {
                bullets.first().addClass(removeSelector(options.bulletSelector) +  "--active");
            }

            if (count > 1) {
                widenSlideShow();

                if (bulletsContainer) {
                    bulletsContainer.show();
                }
                if (navs) {
                    navs.show();
                }

                container[0].addEventListener("mousedown", onSlideDrag);
                container[0].addEventListener("touchstart", onSlideDrag);

                resume();
            }
        };

        var init = function() {
            slideShow.on("dragstart", ".slide-show__image", false); // todo: move

            if (bullets) {
                bullets.on("click", changeToSlide);
            }

            if (navs) {
                navs.on("click", function(e) {
                    var nav = jQuery(e.target);
                    pause();
                    move(nav.attr("data-direction"));
                    resume();
                });
            }

            jQuery(window).on("orientationchange resize", jpi.helpers.debounce(repositionSlides, 150));
        };

        this.stop = stop;
        this.pause = pause;
        this.resume = resume;

        init();
        start();
    };

})(jQuery, jpi);