<?php

const JPI_API_VERSION = "4";

$environment = site()->getEnvironment();
if ($environment === "development") {
    if (!defined("LINK_TO_URL")) {
        define("LINK_TO_URL", "http://linkto.local");
    }

    if (!defined("LINKS_URL")) {
        define("LINKS_URL", "http://links.local");
    }

    if (!defined("JPI_API_ENDPOINT")) {
        define("JPI_API_ENDPOINT", "http://portfolio-api.local");
    }
}
else if ($environment === "staging") {
    if (!defined("LINK_TO_URL")) {
        define("LINK_TO_URL", "https://staging.linkto.jahidulpabelislam.com/");
    }

    if (!defined("LINKS_URL")) {
        define("LINKS_URL", "https://staging.links.jahidulpabelislam.com/");
    }

    if (!defined("JPI_API_ENDPOINT")) {
        define("JPI_API_ENDPOINT", "https://staging.api.jahidulpabelislam.com");
    }
} else {
    if (!defined("LINK_TO_URL")) {
        define("LINK_TO_URL", "https://linkto.jahidulpabelislam.com/");
    }

    if (!defined("LINKS_URL")) {
        define("LINKS_URL", "https://links.jahidulpabelislam.com/");
    }

    if (!defined("JPI_API_ENDPOINT")) {
        define("JPI_API_ENDPOINT", "https://api.jahidulpabelislam.com");
    }
}
