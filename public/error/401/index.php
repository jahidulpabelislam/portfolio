<?php
include_once($_SERVER["DOCUMENT_ROOT"] . "/../bootstrap.php");

$site = Site::get();
$page = Page::get();

$name = $site::NAME;
$job = $site::JOB;

$error = basename(__DIR__);
$errorDescription = "Unauthorized";
$headDescription = "Error: {$error} - Unauthorized message on the portfolio of $name, a $job based at Bognor Regis, West Sussex down by the South Coast of England.";

$pageData = [
    "headTitle" => "{$error} - {$errorDescription}",
    "headDescription" => $headDescription,
    "headerTitle" => $error,
    "headerDescription" => $errorDescription,
];
$page->addPageData($pageData);

$page->renderHtmlStart();
$page->renderHead();
$page->renderPageStart();
$page->renderNav();
$page->renderHeader();
$page->renderContentStart();
?>

<div class="row row--halves row--grey">
    <div class="container">
        <div class="row__column">
            <img class="row__column-image" src="<?php echo $site::asset("/assets/images/no-entry.png"); ?>" alt="No entry sign" />
        </div>
        <div>
            <p>The requested page needs authorization. You either supplied the wrong credentials or your browser can't supply the necessary credentials.</p>
        </div>
    </div>
</div>

<?php
$similarLinks = [
    [
        "title" => "Projects",
        "url" => "projects",
        "text" => "View My Work",
        "colour" => "dark-blue",
    ],
    [
        "title" => "Contact",
        "url" => "contact",
        "text" => "Get in Touch",
        "colour" => "dark-blue",
    ],
];
$page->similarLinks = $similarLinks;
$page->renderSimilarLinks();
$page->renderSocialLinks();
$page->renderContentEnd();
$page->renderFooter();
$page->renderCookieBanner();
$page->renderPageEnd();
$page->renderHtmlEnd();