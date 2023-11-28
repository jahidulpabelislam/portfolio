;JPI.api = (function() {
    "use strict";

    var dateFormat = new Intl.DateTimeFormat("default", {
        month: "long",
        year: "numeric",
    });

    // Helper function to format Project data from the API to the necessary format for the Website
    var formatProjectData = function(project) {
        if (project.date) {
            var date = new Date(project.date);
            project.date = dateFormat.format(date);
        }

        return project;
    };

    return {
        formatProjectData: formatProjectData,
    };
})();
