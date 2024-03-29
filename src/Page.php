<?php

use JPI\Utils\Singleton;

class Page {

    use Singleton;

    private $site;
    private $data;

    private $renderer;

    private function __construct() {
        $this->site = Site::get();

        $this->data = $this->getGlobalPageData();
        $this->addScripts($this->getScriptsForPage($this->id));

        $this->renderer = new Renderer($this);
    }

    public function __call($method, $arguments) {
        if (strpos($method, "render") === 0) {
            if (method_exists($this->renderer, $method)) {
                return call_user_func_array([$this->renderer, $method], $arguments);
            }
        }

        throw new Exception("No method found for {$method}");
    }

    public function __get(string $field) {
        return $this->getFromPageData($field);
    }

    public function __set(string $field, $value) {
        $this->data[$field] = $value;
    }

    public function __isset(string $field): bool {
        if (array_key_exists($field, $this->data)) {
            $value = $this->getFromPageData($field);
            return isset($value);
        }

        return false;
    }

    private function getInlineStylesheetsForPage(string $pageId): array {
        $cssDir = $this->site->getIsDebug() ? "/assets/css/jpi" : "/assets/css";
        $cssExtension = $this->site->getIsDebug() ? "css" : "min.css";

        return [
            "{$cssDir}/above-the-fold.{$cssExtension}",
        ];
    }

    private function getStylestyleshetsForPage(string $pageId): array  {
        return [];
    }

    /**
     * Get the page specific stylesheet/css or the default
     * @param $pageId string
     * @return string
     */
    private function getDeferredPageStylesheet(string $pageId): string {
        $cssDir = $this->site->getIsDebug() ? "/assets/css/jpi" : "/assets/css";
        $cssExtension = $this->site->getIsDebug() ? "css" : "min.css";

        // Some pages (like `Links`) may use its own css file
        // so figure out if one exists to use, else use the main one
        $cssSrc = "{$cssDir}/{$pageId}.{$cssExtension}";
        if (!(new File($cssSrc))->exists()) {
            $cssSrc = "{$cssDir}/main.{$cssExtension}";
        }

        return addAssetVersion($cssSrc);
    }

    public function getDeferredStylesheetsForPage(string $pageId): array {
        $stylesheets = [
            $this->getDeferredPageStylesheet($pageId)
        ];

        // Only some pages use Font Awesome, so only add if it uses it
        $pagesUsingFA = [
            "home", "projects", "about", "contact",
        ];
        if (in_array($pageId, $pagesUsingFA)) {
            $stylesheets[] = addAssetVersion("/assets/css/third-party/font-awesome.min.css", "5.10.0");
        }

        return $stylesheets;
    }

    private function getScriptsForPage(string $pageId): array {
        // Either add compiled js file(s) for whole page, or include individual files if debug is specified
        $scripts = [["src" => "/assets/js/main.min.js"]];
        if ($this->site->getIsDebug()) {
            $scripts = [
                ["src" => "/assets/js/third-party/jquery.min.js", "ver" => "1.11.3"],
                ["src" => "/assets/js/third-party/waypoint.min.js", "ver" => "1.6.2"],
                ["src" => "/assets/js/third-party/jquery.countTo.js", "ver" => "1.2.0"],
                ["src" => "/assets/js/jpi/expanded-slide-show.js"],
                ["src" => "/assets/js/jpi/slide-show.js"],
                ["src" => "/assets/js/jpi/helpers.js"],
                ["src" => "/assets/js/jpi/templating.js"],
                ["src" => "/assets/js/jpi/ajax.js"],
                ["src" => "/assets/js/jpi/modal.js"],
                ["src" => "/assets/js/jpi/projects.js"],
                ["src" => "/assets/js/jpi/home.js"],
                ["src" => "/assets/js/jpi/contact-form.js"],
                ["src" => "/assets/js/jpi/nav.js"],
                ["src" => "/assets/js/jpi/cookie-banner.js"],
                ["src" => "/assets/js/jpi/main.js"],
            ];
        }

        return $scripts;
    }

    private function getGlobalPageData(): array {
        $pageId = "home";
        $url = "/";

        $filePath = realpath(dirname($_SERVER["SCRIPT_FILENAME"]));
        if ($filePath !== ROOT) {
            $pageId = basename($filePath);

            $path = dirname($_SERVER["SCRIPT_NAME"]);
            $url = turnPathToURL($path);
        }

        $globalPageData = [
            "id" => $pageId,
            "currentURL" => $this->site->getURL($url, false),
            "inlineStylesheets" => $this->getInlineStylesheetsForPage($pageId),
            "stylesheets" => $this->getStylestyleshetsForPage($pageId),
            "deferredStylesheets" => $this->getDeferredStylesheetsForPage($pageId),
            "jsGlobals" => [
                "css" => ["tabletWidth" => 768],
            ],
            "scripts" => [],
            "inlineJS" => "",
            "onLoadInlineJS" => "",
            "jsTemplates" => [],
        ];

        return $globalPageData;
    }

    public function addPageData(array $newPageData) {
        $this->data = array_replace_recursive($this->data, $newPageData);
    }

    public function getFromPageData(string $field) {
        return $this->data[$field] ?? null;
    }

    public function addJSGlobal(string $global, string $key, $value) {
        $this->data["jsGlobals"][$global][$key] = $value;
    }

    public function addInlineJS(string $code, bool $isOnLoad = false) {
        $code = trim($code);
        if ($isOnLoad) {
            $this->data["onLoadInlineJS"] .= $code;
        }
        else {
            $this->data["inlineJS"] .= $code;
        }
    }

    public function addScript(string $src, string $version = null) {
        $this->data["scripts"][] = ["src" => $src, "version" => $version];
    }

    public function addScripts(array $scripts) {
        foreach ($scripts as $script) {
            $src = $script["src"];
            $version = $script["ver"] ?? null;
            $this->addScript($src, $version);
        }
    }

    public function addJSTemplate(string $name, string $template) {
        $this->data["jsTemplates"][$name] = $template;
    }
}
