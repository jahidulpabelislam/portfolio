<?php
include_once($_SERVER["DOCUMENT_ROOT"] . "/../bootstrap.php");

$site = site();
$page = page();

$name = $site::NAME;
$job = $site::JOB;

$page->renderHtmlStart();
$page->renderHead([
    "title" => "Privacy Policy",
    "hdescription" => "Privacy policy for the site of $name, a $job based at Bognor Regis, West Sussex down by the South Coast of England.",
]);
$page->renderBodyStart();
$page->renderPageStart();
$page->renderNav();
$page->renderHeader([
    "title" => "Privacy Policy",
]);
$page->renderContentStart();
?>

<div class="row row--alt">
    <div class="container">
        <h3 class="row__heading">Contact Form</h3>
        <p>The following applies to the contact form and your data submitted within the form:</p>
        <ul>
            <li>your data, WILL ONLY be kept in my email server</li>
            <li>your data, WILL NOT be given to any third party companies</li>
            <li>your email WILL BE deleted after the discussion is finished or viewed</li>
        </ul>
    </div>
</div>

<?php
$page->renderSimilarLinks([
    "links" => [
        [
            "title" => "Portfolio",
            "url" => "/portfolio/",
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
$page->renderCookieModal();
$page->renderBodyEnd();
$page->renderHtmlEnd();
