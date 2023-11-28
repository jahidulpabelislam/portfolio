<?php
$site = site();
?>

<footer class="footer">
    <div class="container">
        <div class="footer__version">
            <?php renderFile(ROOT . "/assets/version.txt", false); ?>
        </div>

        <div class="footer__links">
            <a class="footer__link" href="<?php echo $site->makeURL("/cookie-policy/"); ?>">Cookie Policy</a>
            <a class="footer__link" href="<?php echo $site->makeURL("/privacy-policy/"); ?>">Privacy Policy</a>
            <a class="footer__link" href="<?php echo $site->getLinksUrl(); ?>" target="_blank">My Links</a>
        </div>

        <div class="footer__legal">
            &copy; <?php echo date("Y") . " " . $site::NAME; ?>
        </div>

        <img
            class="footer__logo"
            src="<?php echo $site::asset("/assets/images/logo.png"); ?>"
            alt="<?php echo $site::NAME; ?>'s Logo"
        />
    </div>
</footer>
