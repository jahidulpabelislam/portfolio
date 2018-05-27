//holds all the functions needed to display project in the projects page
window.jpi = window.jpi || {};
window.jpi.projects = (function (jQuery) {

    "use strict";

    //grabs elements for later use
    var url = new URL(window.location),

        //prints out a error message provided
        renderError = function(error) {
            jQuery(".feedback--error").text(error).show("fast");
            jQuery(".projects-loading-img, .pagination").text("").hide("fast");
            jpi.footer.delayExpand();
        },

        addSkills = function(project, divID) {
            var skills = project.Skills.split(","),
                skillsContainer = jQuery(divID + " .project__skills")[0];

            for (var i = 0; i < skills.length; i++) {
                if (skills[i].trim() !== "") {

                    var skill = jpi.helpers.createElement(skillsContainer, "p", {innerHTML: skills[i], class: "js-searchable-skill skill skill--"+project.Colour}),
                        searches = jQuery(".search-input")[0].value.split(" ");

                    for (var j = 0; j < searches.length; j++) {
                        if (searches[j].trim() !== "" && skills[i].toLowerCase().includes(searches[j].toLowerCase())) skill.className += " searched";
                    }
                }
            }
        },

        addLinks = function(project, divID) {
            var linksp = jQuery(divID + " .project__links")[0];

            if (project.Link) {
                jpi.helpers.createElement(linksp, "a", {
                    href: project.Link,
                    title: "Link to " + project.Name + " Site",
                    target: "_blank",
                    innerHTML: "<i class='fa fa-external-link fa-2x'></i>",
                    class: "project__link project__link--" + project.Colour
                });
            }

            if (project.Download) {
                jpi.helpers.createElement(linksp, "a", {
                    href: project.Download,
                    title: "Link to Download " + project.Name,
                    target: "_blank",
                    innerHTML: "<i class='fa fa-download fa-2x'></i>",
                    class: "project__link project__link--" + project.Colour
                });
            }

            jpi.helpers.createElement(linksp, "a", {
                href: project.GitHub,
                title: "Link to " + project.Name + "  Code On GitHub",
                target: "_blank",
                innerHTML: "<i class='fa fa-github fa-2x'></i>",
                class: "project__link project__link--" + project.Colour
            });
        },

        addProjectPictures = function(project, slideShowId) {
            var slidesContainer = jQuery(slideShowId + " .slide-show__slides-container"),
                slideShowBullets = jQuery(slideShowId + " .js-slide-show-bullets");

            //loop through each row of data in rows
            for (var i = 0; i < project.pictures.length; i++) {

                if (project.pictures.hasOwnProperty(i)) {

                    var slide_template = jQuery('#tmpl-slide-template').text();
                    var bullet_template = jQuery('#tmpl-slide-bullet-template').text();

                    for (var data in project.pictures[i]) {
                        if (project.pictures[i].hasOwnProperty(data)) {
                            if (typeof data === "string") {
                                var reg = new RegExp("{{" + data + "}}", "g");
                                slide_template = slide_template.replace(reg, project.pictures[i][data]);
                                bullet_template = bullet_template.replace(reg, project.pictures[i][data]);
                            }
                        }
                    }
                    var colour_reg = new RegExp("{{Colour}}", "g");
                    slide_template = slide_template.replace(colour_reg, project.Colour);
                    bullet_template = bullet_template.replace(colour_reg, project.Colour);

                    var id_reg = new RegExp("{{Slide-Show-ID}}", "g");
                    bullet_template = bullet_template.replace(id_reg, slideShowId);

                    slidesContainer.append(slide_template);
                    slideShowBullets.append(bullet_template);
                }
            }

            if (project.pictures.length > 0) {
                jpi.slideShow.setUp(slideShowId);
            }
        },

        openProjectsExpandModal = function () {
            var project = jQuery(this).data("projectData");

            jQuery(".modal--detailed-project").addClass("open").show();
            document.body.style.overflow = "hidden";

            //stops all the slide shows
            jpi.slideShow.loopThroughSlideShows(jpi.slideShow.stopSlideShow);

            jQuery(".modal--detailed-project .project__links, .modal--detailed-project .project__skills, .modal--detailed-project .slide-show__slides-container, .modal--detailed-project .js-slide-show-bullets").text("");

            jQuery(".modal--detailed-project .project-title").text(project.Name);
            jQuery(".modal--detailed-project .project-date").text(project.Date);

            addSkills(project, ".modal--detailed-project");

            jQuery(".modal--detailed-project .description").html(project.LongDescription);

            addLinks(project, ".modal--detailed-project");

            addProjectPictures(project, "#detailed-project__slide-show");

            var regx = new RegExp("slide-show__nav--\\w*", 'g');

            jQuery(".modal--detailed-project .slide-show__nav").each(function() {
                var classList = jQuery(this).attr("class");
                classList =  classList.replace(regx, 'slide-show__nav--'+project.Colour);
                jQuery(this).attr("class", classList);
            });
        },

        closeProjectsExpandModal = function(event) {
            if(!jQuery(event.target).closest('.modal__content').length && jQuery(".modal--detailed-project").hasClass("open")) {
                jQuery(".modal--detailed-project").removeClass("open").hide();
                document.body.style.overflow = "auto";
                jQuery("#detailed-project__slide-show .slide-show__viewpoint")[0].removeEventListener("mousedown", jpi.slideShow.dragStart);
                jQuery("#detailed-project__slide-show .slide-show__viewpoint")[0].removeEventListener("touchstart", jpi.slideShow.dragStart);
                jQuery("#detailed-project__slide-show .slide-show__slides-container").css("left", "0px");
                clearInterval(autoSlide["#detailed-project__slide-show"]);
                jQuery("#detailed-project__slide-show").removeClass("hasSlideShow");
                jpi.slideShow.loopThroughSlideShows(jpi.slideShow.startSlideShow);
            }
        },

        //renders a project
        renderProject = function(project) {

            if (!document.getElementById("project--" + project.ID)) {

                var template = jQuery('#tmpl-project-template').text();

                for (var data in project) {
                    if (project.hasOwnProperty(data)) {
                        if (typeof data === "string") {
                            var reg = new RegExp("{{" + data + "}}", "g");
                            template = template.replace(reg, project[data]);
                        }
                    }
                }
                jQuery(".projects").append(template);

                addSkills(project, "#project--" + project.ID);
                addLinks(project, "#project--" + project.ID);
                addProjectPictures(project, "#slide-show--" + project.ID);

                jQuery("#project--" + project.ID + " .js-open-modal").data("projectData", project);
            }

            jpi.footer.delayExpand();
        },

        scrollToProjects = function() {
            jQuery('html, body').animate({
                scrollTop: jQuery(".projects").offset().top - jQuery(".nav").height()
            }, 2000);
        },

        //adds pagination to the page
        addPagination = function(count) {
            if ((parseInt(count)) > 10) {

                var page = 1,
                    ul = jQuery(".pagination")[0],
                    path = url.pathname.substring(1).split('/');

                if (Number.isInteger(parseInt(path[1]))) {
                    var currentPage = parseInt(path[1]);
                }

                if (!currentPage) currentPage = 1;

                for (var i = 0; i < count; i += 10, page++) {
                    var attributes = {innerHTML: page, "class" : "pagination__item js-pagination-item"};
                    if (page === currentPage) {
                        attributes.class = "pagination__item active";
                    }
                    jpi.helpers.createElement(ul, "li", attributes);
                }

                jQuery(".pagination").show();
            } else {
                jQuery(".pagination").hide();
            }
        },

        //set up events when projects were received
        gotProjects = function(result) {
            jQuery(".feedback--error, .projects-loading-img").text("").hide("fast");
            jQuery(".projects, .pagination").text("");

            //send the data, the function to do if data is valid
            jpi.ajax.loopThroughData(result, renderProject, renderError, "No Projects Found.");

            if (result.count) {
                addPagination(result.count);
            }

            jpi.footer.delayExpand();
        },

        getProjects = function(query) {
            //stops all the slide shows
            jpi.slideShow.loopThroughSlideShows(jpi.slideShow.stopSlideShow);

            jQuery(".projects-loading-img").show("fast");

            //send request to get projects
            jpi.ajax.sendRequest({
                method: "GET",
                url: "/admin/api/1/projects/",
                query: query,
                load: gotProjects,
                error: renderError
            });
        },

        //send request when the user has done a search
        doSearch = function() {
            var query = {};

            url.pathname = "/projects/";
            if (jQuery(".search-input")[0].value.trim() !== "") {
                url.search = "?search=" + jQuery(".search-input")[0].value;
                query.search = jQuery(".search-input")[0].value;
            } else {
                jQuery(".search-input")[0].value = url.search = "";
            }

            history.pushState(null, null, url.toString());

            getProjects(query);
            return false;
        },

        //get the search query from URL if any
        getSearch = function() {
            var searches = url.search.substring(1).split('&'),

                lookForSearch = /\bsearch=/im;

            //loop through each search query of data in rows
            for (var i = 0; i < searches.length; i++) {
                var regExResult = lookForSearch.test(searches[i]);
                if (regExResult) {
                    var searchSplit = searches[i].split('=');
                    return decodeURIComponent(searchSplit[1]);
                }
            }
        },

        //load projects
        load = function() {

            var query = {},
                path = url.pathname.substring(1).split('/');

            //check if pagination is involved
            if (path[1] && Number.isInteger(parseInt(path[1]))) {
                query.page = parseInt(path[1]);
            }

            //check if search in involved
            var search = getSearch();
            if (search) {
                query.search = jQuery(".search-input")[0].value = search;
            } else {
                jQuery(".search-input").val("");
            }

            getProjects(query);
        },

        //set up page
        initListeners = function () {
            jQuery(".search-form").on("submit", doSearch);

            jQuery("body").on("click", ".js-searchable-skill", function(e) {
                jQuery(".search-input")[0].value = e.target.innerHTML;
                doSearch();
            });

            jQuery(".pagination--projects").on("click", ".js-pagination-item", function(e) {
                scrollToProjects();

                url.pathname = "/projects/" + e.target.innerHTML + "/";
                history.pushState(null, null, url.toString());
                load();
            });

            jQuery(".projects").on("click", ".js-open-modal", openProjectsExpandModal);

            window.addEventListener('popstate', function() {
                url = new URL(window.location);
                scrollToProjects();
                load();
            });

            //Close the modal
            jQuery(".modal--detailed-project").on("click", closeProjectsExpandModal);
        },

        init = function () {
            if (jQuery(".projects").length > 0) {
                initListeners();
                load();
            }
        };

    jQuery(document).on("ready", init);
}(jQuery));