;JPI.ajax = new (function() {
    "use strict";

    // Display feedback from server if there is one otherwise output generic message
    this.checkAndRenderError = function(response, errorRenderer, genericMessage) {
        var message = genericMessage || "";
        if (response) {
            if (response.error) {
                message = response.error;
            }
            else if (response.message) {
                message = response.message;
            }
        }

        if (message) {
            errorRenderer(message);
        }
    };

    // Loop through data to see if it exists and if it does run a function on each row
    this.renderRowsOrError = function(response, rowRenderer, errorRenderer, genericMessage) {
        // If data/rows exists, For each row run a function
        if (response && response.data && response.data.length) {
            for (var i = 0; i < response.data.length; i++) {
                if ({}.hasOwnProperty.call(response.data, i)) {
                    rowRenderer(response.data[i]);
                }
            }

            return true;
        }

        // Otherwise check feedback and show user and return false as data isn't there
        this.checkAndRenderError(response, errorRenderer, genericMessage);
        return false;
    };

    /**
     * Function for sending XHR requests
     *
     * @param request Object of necessary data needed to do a HTTP request
     * {
     *     "method": HTTP Method (string),
     *     "url": URL to load (string),
     *     "data": object of payload,
     *     "onSuccess": function to run when XHR request is successful
     *     "onError": function to run when there's an error
     * }
     */
    this.request = function(request) {
        return jQuery.ajax({
            url: request.url,
            method: request.method.toUpperCase(),
            data: request.data,
            dataType: "json",
            success: request.onSuccess,
            error: function() {
                request.onError("Error Loading Content.");
            },
        });
    };

    return {
        renderRowsOrError: this.renderRowsOrError.bind(this),
        request: this.request.bind(this),
    };
})();
