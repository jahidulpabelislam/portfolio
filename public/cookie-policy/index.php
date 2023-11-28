<?php
include_once($_SERVER["DOCUMENT_ROOT"] . "/../bootstrap.php");

$site = site();
$page = page();

$name = $site::NAME;
$job = $site::JOB;

$page->renderHtmlStart();
$page->renderHead([
    "title" => "Cookie Policy",
    "hdescription" => "Cookie policy for the site of $name, a $job based at Bognor Regis, West Sussex down by the South Coast of England.",
]);
$page->renderBodyStart();
$page->renderPageStart();
$page->renderNav();
$page->renderHeader([
    "title" => "Cookie Policy",
]);
$page->renderContentStart();
?>

<div class="row">
    <div class="container">
        <h3 class="row__heading">Cookies</h3>
        <p>This website uses cookies to collect information. Cookies are files stored on your device when you come on a website which is using them. The data stored can be a whole range of data, user login session data to shopping basket.</p>
        <p>Cookies on this site is used to allow tracking user behaviour with the site, to use in analytics and improving the site.</p>
        <p>By viewing the site, it will be assumed you agree to use cookies within this site.</p>
    </div>
</div>
<div class="row row--alt">
    <div class="container">
        <h4 class="row__sub-heading">Cookies used:</h4>
        <table class="table">
            <tr class="table__row table__row--header">
                <th class="table__col table__col--header">Cookie Name</th>
                <th class="table__col table__col--header">Category</th>
                <th class="table__col table__col--header">Type</th>
                <th class="table__col table__col--header">Domain</th>
                <th class="table__col table__col--header">Expiration Time</th>
                <th class="table__col table__col--header">Description</th>
            </tr>
            <tr class="table__row">
                <td class="table__col">_ga</td>
                <td class="table__col">Performance</td>
                <td class="table__col">First party</td>
                <td class="table__col">.jahidulpabelislam.com</td>
                <td class="table__col">2 years</td>
                <td class="table__col">Used to distinguish unique users</td>
            </tr>
            <tr class="table__row">
                <td class="table__col">_gat</td>
                <td class="table__col">todo</td>
                <td class="table__col">First party</td>
                <td class="table__col">.jahidulpabelislam.com</td>
                <td class="table__col">10 minutes</td>
                <td class="table__col">Used to throttle request rate</td>
            </tr>
            <tr class="table__row">
                <td class="table__col">cookie-modal-closed</td>
                <td class="table__col">Strictly necessary</td>
                <td class="table__col">First party</td>
                <td class="table__col">jahidulpabelislam.com</td>
                <td class="table__col">30 days</td>
                <td class="table__col">Used to make sure the modal isn't shown if closed already</td>
            </tr>
        </table>
        <p>The cookies used and the Google Analytics data stored will be anonymised and can't be used to identify individuals.</p>
        <p>
            To stop cookies you will need to go to your browser settings, for more information on this as well as general/more information on cookies can be found at
            <a class="link" href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer">allaboutcookies</a>.
        </p>
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
