<?php
if (!defined("ROOT")) {
    die();
}

$site = Site::get();
$pageRenderer = PageRenderer::get();
?>

<!DOCTYPE html>
<html lang="en-gb">

    <head>
        <?php
        // Only want Google Analytic for live site
        if ($site->isProduction()) {
            ?>
            <!-- Global site tag (gtag.js) - Google Analytics -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=UA-70803146-2" type="text/javascript"></script>
            <script type="text/javascript">window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","UA-70803146-2");</script>
            <?php
        }

        $title = "{$title} | Jahidul Pabel Islam - Full Stack Developer";
        if ($pageId === "home") {
            $title = "Jahidul Pabel Islam's Portfolio - Full Stack Developer";
        }
        ?>

        <!-- All meta data for page -->
        <title><?php echo $title; ?></title>

        <?php $pageRenderer->renderCanonicalURLs(); ?>

        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Jahidul Pabel Islam" />
        <meta name="description" content="<?php echo $desc; ?>" />

        <meta property="og:locale" content="en_GB" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="<?php echo $title; ?>" />
        <meta property="og:description" content="<?php echo $desc; ?>" />
        <meta property="og:url" content="<?php echo $site->getRequestedLocalURL(); ?>" />
        <meta property="og:site_name" content="Jahidul Pabel Islam" />

        <?php
        $imageLocation = "assets/images/portfolio-{$pageId}-preview.png";
        $filePath = $site::addTrailingSlash(ROOT) . ltrim($imageLocation, " /");
        if (file_exists($filePath)) {
            $localDomain = $site->getLocalDomain();
            $relativeImageURL = $site::addAssetVersion($imageLocation);
            $imageURL = "{$localDomain}{$relativeImageURL}";
            ?>
            <meta property="og:image" content="<?php echo $imageURL; ?>" />
            <?php
        }
        ?>

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="<?php echo $title; ?>" />

        <?php $pageRenderer->renderFavicons(); ?>

        <link href="<?php $site::echoWithAssetVersion("/assets/css/third-party/font-awesome.min.css", "5.10.0"); ?>" rel="stylesheet" type="text/css" media="all" title="style" />

        <!-- Custom stylesheet for site -->
        <?php
        $cssDir = $site->isDebug() ? "/assets/css/jpi" : "/assets/css";
        $cssExtension = $site->isDebug() ? "css" : "min.css";
        ?>
        <style>
            <?php echo file_get_contents(ROOT . "{$cssDir}/above-the-fold.{$cssExtension}"); ?>
        </style>
        <noscript><link href="<?php $site::echoWithAssetVersion("{$cssDir}/main.{$cssExtension}"); ?>" rel="stylesheet" type="text/css" media="all" title="style" /></noscript>

    </head>

    <body>
