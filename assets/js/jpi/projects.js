;/**
 * Holds all the functions needed for the projects page
 * e.g. display projects
 */
window.jpi = window.jpi || {};
window.jpi.projects = (function(jQuery, jpi) {

    "use strict";

    var global = {
        url: new URL(window.location),
        titleStart: "Projects",
        titleEnd: " | Jahidul Pabel Islam - Full Stack Developer",

        modalSelector: ".detailed-project",

        templateRegexes: {},
        navColourRegex: null,

        projects: {},

        dateFormat: false,
    };

    var fn = {

        // Helper function to format Project data from the API to the necessary format for the Website
        formatProjectData: function(project) {
            if (project.date) {
                var date = new Date(project.date);
                project.date = global.dateFormat.format(date);
            }

            // Make sure colour placeholders are replaced in content
            var colourRegex = fn.getTemplateRegex("colour");
            var fields = ["short_description", "long_description"];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (project.hasOwnProperty(field)) {
                    project[field] = project[field].replace(colourRegex, project.colour);
                }
            }

            return project;
        },

        getCurrentPageNum: function() {
            var currentPageNum = jQuery(".js-projects-page").val();
            currentPageNum = jpi.helpers.getInt(currentPageNum, 1);

            return currentPageNum;
        },

        bottomAlignProjectFooters: function() {
            var projects = jQuery(".project");
            var numOfProjects = projects.length;
            if (!numOfProjects) {
                return;
            }

            jQuery(".project .project__description").css("min-height", 0);

            if (window.innerWidth < 768) {
                return;
            }

            for (var i = 0; i < numOfProjects; i++) {
                var project = jQuery(projects[i]);
                var height = project.height();

                var projectDesc = project.find(".project__description");

                var otherElems = project.find("> *").not(projectDesc);
                var totalAllHeight = 0;
                otherElems.each(function(j, elem) {
                    totalAllHeight += jQuery(elem).outerHeight(true);
                });

                // Expand the description element to fit remaing space
                var maxHeight = projectDesc.outerHeight(true);
                var innerHeight = projectDesc.height();
                var padding = maxHeight - innerHeight;

                var newHeight = height - totalAllHeight - padding;
                projectDesc.css('min-height', newHeight);
            }
        },

        // Prints out a error message provided
        renderError: function(error) {
            jQuery(".feedback--error").text(error).show("fast");
            jQuery(".projects__loading-img, .pagination").text("").hide("fast");
            jpi.main.resetFooter();
        },

        getTemplateRegex: function(regex) {
            if (!global.templateRegexes[regex]) {
                global.templateRegexes[regex] = new RegExp("\{{2} {0,1}" + regex + " {0,1}\\}{2}", "g");
            }

            return global.templateRegexes[regex];
        },

        createPaginationItem: function(page, currentPage, paginationsElem) {
            var itemAttributes = {class: "pagination__item"};
            var item = jpi.helpers.createElement(paginationsElem, "li", itemAttributes);

            var url = fn.getNewURL(page);
            url += global.url.search;

            var linkAttributes = {
                "innerHTML": page,
                "class": "pagination__item-link js-pagination-item",
                "data-page": page,
                "href": url,
            };
            if (page === currentPage) {
                linkAttributes.class = "pagination__item-link active";
            }
            return jpi.helpers.createElement(item, "a", linkAttributes);
        },

        // Adds pagination buttons/elements to the page
        addPagination: function(totalProjects) {
            totalProjects = jpi.helpers.getInt(totalProjects);
            if (totalProjects > jpi.config.projectsPerPage) {
                var paginationElem = jQuery(".pagination");

                var ul = paginationElem[0];
                var currentPage = fn.getCurrentPageNum();

                var totalPages = Math.ceil(totalProjects / jpi.config.projectsPerPage);

                for (var page = 1; page <= totalPages; page++) {
                    fn.createPaginationItem(page, currentPage, ul);
                }

                paginationElem.css("display", "inline-block");
            }
        },

        addSkills: function(project, divID) {
            var skills = project.skills,
                skillsContainer = jQuery(divID + " .project__skills")[0],
                search = jQuery(".search-form__input").val().trim(),
                lowerCasedSearch = search.toLowerCase(),
                searches = lowerCasedSearch.split(" ");

            if (!skillsContainer) {
                return;
            }

            for (var i = 0; i < skills.length; i++) {
                var skill = skills[i].trim();

                if (skill === "") {
                    continue;
                }

                var lowerCasedSkill = skill.toLowerCase();

                var isInSearch = false;
                for (var j = 0; j < searches.length; j++) {
                    if (searches[j].trim() !== "" && lowerCasedSkill.includes(searches[j])) {
                        isInSearch = true;
                        break;
                    }
                }

                var classes = "project__skill project__skill--" + project.colour;
                classes += isInSearch ? " searched" : " js-searchable-skill";

                jpi.helpers.createElement(skillsContainer, "a", {
                    innerHTML: skill,
                    class: classes,
                    href: "/projects/" + skill + "/",
                });
            }
        },

        addLinks: function(project, containerSelector) {
            var linksContainer = jQuery(containerSelector + " .project__links");

            if (!project.link && !project.download && !project.github) {
                if (containerSelector !== global.modalSelector) {
                    linksContainer.remove();
                }
                return;
            }

            linksContainer = linksContainer[0];

            if (project.link) {
                jpi.helpers.createElement(linksContainer, "a", {
                    href: project.link,
                    title: "Link to " + project.name,
                    target: "_blank",
                    rel: "noopener",
                    innerHTML: "<i class='fas fa-link fa-2x'></i>",
                    class: "project__link project__link--" + project.colour,
                });
            }

            if (project.download) {
                jpi.helpers.createElement(linksContainer, "a", {
                    href: project.download,
                    title: "Link to download " + project.name,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    innerHTML: "<i class='fas fa-download fa-2x'></i>",
                    class: "project__link project__link--" + project.colour,
                });
            }

            if (project.github) {
                jpi.helpers.createElement(linksContainer, "a", {
                    href: project.github,
                    title: "Link to " + project.name + " code on GitHub",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    innerHTML: "<i class='fab fa-github fa-2x'></i>",
                    class: "project__link project__link--" + project.colour,
                });
            }
        },

        addProjectImages: function(project, containerSelector) {
            var slideShow = jQuery(containerSelector).find(".slide-show");
            var slideShowId = "#" + slideShow.attr("id");

            if (!project.images || !project.images.length) {
                if (containerSelector !== global.modalSelector) {
                    jQuery(slideShowId).remove();
                }
                return;
            }

            var slidesContainer = jQuery(slideShowId + " .slide-show__slides-container"),
                slideShowBullets = jQuery(slideShowId + " .slide-show__bullets");

            // Loop through each row of data in rows
            for (var i = 0; i < project.images.length; i++) {
                if (!project.images.hasOwnProperty(i)) {
                    continue;
                }

                var slideTemplate = jQuery("#tmpl-slide-template").text();
                var bulletTemplate = jQuery("#tmpl-slide-bullet-template").text();

                for (var field in project.images[i]) {
                    if (typeof field === "string" && project.images[i].hasOwnProperty(field)) {
                        var regex = fn.getTemplateRegex(field);
                        var data = project.images[i][field];
                        slideTemplate = slideTemplate.replace(regex, data);
                        bulletTemplate = bulletTemplate.replace(regex, data);
                    }
                }

                var colourRegex = fn.getTemplateRegex("colour");
                slideTemplate = slideTemplate.replace(colourRegex, project.colour);
                bulletTemplate = bulletTemplate.replace(colourRegex, project.colour);

                var idRegex = fn.getTemplateRegex("slide-show-id");
                bulletTemplate = bulletTemplate.replace(idRegex, slideShowId);

                slidesContainer.append(slideTemplate);
                slideShowBullets.append(bulletTemplate);
            }

            jpi.slideShow.setUp(slideShowId);
        },

        // Renders a single project
        renderProject: function(project) {
            var projectSelector = "#project--" + project.id;
            if (jQuery(projectSelector).length) {
                return;
            }

            project = fn.formatProjectData(project);

            global.projects[project.id] = project;

            var template = jQuery("#tmpl-project-template").text();
            for (var field in project) {
                if (project.hasOwnProperty(field) && typeof field === "string") {
                    var regex = fn.getTemplateRegex(field);
                    var value = project[field];
                    template = template.replace(regex, value);
                }
            }
            jQuery(".projects__items").append(template);

            fn.addProjectImages(project, projectSelector);
            fn.addSkills(project, projectSelector);
            fn.addLinks(project, projectSelector);
        },

        // Sets up events when projects were received
        gotProjects: function(response) {
            jQuery(".feedback--error, .projects__loading-img").text("").hide("fast");
            jQuery(".projects__items").text("");
            jQuery(".pagination").text("").hide();

            // Send the data, the function to do if data is valid
            jpi.ajax.renderRowsOrFeedback(
                response,
                fn.renderProject,
                fn.renderError,
                "No Projects Found."
            );

            if (response && response.meta && response.meta.total_count) {
                fn.addPagination(response.meta.total_count);
            }

            fn.bottomAlignProjectFooters();
            jpi.main.resetFooter();
        },

        getProjects: function() {
            var page = fn.getCurrentPageNum(),
                search = jQuery(".search-form__input").val(),
                query = {
                    page: page,
                    search: search,
                    limit: jpi.config.projectsPerPage,
                };

            // Stops all the slide shows
            jpi.slideShow.stopSlideShows();

            // Send request to get projects for page and search
            jpi.ajax.sendRequest({
                method: "GET",
                url: jpi.config.jpiAPIEndpoint + "/projects/",
                params: query,
                onSuccess: fn.gotProjects,
                onError: fn.renderError,
            });
        },

        openProjectModal: function() {
            var projectId = jQuery(this).attr("data-project-id"),
                project = global.projects[projectId],
                modal = jQuery(global.modalSelector);

            // Stops all the slide shows
            jpi.slideShow.stopSlideShows();

            modal.find(".project__links, .project__skills, .slide-show__slides-container, .slide-show__bullets").text("");

            modal.find(".modal__heading").text(project.name);
            modal.find(".project__date").text(project.date);
            modal.find(".project__description").html(project.long_description);

            var projectTypeElem = modal.find(".project__type");

            projectTypeElem.text(project.type);

            var classList = projectTypeElem.attr("class");
            classList = classList.replace(global.typeColourRegex, "project__type--" + project.colour);
            projectTypeElem.attr("class", classList);

            fn.addSkills(project, global.modalSelector);
            fn.addLinks(project, global.modalSelector);
            fn.addProjectImages(project, global.modalSelector);

            if (!global.navColourRegex) {
                global.navColourRegex = new RegExp("slide-show__nav--[\\w-]*", "g");
            }

            modal.find(".slide-show__nav").each(function() {
                var slideShowNav = jQuery(this);
                var classList = slideShowNav.attr("class");
                classList = classList.replace(global.navColourRegex, "slide-show__nav--" + project.colour);
                slideShowNav.attr("class", classList);
            });

            jpi.modal.open(modal);

            jpi.slideShow.reposition("detailed-project__slide-show");
        },

        onProjectModalClose: function() {
            var viewpoint = jQuery(global.modalSelector + " .slide-show__viewpoint")[0];
            viewpoint.removeEventListener("mousedown", jpi.slideShow.dragStart);
            viewpoint.removeEventListener("touchstart", jpi.slideShow.dragStart);

            // Reset slide show
            jQuery(global.modalSelector + " .slide-show__slides-container").css("left", "0px");
            clearInterval(jpi.slideShow.slideShows["#detailed-project__slide-show"]);
            jQuery("#detailed-project__slide-show").removeClass("js-has-slide-show");

            jpi.slideShow.startSlideShows();
        },

        getNewURL: function(page) {
            var url = "/projects/";

            var searchValue = jQuery(".search-form__input").val();
            if (searchValue.trim() !== "") {
                url += searchValue + "/";
            }

            if (page > 1) {
                url += page + "/";
            }

            return url;
        },

        getNewTitle: function(page) {
            var title = global.titleStart,
                searchValue = jQuery(".search-form__input").val();

            if (searchValue.trim() !== "") {
                title += " with " + searchValue;
            }

            if (page > 1) {
                title += " - Page " + page;
            }

            title += global.titleEnd;

            return title;
        },

        storeLatestSearch: function() {
            var searchValue = jQuery(".search-form__input").val(),
                page = fn.getCurrentPageNum(),
                title = fn.getNewTitle(page),
                url = fn.getNewURL(page),
                state = {
                    search: searchValue,
                    page: page,
                };

            global.url.pathname = url;
            document.title = title;
            history.pushState(state, title, global.url.toString());

            if (typeof ga !== "undefined") {
                ga("set", "page", url);
                ga("send", "pageview");
            }
        },

        // Sends request when the user has done a search
        doSearch: function() {
            jQuery(".js-projects-page").val(1);

            fn.storeLatestSearch();

            fn.getProjects();
            return false;
        },

        scrollToProjects: function() {
            var projectsPos = jQuery(".projects__items").offset().top,
                navHeight = jQuery(".nav").height();

            jQuery("html, body").animate(
                {
                    scrollTop: projectsPos - navHeight - 20,
                },
                2000
            );
        },

        // Set up page
        initListeners: function() {
            jQuery(window).on("orientationchange resize", jpi.helpers.debounce(fn.bottomAlignProjectFooters, 200));

            jQuery(".search-form").on("submit", fn.doSearch);

            jQuery("body").on("click", ".project__skill", function(e) {
                jpi.modal.close();
                e.preventDefault();
                fn.scrollToProjects();

                var skill = e.target.innerHTML;

                if (skill == jQuery(".search-form__input").val() && jQuery(".js-projects-page").val() == 1) {
                    return;
                }

                jQuery(".search-form__input").val(skill);
                fn.doSearch();
            });

            jQuery(".projects__pagination").on("click", ".pagination__item-link", function(e) {
                e.preventDefault();
                e.stopPropagation();

                var page = jQuery(this).attr("data-page");
                if (!page) {
                    page = 1;
                }

                if (fn.getCurrentPageNum() == page) {
                    return;
                }

                jQuery(".js-projects-page").val(page);

                fn.scrollToProjects();
                fn.storeLatestSearch();
                fn.getProjects();
            });

            jQuery(".projects__items").on("click", ".js-open-modal", fn.openProjectModal);

            window.addEventListener("popstate", function(e) {
                var state = e.state || {};
                var page = state.page || 1;

                document.title = fn.getNewTitle(page);

                jQuery(".js-projects-page").val(page);
                jQuery(".search-form__input").val(state.search || "");

                fn.scrollToProjects();
                fn.getProjects();
            });

            jQuery(global.modalSelector).on("closed", fn.onProjectModalClose);
        },

        init: function() {
            global.dateFormat = new Intl.DateTimeFormat(undefined, {month: "long", year: "numeric"});

            if (jQuery(".js-all-projects").length) {
                global.typeColourRegex = new RegExp("project__type--[\\w-]*", "g");

                fn.initListeners();
                fn.getProjects();
            }
        },
    };

    jQuery(window).on("jpi-css-loaded", fn.init);

    return {
        formatProjectData: fn.formatProjectData,
    };

})(jQuery, jpi);
