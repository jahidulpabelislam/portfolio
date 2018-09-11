<?php
//title of page to use
$pageTitle = "404";

$headerTitle = "404";

//the description to use for page
$description = "Error: 404 - Page Not Found message on the portfolio of Jahidul Pabel Islam, a Full Stack Web & Software Developer in Bognor Regis, West Sussex Down by the South Coast of England.";

$headerDesc = "Page Not Found";

//the keywords to use for pages
$keywords = "";

$navTint = "dark";

//include the header for page
include $_SERVER['DOCUMENT_ROOT'] . '/inc/header.php';
?>
				
				<!-- Start Dynamic content for page -->
				<div class="article article--halved">
					<div class="container">
						<div class="article__half">
							<img src="/assets/images/404.jpg?v=1" alt="Missing page image" class="error__img">
						</div>
						<div class="article__half">
							<p>The page you are trying to view can not be found.</p>
							<p>Please consider to go back to the original page or try retyping in the URL.</p>
						</div>
					</div>
				</div>
				<!-- End dynamic content -->

<?php
//include the footer for page
include $_SERVER['DOCUMENT_ROOT'] . '/inc/footer.php';
?>               