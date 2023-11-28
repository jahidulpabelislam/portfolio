;new (function() {
    "use strict";

    var skills = this;

    this.$items = jQuery(".skill--expandable");
    this.$expandableContents = jQuery(".skill__description");
    this.$expandableIcons = jQuery(".skill__toggle");

    this.toggleContent = function(e) {
        var $item = jQuery(this);

        // Get the new item elems that was clicked
        var $selected = $item.find(".skill__description");
        var $selectedIcon = $item.find(".skill__toggle");

        // Reset all other item to closed
        skills.$expandableContents.not($selected).slideUp();
        skills.$expandableIcons
            .not($selectedIcon)
            .addClass("fa-plus")
            .removeClass("fa-minus")
        ;

        // Toggle the clicked item
        $selectedIcon.toggleClass("fa-plus");
        $selectedIcon.toggleClass("fa-minus");
        $selected.slideToggle();
    };

    this.$items.on("click", this.toggleContent);
})();
