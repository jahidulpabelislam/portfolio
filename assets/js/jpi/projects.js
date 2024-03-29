;/**
 * Holds all the functions needed for the projects page
 * e.g. display projects
 */
window.jpi = window.jpi || {};
window.jpi.projects = (function(jQuery, jpi) {

    "use strict";

    var Template = jpi.Template;

    var global = {
        url: null,
        titleStart: "Projects",
        titleEnd: " | Jahidul Pabel Islam - Full Stack Developer",

        htmlElem: null,
        body: null,

        nav: null,

        loading: null,
        errorElem: null,
        projectsElem: null,
        pagination: null,

        modalSelector: ".detailed-project",
        modal: null,
        modalSlidesContainer: null,

        searchInput: null,
        pageNumber: 1,

        slideTemplate: "",
        bulletTemplate: "",

        projects: {},

        dateFormat: false,
    };

    var fn = {

        bottomAlignProjectFooters: function() {
            var projects = jQuery(".project");
            var numOfProjects = projects.length;
            if (!numOfProjects) {
                return;
            }

            jQuery(".project .project__description").css("min-height", "");

            if (window.innerWidth < jpi.css.tabletWidth) {
                return;
            }

            projects.each(function(i, projectElem) {
                var project = jQuery(projectElem);
                var height = project.height();

                var projectDescription = project.children(".project__description");

                var otherElems = project.children().not(projectDescription);
                var totalAllHeight = 0;
                otherElems.each(function(j, elem) {
                    totalAllHeight += jQuery(elem).outerHeight(true);
                });

                // Expand the description element to fit remaining space
                var maxHeight = projectDescription.outerHeight(true);
                var innerHeight = projectDescription.height();
                var padding = maxHeight - innerHeight;

                var newHeight = height - totalAllHeight - padding;
                projectDescription.css("min-height", newHeight);
            });
        },

        // Helper function to format Project data from the API to the necessary format for the Website
        formatProjectData: function(project) {
            if (project.date) {
                var date = new Date(project.date);
                project.date = global.dateFormat.format(date);
            }

            // Make sure colour placeholders are replaced in content
            var fields = ["short_description", "long_description"];
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if ({}.hasOwnProperty.call(project, field)) {
                    project[field] = (new Template(project[field])).replace("colour", project.colour);
                }
            }

            return project;
        },

        renderError: function(error) {
            global.errorElem.text(error).show(600);
            global.pagination.text("").hide(600);
            global.loading.hide(600);
        },

        renderPaginationItem: function(page, containerElem, isCurrent) {
            var url = fn.getNewURL(page);
            url += global.url.search;

            var classes = ["pagination__link"];
            if (isCurrent) {
                classes.push("pagination__link--active");
            }
            var link = jpi.helpers.createElement("a", {
                "class": classes.join(" "),
                "text": page,
                "data-page": page,
                "href": url,
            });

            jpi.helpers.renderNewElement("li", containerElem, {
                class: "pagination__item",
                html: link,
            });
        },

        // Adds pagination buttons/elements to the page
        renderPagination: function(totalProjects) {
            totalProjects = jpi.helpers.getInt(totalProjects);
            if (totalProjects > jpi.config.projectsPerPage) {
                var paginationElem = global.pagination;

                var currentPage = global.pageNumber;

                var totalPages = Math.ceil(totalProjects / jpi.config.projectsPerPage);

                for (var page = 1; page <= totalPages; page++) {
                    var isCurrent = page === currentPage;
                    fn.renderPaginationItem(page, paginationElem, isCurrent);
                }

                paginationElem.css("display", "inline-block");
            }
        },

        renderProjectTags: function(project, containerSelector) {
            var tags = project.tags;

            var tagsContainer = jQuery(containerSelector).find(".project__tags");
            if (!tagsContainer.length) {
                return;
            }

            var search = global.searchInput.val().trim().toLowerCase();
            var searches = search.split(" ");

            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i].trim();

                if (tag === "") {
                    continue;
                }

                var lowerCasedTag = tag.toLowerCase();

                var isInSearch = false;
                for (var j = 0; j < searches.length; j++) {
                    if (searches[j].trim() !== "" && lowerCasedTag.includes(searches[j])) {
                        isInSearch = true;
                        break;
                    }
                }

                var classes = ["project__tag"];
                if (project.colour) {
                    classes.push("project__tag--" + project.colour);
                }
                if (isInSearch) {
                    classes.push("project__tag--searched");
                }

                jpi.helpers.renderNewElement("a", tagsContainer, {
                    text: tag,
                    class: classes.join(" "),
                    href: "/projects/" + tag + "/",
                });
            }
        },

        renderProjectLinks: function(project, containerSelector) {
            var linksContainer = jQuery(containerSelector).find(".project__links");

            if (!project.url && !project.download_url && !project.github_url) {
                if (containerSelector !== global.modalSelector) {
                    linksContainer.remove();
                }
                return;
            }

            var defaultAttributes = {
                target: "_blank",
                rel: "noopener",
                classes: ["project__link"],
            };
            if (project.colour) {
                defaultAttributes.classes.push("project__link--" + project.colour);
            }

            defaultAttributes.class = defaultAttributes.classes.join(" ");
            delete defaultAttributes.classes;

            if (project.url) {
                defaultAttributes.href = project.url;
                defaultAttributes.title = "Link to " + project.name;
                defaultAttributes.html = "<i class='fas fa-link fa-2x'></i>";
                jpi.helpers.renderNewElement("a", linksContainer, defaultAttributes);
            }

            if (project.download_url) {
                defaultAttributes.href = project.download_url;
                defaultAttributes.title = "Link to download " + project.name;
                defaultAttributes.html = "<i class='fas fa-download fa-2x'></i>";
                jpi.helpers.renderNewElement("a", linksContainer, defaultAttributes);
            }

            if (project.github_url) {
                defaultAttributes.href = project.github_url;
                defaultAttributes.title = "Link to " + project.name + " code on GitHub";
                defaultAttributes.html = "<i class='fab fa-github fa-2x'></i>";
                jpi.helpers.renderNewElement("a", linksContainer, defaultAttributes);
            }
        },

        renderProjectImages: function(project, containerSelector) {
            var slideShow = jQuery(containerSelector).find(".slide-show");
            var slideShowId = "#" + slideShow.attr("id");

            if (!project.images || !project.images.length) {
                if (containerSelector !== global.modalSelector) {
                    slideShow.remove();
                }
                return;
            }

            var slidesContainer = slideShow.find(".slide-show__slides");
            var slideShowBullets = slideShow.find(".slide-show__bullets");

            // Loop through each image in project
            var images = project.images;
            for (var i = 0; i < images.length; i++) {
                if (!{}.hasOwnProperty.call(images, i)) {
                    continue;
                }

                var slideTemplate = new Template(global.slideTemplate);
                var bulletTemplate = new Template(global.bulletTemplate);

                var image = images[i];
                for (var field in image) {
                    if ({}.hasOwnProperty.call(image, field)) {
                        var value = image[field];
                        slideTemplate.replace(field, value);
                        bulletTemplate.replace(field, value);
                    }
                }

                slideTemplate.replace("colour", project.colour);
                slideTemplate.renderIn(slidesContainer);

                bulletTemplate.replace("colour", project.colour);
                bulletTemplate.replace("slideShowId", slideShowId);
                bulletTemplate.renderIn(slideShowBullets);
            }

            jpi.slideShow.start(slideShowId);
        },

        renderProject: function(project) {
            var projectSelector = "#project-" + project.id;
            if (jQuery(projectSelector).length) {
                return;
            }

            project = fn.formatProjectData(project);

            global.projects[project.id] = project;

            (new Template(global.projectTemplate, project)).renderIn(global.projectsElem);

            fn.renderProjectImages(project, projectSelector);
            fn.renderProjectLinks(project, projectSelector);
        },

        // Sets up events when projects were received
        gotProjects: function(response) {
            jpi.slideShow.pauseAll();

            global.errorElem.text("").hide(600);
            global.loading.hide(600);
            global.projectsElem.text("");
            global.pagination.text("").hide();

            // Send the data, the function to do if data is valid
            jpi.ajax.renderRowsOrError(
                response,
                fn.renderProject,
                fn.renderError,
                "No Projects Found."
            );

            if (response && response._total_count) {
                fn.renderPagination(response._total_count);
            }

            fn.bottomAlignProjectFooters();
        },

        getProjects: function() {
            var query = {
                page: global.pageNumber,
                search: global.searchInput.val(),
                limit: jpi.config.projectsPerPage,
            };

            jpi.ajax.request({
                method: "GET",
                url: jpi.config.jpiAPIEndpoint + "/projects/",
                data: query,
                onSuccess: fn.gotProjects,
                onError: fn.renderError,
            });
        },

        openProjectModal: function(e) {
            var projectId = jQuery(e.target).attr("data-project-id");
            var project = global.projects[projectId];
            var modal = global.modal;

            modal.find(".project__links, .project__tags, .slide-show__slides, .slide-show__bullets").text("");

            modal.find(".modal__heading").text(project.name);
            modal.find(".project__date").text(project.date);
            modal.find(".project__description").html(project.long_description);

            var projectTypeElem = modal.find(".project__type");

            projectTypeElem.text(project.type);

            var classList = projectTypeElem.attr("class");
            classList = classList.replace(global.typeColourRegex, "project__type--" + project.colour);
            projectTypeElem.attr("class", classList);

            fn.renderProjectTags(project, global.modalSelector);
            fn.renderProjectLinks(project, global.modalSelector);
            fn.renderProjectImages(project, global.modalSelector);

            modal.find(".slide-show__nav").attr("data-colour", project.colour);

            jpi.modal.open(modal);
            jpi.slideShow.start("#detailed-project-slide-show");
        },

        onProjectModalClose: function() {
            jpi.slideShow.stop("#detailed-project-slide-show");
            global.modalSlidesContainer.css({
                width: "",
                left: "",
            });
        },

        getNewURL: function(page) {
            var urlParts = ["projects"];

            var search = global.searchInput.val();
            if (search.trim() !== "") {
                urlParts.push(search);
            }

            if (page > 1) {
                urlParts.push(page);
            }

            return  "/" + urlParts.join("/") + "/";
        },

        getNewTitle: function(page) {
            var title = global.titleStart;
            var search = global.searchInput.val();

            if (search.trim() !== "") {
                title += " with " + search;
            }

            if (page > 1) {
                title += " - Page " + page;
            }

            title += global.titleEnd;

            return title;
        },

        storeLatestSearch: function() {
            var search = global.searchInput.val();
            var page = global.pageNumber;
            var title = fn.getNewTitle(page);
            var url = fn.getNewURL(page);
            var state = {
                search: search,
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
            global.pageNumber = 1;
            fn.storeLatestSearch();
            fn.getProjects();
            return false;
        },

        scrollToProjects: function() {
            var projectsPos = global.projectsElem.offset().top;
            var navHeight = global.nav.height();

            global.htmlElem.animate({
                scrollTop: projectsPos - navHeight - 20,
            }, 2000);
        },

        initListeners: function() {
            jQuery(window).on("orientationchange resize", jpi.helpers.debounce(fn.bottomAlignProjectFooters, 200));

            jQuery(".search-form").on("submit", fn.doSearch);

            global.projectsElem.on("click", ".project__read-more", fn.openProjectModal);

            global.modal.on("closed", fn.onProjectModalClose);

            global.body.on("click", ".project__tag", function(e) {
                jpi.modal.close();
                e.preventDefault();
                fn.scrollToProjects();

                var tag = e.target.innerHTML;

                if (tag === global.searchInput.val() && global.pageNumber === 1) {
                    return;
                }

                global.searchInput.val(tag);
                fn.doSearch();
            });

            global.pagination.on("click", ".pagination__link", function(e) {
                e.preventDefault();
                e.stopPropagation();

                var page = jQuery(e.target).attr("data-page");
                page = jpi.helpers.getInt(page, 1);

                if (global.pageNumber === page) {
                    return;
                }

                global.pageNumber = page;
                fn.scrollToProjects();
                fn.storeLatestSearch();
                fn.getProjects();
            });

            window.addEventListener("popstate", function(e) {
                var state = e.state || {};
                var page = state.page || 1;

                document.title = fn.getNewTitle(page);

                global.pageNumber = jpi.helpers.getInt(page, 1);
                global.searchInput.val(state.search || "");

                fn.scrollToProjects();
                fn.getProjects();
            });
        },

        init: function() {
            global.dateFormat = new Intl.DateTimeFormat("default", {
                month: "long",
                year: "numeric",
            });

            global.projectsElem = jQuery(".projects__items");
            if (!global.projectsElem.length) {
                return;
            }

            global.url = new URL(window.location);

            global.htmlElem = jQuery("html, body");
            global.body = jQuery("body");

            global.nav = jQuery(".nav");

            global.loading = jQuery(".projects__loading");
            global.errorElem = jQuery(".projects__error");
            global.searchInput = jQuery(".search-form__input");
            global.pagination = jQuery(".pagination");

            global.modal = jQuery(global.modalSelector);
            global.modalSlidesContainer = global.modal.find(".slide-show__slides");

            global.pageNumber = jpi.helpers.getInt(jQuery(".js-page").val(), 1);

            global.projectTemplate = jQuery("#project-template").text();
            global.slideTemplate = jQuery("#slide-template").text();
            global.bulletTemplate = jQuery("#slide-bullet-template").text();

            global.typeColourRegex = /project__type--[\w-]*/g;

            var state = {
                search: global.searchInput.val(),
                page: global.pageNumber,
            };

            history.replaceState(state, document.title);

            fn.initListeners();
            fn.getProjects();
        },
    };

    jQuery(window).on("jpi-css-loaded", fn.init);

    return {
        formatProjectData: fn.formatProjectData,
    };

})(jQuery, jpi);
