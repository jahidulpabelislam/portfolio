<?php

declare(strict_types=1);

/**
 * A helper class to use throughout the site.
 * To aid in including common partials for all pages.
 * And handles any page data associated with the page and passed to where needed
 */

namespace App;

use Exception;

class Renderer {

    private static function trim(string $contents): string {
        return str_replace("\n", "", trim($contents));
    }

    public function __construct(private Page $page) {
    }

    public function __call(string $method, array $arguments): void {
        $partial = substr($method, 6); // Remove 'render'
        $partial = preg_replace("/\B([A-Z])/", "-$1", $partial); // Convert 'CanonicalUrls' to 'Canonical-Urls'
        $partial = strtolower($partial); // Convert 'Canonical-Urls' to 'canonical-urls'
        $template = new Template(ROOT . "/partials/$partial.php", $arguments[0] ?? []);
        if ($template->exists()) {
            $template->include();
            return;
        }

        throw new Exception("No method found for $method");
    }

    public function renderHtmlStart(): void {
        echo <<<HTML
<!DOCTYPE html>
<html lang="en-GB">
HTML;
    }

    public function renderHtmlEnd(): void {
        echo <<<HTML
</html>
HTML;
    }

    public function renderBodyStart(): void {
        echo <<<HTML
<body>
HTML;
    }

    public function renderBodyEnd(): void {
        $this->page->renderJSTemplates();
        $this->page->renderScripts();
        $this->page->renderInlineJS();

        // Only want tracking for live site
        if (site()->isProduction()) {
            ?>
            <!-- Google Tag Manager (noscript) -->
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5PNRKNC" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
            <!-- End Google Tag Manager (noscript) -->
            <?php
        }
        echo "</body>";
    }

    public function renderPageStart(): void {
        echo <<<HTML
<div class="page-container">
HTML;
    }

    public function renderPageEnd(): void {
        echo "</div>";
    }

    public function renderContentStart(): void {
        echo <<<HTML
<main class="main-content">
    <div class="main-content__inner">
HTML;
    }

    public function renderContentEnd(): void {
        echo <<<HTML
    </div>
</main>
HTML;
    }

    public function renderInlineJS(): void {
        $jsGlobals = $this->page->jsGlobals;
        $inlineJS = $this->page->inlineJS;
        $onLoadInlineJS = $this->page->onLoadInlineJS;

        $deferredStylesheets = $this->page->deferredStylesheets;
        if (count($deferredStylesheets)) {
            $deferredStylesheetsString = [];
            foreach ($deferredStylesheets as $deferredStylesheet) {
                $deferredStylesheetsString[] = (string)Site::asset(
                    $deferredStylesheet["src"],
                    $deferredStylesheet["version"] ?? null
                );
            }
            $deferredStylesheetsString = json_encode($deferredStylesheetsString);
            $onLoadInlineJS = "JPI.loadStylesheets($deferredStylesheetsString);" . $onLoadInlineJS;
        }

        if (empty($jsGlobals) && empty($inlineJS) && empty($onLoadInlineJS)) {
            return;
        }

        $js = "";

        if (!empty($jsGlobals)) {
            $js .= "var JPI = JPI || {};";
            foreach ($jsGlobals as $globalName => $vars) {
                $jsVars = json_encode($vars);
                $js .= "JPI.$globalName = $jsVars;";
            }
        }

        if (!empty($inlineJS)) {
            $js .= $inlineJS;
        }

        if (!empty($onLoadInlineJS)) {
            $js .= "jQuery(function() {{$onLoadInlineJS}});";
        }

        $js = self::trim($js);
        echo <<<HTML
            <script type="application/javascript">$js</script>
            HTML;
    }

    public function renderScripts(): void {
        $scripts = $this->page->scripts;

        if (empty($scripts)) {
            return;
        }

        foreach ($scripts as $script) {
            $src = Site::asset($script["src"], $script["version"]);
            echo <<<HTML
                <script src="$src" type="application/javascript"></script>
                HTML;
        }
    }

    public function renderJSTemplates(): void {
        $jsTemplates = $this->page->jsTemplates;

        if (empty($jsTemplates)) {
            return;
        }

        foreach ($jsTemplates as $name => $template) {
            $template = self::trim($template);
            echo <<<HTML
                <script type="text/template" id="$name-template">$template</script>
                HTML;
        }
    }
}
