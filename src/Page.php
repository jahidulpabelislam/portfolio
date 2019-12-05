<?php

class Page {

    private $site;
    private $data;

    private $renderer;

    private static $instance;

    public function __construct() {
        $this->site = Site::get();

        $this->data = $this->getGlobalPageData();

        $this->renderer = new Renderer($this);
    }

    public static function get(): Page {
        if (!self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    /**
     * Get the page specific stylesheet/css or the default
     * @param $pageId string
     * @return string
     */
    private function getPageStylesheet(string $pageId): string {
        $cssDir = $this->site->getIsDebug() ? "assets/css/jpi" : "assets/css";
        $cssExtension = $this->site->getIsDebug() ? "css" : "min.css";

        // Some pages (like `Links`) may use its own css file
        // so figure out if one exists to use, else use the main one
        $cssSrc = "/{$cssDir}/main.{$cssExtension}";
        if (file_exists(ROOT . "/{$cssDir}/{$pageId}.{$cssExtension}")) {
            $cssSrc = "/{$cssDir}/{$pageId}.{$cssExtension}";
        }

        return addAssetVersion($cssSrc);
    }

    public function getStylesheetsForPage(string $pageId): array {
        $stylesheets = [];

        // Only some pages use Font Awesome, so only add if it uses it
        $pagesUsingFA = [
            "home", "projects", "about", "contact",
        ];
        if (in_array($pageId, $pagesUsingFA)) {
            $stylesheets[] = addAssetVersion("/assets/css/third-party/font-awesome.min.css", "5.10.0");
        }

        $stylesheets[] = $this->getPageStylesheet($pageId);

        return $stylesheets;
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
            "stylesheets" => $this->getStylesheetsForPage($pageId),
            "jsGlobals" => [
                "css" => ["tabletWidth" => 768],
            ],
            "scripts" => [],
        ];

        return $globalPageData;
    }

    public function addPageData(array $newPageData) {
        $this->data = array_merge($this->data, $newPageData);
    }

    public function getFromPageData(string $field) {
        return $this->data[$field] ?? null;
    }

    public function addJSGlobal(string $global, string $key, $value) {
        $this->data["jsGlobals"][$global][$key] = $value;
    }

    public function addScript($script, $ver = false) {
        $script = addAssetVersion($script, $ver);
        $this->data["scripts"][] = $script;
    }

    public function addScripts(array $scripts) {
        foreach ($scripts as $script) {
            $file = $script["file"];
            $ver = $script["ver"] ?? false;
            $this->addScript($file, $ver);
        }
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

}