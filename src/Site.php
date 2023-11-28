<?php

declare(strict_types=1);

/**
 * A helper class to use throughout the site.
 * To aid in including global/common files, content & configurations.
 */

namespace App;

use JPI\MeInterface;
use JPI\MeTrait;
use JPI\Site as BaseSite;
use JPI\Utils\Singleton;
use JPI\Utils\URL;

class Site extends BaseSite implements MeInterface {

    use Singleton;
    use MeTrait;

    public const LIVE_DOMAIN = "jahidulpabelislam.com";

    public function getLiveDomain(): string {
        return self::LIVE_DOMAIN;
    }

    /**
     * Generate and return an url from passed url
     * Depending on param values, return url can be a relative, full live or a full local url.
     *
     * @param $path string The relative url part/s to use to generate url from
     * @param $isFull bool Whether the url should be a full url
     * @param $isLive bool Whether the url should be a full live url
     * @return URL
     */
    public function makeURL(
        string $path,
        bool $isFull = false,
        bool $isLive = false
    ): URL {
        $url = parent::makeURL($path, $isFull && !$isLive);

        if ($isFull && $isLive) {
            $url->setScheme("https");
            $url->setHost($this->getLiveDomain());
        }

        return $url;
    }

    /**
     * @return URL Generate and return the URL of current requested page/URL
     */
    public function getCurrentURL(bool $isFull = false, bool $isLive = false): URL {
        $url = parent::getCurrentURL($isFull && !$isLive);

        if ($isFull && $isLive) {
            $url->setScheme("https");
            $url->setHost($this->getLiveDomain());
        }

        return $url;
    }

    public static function getLinkToURL(string $service): URL {
        $url = new URL(LINK_TO_URL);
        $url->addPath("/$service/");
        return $url;
    }

    public function getLinksUrl(): string {
        return LINKS_URL;
    }

    public static function getAPIEndpoint(string $entity = ""): URL {
        $url = new URL(JPI_API_ENDPOINT);
        $url->addPath("v" . JPI_API_VERSION);
        $url->addPath($entity);
        return $url;
    }

    public function processFormSubmission(): void {
        // Get the data from request
        $data = [];
        foreach ($_POST as $key => $value) {
            $data[$key] = trim(
                stripslashes(
                    strip_tags(
                        urldecode(
                            filter_input(INPUT_POST, $key, FILTER_SANITIZE_STRING)
                        )
                    )
                )
            );
        }

        // The email user provided to reply to
        $emailAddress = $data["emailAddress"] ?? "";

        // The message the user is trying to send
        $message = $data["message"] ?? "";

        // The subject of the message the user is trying to send
        $subject = $data["subject"] ?? "";

        // Default to as everything is okay
        $meta["ok"] = true;

        if ($message === "") {
            $meta["ok"] = false;
            $meta["messageFeedback"] = "Message isn't provided.";
        }

        if ($emailAddress === "") {
            $meta["ok"] = false;
            $meta["emailAddressFeedback"] = "Email Address isn't provided.";
        } // Checks if email provided is valid using REGEX
        else if (!preg_match("/\b[\w._-]+@[\w-]+.[\w]{2,}\b/im", $emailAddress)) {
            $meta["ok"] = false;
            $meta["emailAddressFeedback"] = "Email Address isn't valid.";
        }

        if ($meta["ok"]) {
            // If user didn't provide subject create a default one
            if ($subject === "") {
                $subject = "Site Contact Form";
            }

            // Creates the headers for sending email
            $headers = "From: contact@jahidulpabelislam.com\r\nReply-To:$emailAddress";

            // The address to send mail to
            $to = "contact@jahidulpabelislam.com";

            // Try to send the email, check it was sent
            if (mail($to, $subject, $message, $headers)) {
                $meta["feedback"] = "Your message has been sent.";
            } // Something went wrong
            else {
                $meta["ok"] = false;
                $meta["feedback"] = "Something went wrong, please try again.";
            }
        }
        $meta["status"] = $status = $meta["ok"] ? 200 : 500;
        $meta["message"] = $message = $meta["ok"] ? "OK" : "Internal Server Error";

        $meta["data"] = $data;

        header("HTTP/1.1 $status $message");

        // Send the response, by json
        header("Content-Type: application/json");
        echo json_encode($meta);
    }
}
