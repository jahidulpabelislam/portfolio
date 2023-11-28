;new (function() {
    "use strict";

    var form = this;

    this.$form = jQuery(".contact-form");

    this.$inputs = this.$form.find(".input");
    this.$email = jQuery(".contact-form__email");
    this.$message = jQuery(".contact-form__message");
    this.$subject = jQuery(".contact-form__subject");
    this.$emailFeedback = jQuery(".contact-form__email-feedback");
    this.$messageFeedback = jQuery(".contact-form__message-feedback");
    this.$feedback = jQuery(".contact-form__feedback");
    this.$submit = jQuery(".contact-form__submit");

    this.reset = function() {
        this.$inputs.attr("disabled", false);
        this.$submit.prop("disabled", false).html(this.$submit.attr("data-initial-text"));
    };

    // Show appropriate & relevant feedback to the user after an attempt of sending a message
    this.renderResponse = function(response) {
        this.reset();

        // Check if message was sent
        if (response.ok) {
            if (response.feedback) {
                this.$feedback.removeClass("field__error").addClass("field__feedback");
            }

            this.$inputs.val("");
            this.$form.find(".field").hide();
            this.$submit.hide();
        }
        else {
            if (response.feedback) {
                this.$feedback.removeClass("field__feedback").addClass("field__error");
            }
            if (response.messageFeedback) {
                this.$messageFeedback.text(response.messageFeedback).show(200);
            }
            if (response.emailAddressFeedback) {
                this.$emailFeedback.text(response.emailAddressFeedback).show(200);
            }
        }

        if (response.feedback) {
            this.$feedback.text(response.feedback).show(200);
        }
    };

    // Render an error message when AJAX has errored
    this.renderErrorMessage = function() {
        this.$feedback
            .text("Something went wrong, please try again later.")
            .removeClass("field__feedback")
            .addClass("field__error")
            .show(200)
        ;

        this.reset();
    };

    this.validateEmail = function(isForm) {
        var emailAddress = this.$email.val();

        this.$feedback.hide(200);
        this.$email.removeClass("input--valid");

        if (emailAddress.trim() === "") {
            if (isForm) {
                this.$email.addClass("input--invalid");
                this.$emailFeedback.text("Email address must be provided and valid.").show(200);
            }
            return false;
        }

        var validEmailPattern = /\b[\w._-]+@[\w-]+.[\w]{2,}\b/im;
        var emailValidationTest = validEmailPattern.test(emailAddress);

        if (emailValidationTest) {
            this.$email.removeClass("input--invalid").addClass("input--valid");
            this.$emailFeedback.hide(200);
            return true;
        }

        if (isForm) {
            this.$email.addClass("input--invalid");
            this.$emailFeedback.text("Email address must be valid.").show(200);
        }

        return false;
    };

    this.validateMessage = function(isForm) {
        var message = this.$message.val();

        this.$feedback.hide(200);
        this.$message.removeClass("input--valid");

        if (message.trim() !== "") {
            this.$message.removeClass("input--invalid").addClass("input--valid");
            this.$messageFeedback.hide(200);
            return true;
        }

        if (isForm) {
            this.$message.addClass("input--invalid");
            this.$messageFeedback.text("Message must be filled out.").show(200);
        }

        return false;
    };

    this.submit = function() {
        this.$inputs.attr("disabled", true);
        this.$submit.prop("disabled", true).html(this.$submit.attr("data-loading-text"));

        var isEmailValid = this.validateEmail(true);
        var isMessageValid = this.validateMessage(true);

        if (isEmailValid && isMessageValid) {
            JPI.ajax.request({
                method: "POST",
                url: "/contact/",
                data: {
                    emailAddress: this.$email.val(),
                    subject: this.$subject.val(),
                    message: this.$message.val(),
                },
                onSuccess: this.renderResponse.bind(this),
                onError: this.renderErrorMessage.bind(this),
            });
        }
        else {
            this.reset();
        }

        return false;
    };

    this.initListeners = function() {
        this.$subject.on("keyup", function() {
            form.$feedback.hide(200);
        });
        this.$email.on("input", function() {
            form.validateEmail();
        });
        this.$message.on("input", function() {
            form.validateMessage();
        });

        this.$form.on("submit", this.submit.bind(this));
    };

    this.initListeners();
})();
