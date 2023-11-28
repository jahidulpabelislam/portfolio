;// Handles all the general JS templating stuff - for use out of Template class as well
JPI.templating = new (function() {
    "use strict";

    this.moustaches = {};

    // Get a ReEx of a 'moustache' for the field to replace (e.g. `{{ fieldName }}` or `{{fieldName}}`)
    this.getMoustache = function(field) {
        if (!this.moustaches[field]) {
            this.moustaches[field] = new RegExp("{{2} ?" + field + " ?}{2}", "g");
        }

        return this.moustaches[field];
    };

    return {
        getMoustache: this.getMoustache.bind(this),
    };
})();

// A Template 'class' that holds all necessary logic to load a template, replace/process with data and render
JPI.Template = (function() {
    "use strict";

    return function(template, context) {
        this.context = context || {};

        this.replace = function(field, value) {
            var type = typeof value;

            if (type === "string" || type === "number") {
                var moustache = JPI.templating.getMoustache(field);
                template = template.replace(moustache, value);
            }
            else if (type === "object") {
                for (var innerField in value) {
                    if ({}.hasOwnProperty.call(value, innerField)) {
                        var innerKey = field ? field + "." + innerField : innerField;
                        template = this.replace(innerKey, value[innerField]);
                    }
                }
            }

            return template;
        };

        this.process = function(data) {
            if (data) {
                this.replace(null, data);
            }
        };

        this.get = function() {
            this.process(context);
            return template;
        };

        this.renderIn = function(parentElem) {
            parentElem.append(this.get());
        };
    };
})();
