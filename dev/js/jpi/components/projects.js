;new (function() {
    "use strict";

    var projects = this;

    this.url = new URL(window.location);

    this.$body = jQuery("body");

    this.$projectType = jQuery(".js-project-type");

    this.$loading = jQuery(".projects__loading");
    this.$paginationStatus = jQuery(".projects__pagination-status");
    this.$error = jQuery(".projects__error");
    this.$projects = jQuery(".projects__items");
    this.$pagination = jQuery(".projects__pagination");

    this.modalSelector = ".detailed-project";

    this.$modal = jQuery(this.modalSelector);
    this.modal = new JPI.modal(this.$modal);
    this.$modalSlidesContainer = this.$modal.find(".slide-show__slides");
    this.modalSlideShow = new JPI.SlideShow({
        selector: "#detailed-project-slide-show",
    });

    this.page = JPI.getInt(jQuery(".js-page").val(), 1);

    this.projectTemplate = jQuery("#project-template").text();
    this.slideTemplate = jQuery("#slide-template").text();
    this.bulletTemplate = jQuery("#slide-bullet-template").text();

    this.projects = {};

    this.renderError = function(error) {
        this.$error.text(error).show();
        this.$pagination.text("").hide();
        this.$projects.hide();
        this.$loading.hide();
    };

    this.renderPaginationItem = function(page, $container, isCurrent) {
        var url = new URL(window.location);

        if (page > 1) {
            url.searchParams.set("page", page);
        } else {
            url.searchParams.delete("page");
        }

        var classes = ["pagination__link"];
        if (isCurrent) {
            classes.push("pagination__link--active");
        }
        var $link = JPI.createElement("a", {
            class: classes.join(" "),
            text: page,
            href: url.toString(),
        });

        JPI.renderNewElement("li", $container, {
            class: "pagination__item",
            html: $link,
        });
    };

    // Adds pagination buttons/elements to the page
    this.renderPagination = function(totalProjects) {
        if (totalProjects > JPI.projects.perPage) {
            var currentPage = this.page;

            var totalPages = Math.ceil(totalProjects / JPI.projects.perPage);
            for (var page = 1; page <= totalPages; page++) {
                var isCurrent = page === currentPage;
                this.renderPaginationItem(page, this.$pagination, isCurrent);
            }

            this.$pagination.css("display", "inline-block");
        }
    };

    this.renderProjectTags = function(project, containerSelector) {
        var $tags = jQuery(containerSelector).find(".project__tags");
        if (!$tags.length) {
            return;
        }

        var tags = project.tags;
        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i].trim();

            if (tag === "") {
                continue;
            }

            JPI.renderNewElement("span", $tags, {
                text: tag,
                class: "project__tag",
            });
        }
    };

    this.renderProjectLinks = function(project, containerSelector) {
        var $links = jQuery(containerSelector).find(".project__links");

        if (!project.url && !project.download_url && !project.github_url) {
            if (containerSelector !== this.modalSelector) {
                $links.remove();
            }
            return;
        }

        var defaultAttributes = {
            target: "_blank",
            rel: "noopener",
            classes: ["project__link"],
        };

        defaultAttributes.class = defaultAttributes.classes.join(" ");
        delete defaultAttributes.classes;

        if (project.url) {
            defaultAttributes.href = project.url;
            defaultAttributes.title = "Link to " + project.name;
            defaultAttributes.html = "<i class='fas fa-link fa-2x'></i>";
            JPI.renderNewElement("a", $links, defaultAttributes);
        }

        if (project.download_url) {
            defaultAttributes.href = project.download_url;
            defaultAttributes.title = "Link to download " + project.name;
            defaultAttributes.html = "<i class='fas fa-download fa-2x'></i>";
            JPI.renderNewElement("a", $links, defaultAttributes);
        }

        if (project.github_url) {
            defaultAttributes.href = project.github_url;
            defaultAttributes.title = "Link to " + project.name + " code on GitHub";
            defaultAttributes.html = "<i class='fab fa-github fa-2x'></i>";
            JPI.renderNewElement("a", $links, defaultAttributes);
        }
    };

    this.renderProjectImages = function(project, containerSelector) {
        if (!project.images || !project.images.length) {
            return;
        }

        var $slideShow = jQuery(containerSelector).find(".slide-show");
        var $slidesContainer = $slideShow.find(".slide-show__slides");
        var $slideShowBullets = $slideShow.find(".slide-show__bullets");

        // Loop through each image in project
        var images = project.images;
        for (var i = 0; i < images.length; i++) {
            if (!{}.hasOwnProperty.call(images, i)) {
                continue;
            }

            var slideTemplate = new JPI.Template(this.slideTemplate);
            var bulletTemplate = new JPI.Template(this.bulletTemplate);

            var image = images[i];
            for (var field in image) {
                if ({}.hasOwnProperty.call(image, field)) {
                    var value = image[field];
                    slideTemplate.replace(field, value);
                    bulletTemplate.replace(field, value);
                }
            }

            slideTemplate.renderIn($slidesContainer);
            bulletTemplate.renderIn($slideShowBullets);
        }
    };

    this.renderProject = function(project) {
        var projectSelector = "#project-" + project.id;
        if (jQuery(projectSelector).length) {
            return;
        }

        project = JPI.api.formatProjectData(project);

        this.projects[project.id] = project;

        new JPI.Template(this.projectTemplate, project).renderIn(this.$projects);

        this.renderProjectImages(project, projectSelector);
        this.renderProjectLinks(project, projectSelector);
    };

    // Sets up events when projects were received
    this.gotProjects = function(response) {
        this.$error.text("").hide();
        this.$projects.text("").show();
        this.$pagination.text("").hide();
        this.$loading.hide();

        // Send the data, the function to do if data is valid
        JPI.ajax.renderRowsOrError(
            response,
            this.renderProject.bind(this),
            this.renderError.bind(this),
            "No Projects Found."
        );

        this.renderPagination(JPI.getInt(response._total_count));

        var paginationStatus = this.$paginationStatus.attr("data-format");

        paginationStatus = paginationStatus.replace("{start}", (response._total_count ? 1 : 0) + (this.page - 1) * JPI.projects.perPage);
        paginationStatus = paginationStatus.replace("{end}", (this.page - 1) * JPI.projects.perPage + response.data.length);
        paginationStatus = paginationStatus.replace("{total}", response._total_count);

        this.$paginationStatus.html(paginationStatus);
    };

    this.getProjects = function() {
        var query = {
            filters: {},
            page: this.page,
            limit: JPI.projects.perPage,
        };

        if (this.$projectType.val()) {
            query.filters.type_id = this.$projectType.val();
        }

        JPI.ajax.request({
            method: "GET",
            url: JPI.projects.apiEndpoint + "/projects/",
            data: query,
            onSuccess: this.gotProjects.bind(this),
            onError: this.renderError.bind(this),
        });
    };

    this.openProjectModal = function(e) {
        var projectId = jQuery(e.target).attr("data-project-id");
        var project = this.projects[projectId];
        var $modal = this.$modal;

        $modal.find(".project__links, .project__tags, .slide-show__slides, .slide-show__bullets").text("");

        $modal.find(".modal__heading").text(project.name);
        $modal.find(".project__date").text(project.date);
        $modal.find(".project__description").html(project.long_description);
        $modal.find(".project__type").text(project.type);

        this.renderProjectTags(project, this.modalSelector);
        this.renderProjectLinks(project, this.modalSelector);
        this.renderProjectImages(project, this.modalSelector);

        this.modal.open();

        this.modalSlideShow.start();
    };

    this.onProjectModalClose = function() {
        this.modalSlideShow.stop();
        this.$modalSlidesContainer.css({
            width: "",
            left: "",
        });
    };

    this.storeLatestSearch = function() {
        if (this.page > 1) {
            this.url.searchParams.set("page", this.page);
        } else {
            projects.url.searchParams.delete("page");
        }

        var state = {
            page: this.page,
            type: this.$projectType.val(),
        };

        history.pushState(state, window.title, this.url.toString());

        if (typeof ga !== "undefined") {
            ga("set", "page", url);
            ga("send", "pageview");
        }
    };

    this.scrollToProjects = function() {
        JPI.scrollTo(this.$projects, 20);
    };

    this.initListeners = function() {
        this.$projectType.on("change", function(e) {
            projects.page = 1;

            if (jQuery(this).val()) {
                projects.url.searchParams.set("type", jQuery(this).find("option:selected").attr("data-urlname"));
            } else {
                projects.url.searchParams.delete("type");
            }

            projects.storeLatestSearch();
            projects.getProjects();
        });

        this.$projects.on("click", ".project__read-more", this.openProjectModal.bind(this));

        this.$modal.on("closed", this.onProjectModalClose.bind(this));

        this.$pagination.on("click", ".pagination__link", function(e) {
            e.preventDefault();
            e.stopPropagation();

            var page = jQuery(e.target).text();
            page = JPI.getInt(page, 1);

            if (projects.page === page) {
                return;
            }

            projects.page = page;
            projects.scrollToProjects();
            projects.storeLatestSearch();
            projects.getProjects();
        });

        window.addEventListener("popstate", function(e) {
            var state = e.state || {};

            var page = state.page || 1;
            var type = state.type || "";

            projects.page = JPI.getInt(page, 1);
            projects.$projectType.val(type);

            projects.scrollToProjects();

            projects.getProjects();
        });
    };

    this.init = function() {
        this.initListeners();

        this.gotProjects(JPI.projects.apiResponse);

        this.$body.on("click", ".js-expandable-image", function(e) {
            var expandedSlideShow = new JPI.ExpandedSlideShow();
            expandedSlideShow.open(e.target, ".js-expandable-image-group");
        });
    };

    jQuery(window).on("jpi-css-loaded", this.init.bind(this));
})();
