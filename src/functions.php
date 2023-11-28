<?php

declare(strict_types=1);

use App\File;
use App\Page;
use App\Site;

function site(): Site {
    return Site::get();
}

function page(): Page {
    return Page::get();
}

function load(string $path, bool $isRelative = true): File {
    return new File($path, $isRelative);
}

function getTimeDifference(
    DateTime|string $fromDate,
    DateTime|string $toDate,
    ?string $format = null
): DateInterval|string {
    if (is_string($fromDate)) {
        $fromDate = new DateTime($fromDate);
    }
    if (is_string($toDate)) {
        $toDate = new DateTime($toDate);
    }

    if (!$fromDate instanceof DateTime || !$toDate instanceof DateTime) {
        return "";
    }

    // Work out the time difference from both dates
    $diff = $fromDate->diff($toDate);

    // Get the formatted value of the difference if requested
    if ($format) {
        $diff = $diff->format($format);
    }

    return $diff;
}

/**
 * Echo out the contents of a file
 *
 * @param $path string
 * @param $isRelative bool
 */
function renderFile(string $path, bool $isRelative = true): void {
    load($path, $isRelative)->render();
}
