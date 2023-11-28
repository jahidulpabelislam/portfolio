;/**
 * Holds any helpers functions for whole project
 */
(function() {
    "use strict";

    /**
     * Used to check if a input field is empty
     * add invalid class if empty and return false
     * or remove invalid class if not empty and return true
     */
    JPI.checkInputField = function($input) {
        if ($input.val().trim() === "") {
            $input.removeClass("input--valid").addClass("input--invalid");
            return false;
        }

        $input.removeClass("input--invalid").addClass("input--valid");
        return true;
    };

    JPI.createElement = function(elementName, attributes) {
        return jQuery("<" + elementName + ">", attributes || {});
    };

    JPI.renderNewElement = function(elementName, $parent, attributes) {
        var $newElement = JPI.createElement(elementName, attributes || {});
        $parent.append($newElement);

        return $newElement;
    };

    JPI.getFocusableChildren = function($parent) {
        return $parent.find("a, button, input, select, textarea").filter(":not([disabled]):visible");
    };

    JPI.getInt = function(value, defaultInt) {
        var parsedInt = parseInt(value, 10);

        return isNaN(parsedInt) ? defaultInt : parsedInt;
    };

    JPI.getCookie = function(key) {
        key += "=";

        var cookies = document.cookie.split(";");

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];

            cookie = cookie.toString().trim();

            if (cookie.indexOf(key) === 0) {
                return cookie.substring(key.length);
            }
        }

        return false;
    };

    JPI.checkCookieValue = function(key, valueToCheck) {
        var cookie = JPI.getCookie(key);
        return cookie && cookie == valueToCheck;
    };

    JPI.setCookie = function(key, value, expirationDays) {
        var oneDayInMilliSecs = 24 * 60 * 60 * 1000;
        var expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + expirationDays * oneDayInMilliSecs);
        var expires = "expires=" + expiryDate.toUTCString();
        document.cookie = key + "=" + value + ";" + expires + ";path=/";
    };

    JPI.loadStylesheets = function(stylesheets) {
        var count = stylesheets.length;
        if (!count) {
            return;
        }

        var head = jQuery("head");
        var totalLoaded = 0;

        for (var i = 0; i < count; i++) {
            var stylesheet = stylesheets[i];

            var $newLink = JPI.renderNewElement("link", head, {
                rel: "stylesheet",
                type: "text/css",
                media: "all",
                title: "style",
                href: stylesheet,
            });

            $newLink.on("load", function() {
                totalLoaded++;
                if (totalLoaded === count) {
                    jQuery(window).trigger("jpi-css-loaded");
                }
            });
        }
    };

    /**
     * http://davidwalsh.name/javascript-debounce-function
     */
    JPI.debounce = function(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;

            var later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };

            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    };
})();
