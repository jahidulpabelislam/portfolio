<?php
include_once($_SERVER["DOCUMENT_ROOT"] . "/../bootstrap.php");

$site = site();
$page = page();

$name = $site::NAME;
$job = $site::JOB;

$error = $_SERVER["REDIRECT_STATUS"] ?? "404";

$errorDescriptions = [
    "401" => "Unauthorized",
    "403" => "Forbidden Page",
    "404" => "Page Not Found",
    "500" => "Internal Server Error",
];
$errorDescription = $errorDescriptions[$error];

$headDescription = "Error: $error - $errorDescription message on the site of $name, a $job based at Bognor Regis, West Sussex down by the South Coast of England.";

$page->id = $error;
$pageData = [
    "indexed" => false,
    "currentURL" => $site->makeURL("/$error/"),
];
$page->addPageData($pageData);

$page->renderHtmlStart();
$page->renderHead([
    "title" => "$error - $errorDescription",
]);
$page->renderBodyStart();
$page->renderPageStart();
$page->renderNav();
$page->renderHeader([
    "title" => $error,
    "description" => $errorDescription,
]);
$page->renderContentStart();

$leftSideCopies = [
    "401" => "<img class='row__column-image' src='" . $site::asset("/assets/images/no-entry.png") . "' alt='No entry sign' />",
    "403" => "<img class='row__column-image' src='" . $site::asset("/assets/images/no-entry.png") . "' alt='No entry sign' />",
    "404" => "<img class='row__column-image' src='" . $site::asset("/assets/images/404.jpg") . "' alt='Missing page image' />",
    "500" => "<img class='row__column-image' src='" . $site::asset("/assets/images/oops.png") . "' alt='Road sign with the words oops' />",
];

$leftSideCopy = $leftSideCopies[$error];

$rightSideCopies = [
    "401" => "<p>The requested page needs authorization. You either supplied the wrong credentials or your browser can't supply the necessary credentials.</p>",
    "403" => "<p>Access to the requested page is strictly forbidden.</p>",
    "404" => "<p>The requested page can not be found.</p>
            <p>Please consider going back to the previous page or try retyping the URL.</p>",
    "500" => "<p>The server couldn't follow your request so can't display the content.</p>
            <p>You can either try refreshing the page or try again later.</p>
            <p>If not it's not you, nor me, it's the SysAdmin guy...(Me)</p>"
];

$rightSideCopy = $rightSideCopies[$error];
?>

<div class="row row--halves row--alt">
    <div class="container">
        <div class="row__column">
            <?php echo $leftSideCopy; ?>
        </div>
        <div class="row__column">
            <?php echo $rightSideCopy; ?>
        </div>
    </div>
</div>

<?php
$page->renderSimilarLinks([
    "links" => [
        [
            "title" => "Projects",
            "url" => "/projects/",
            "text" => "View My Work",
        ],
        [
            "title" => "Contact",
            "url" => "/contact/",
            "text" => "Get in Touch",
        ],
    ],
]);
$page->renderSocialLinks();
$page->renderContentEnd();
$page->renderFooter();
$page->renderPageEnd();
$page->renderBodyEnd();
$page->renderCookieModal();
$page->renderHtmlEnd();
