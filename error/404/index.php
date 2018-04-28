<?php

//title of page to use
$title = "404";

//the description to use for page
$description = "Error: 404 - Page Not Found message on the portfolio of Jahidul Pabel Islam, a Full Stack Web & Software Developer in Bognor Regis, West Sussex Down by the South Coast of England.";

$description2 = "Page Not Found";

//the keywords to use for pages
$keywords = "";

//include the header for page
include $_SERVER['DOCUMENT_ROOT'].'/inc/header.php';
?>

                <!-- Start Dynamic content for page -->
                <div class="article article--50-50 article--error">
                    <div class="container">
                        <div class="article-50">
                           <img src="/assets/images/404.jpg?v=1" alt="Missing page image">
                        </div>
                        <div class="article-50">
                            <p>The page you are trying to view is not found, you either mistyped the page address, or there might be a broken link from where you requested.</p>
                            <p>Please consider to go back to the original site and/or typing in the correct web address of the requested web page.</p>
                        </div>
                    </div>
                </div>
                <!-- End dynamic content -->

<?php

//include the footer for page
include $_SERVER['DOCUMENT_ROOT'].'/inc/footer.php';

?>               