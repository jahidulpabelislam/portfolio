var JPI = JPI || {};

//=include ./third-party/waypoint.min.js
//=include ./third-party/jquery.countTo.js
//=include ./jpi/plugins/slide-show.js
//=include ./jpi/plugins/templating.js
//=include ./jpi/plugins/ajax.js
//=include ./jpi/components/timeline.js
//=include ./jpi/components/skills.js
//=include ./jpi/components/map.js
//=include ./jpi/components/contact-form.js
//=include ./jpi/api.js

;/*
 * Holds all functions needed for the homepage
 * eg. to display latest 3 project on the home page
 */
(function() {
    "use strict";

    var $loading = jQuery(".latest-projects__loading");
    var $error = jQuery(".latest-projects__error");

    var $slidesContainer = jQuery(".slide-show__slides");
    var $bullets = jQuery(".slide-show__bullets");

    var slideTemplateHtml = jQuery("#slide-template").text();
    var bulletTemplateHtml = jQuery("#slide-bullet-template").text();

    var renderProjectsError = function(error) {
        $error.text(error).show(200);
        $loading.hide(200);
    };

    var renderProject = function(project) {
        project = JPI.api.formatProjectData(project);

        var slideTemplate = new JPI.Template(slideTemplateHtml);
        var bulletTemplate = new JPI.Template(bulletTemplateHtml);

        for (var field in project) {
            if ({}.hasOwnProperty.call(project, field)) {
                var value = project[field];
                slideTemplate.replace(field, value);
                bulletTemplate.replace(field, value);
            }
        }

        slideTemplate.renderIn($slidesContainer);
        bulletTemplate.renderIn($bullets);

        var slideId = "#slide-" + project.id;
        var $slide = jQuery(slideId);

        if (!project.images || !project.images.length || !project.images[0]) {
            $slide.find(".slide-show__image").remove();
        }
    };

    // Sets up events when projects is received
    var gotProjects = function(response) {
        $error.text("").hide(200);
        $loading.hide(200);

        // Send the data, the function to do if data is valid
        var wasSuccessfullyRendered = JPI.ajax.renderRowsOrError(
            response,
            renderProject,
            renderProjectsError,
            "Error Getting the Projects."
        );

        if (wasSuccessfullyRendered) {
            var slideShow = new JPI.SlideShow({
                selector: "#latest-projects",
            });
            slideShow.start();
        }
    };

    var getProjects = function() {
        JPI.ajax.request({
            method: "GET",
            url: JPI.projects.apiEndpoint + "/projects/",
            data: {limit: 3},
            onSuccess: gotProjects,
            onError: renderProjectsError,
        });
    };

    var counterFormatter = function(value, options) {
        options = options || {};
        value = value.toFixed(options.decimals || 0);
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return value;
    };

    var initCounters = function() {
        var countToOptions = {
            formatter: counterFormatter,
        };
        var waypointArgs = {offset: "95%"};
        jQuery(".js-counters").waypoint(function() {
            jQuery(this.element)
                .find(".js-counter")
                .each(function(j, counter) {
                    jQuery(counter).countTo(countToOptions);
                })
            ;
        }, waypointArgs);
    };

    $loading.show(200);

    initCounters();

    jQuery(window).on("jpi-css-loaded", getProjects);
})();
