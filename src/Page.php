<?php

declare(strict_types=1);

namespace App;

use Exception;
use JPI\Utils\Singleton;
use JPI\Utils\URL;

class Page {

    use Singleton;

    private Site $site;

    private Renderer $renderer;

    private array $data = [];

    private function __construct() {
        $this->site = Site::get();
        $this->renderer = new Renderer($this);

        $filePath = realpath(dirname($_SERVER["SCRIPT_FILENAME"]));
        if ($filePath !== realpath(PUBLIC_ROOT)) {
            $this->setId(basename($filePath));
        } else {
            $this->setId("home");
        }
    }

    public function setId(string $id): void {
        $this->data["id"] = $id;

        $this->setUpGlobalData();

        $this->addScript("/assets/js/global.js");

        $pageScript = new File("/assets/js/$id.js");
        if ($pageScript->exists()) {
            $this->addScript($pageScript->getPath());
        }
    }

    public function __call(string $method, array $arguments): void {
        if (strpos($method, "render") === 0 && is_callable([$this->renderer, $method])) {
            call_user_func_array([$this->renderer, $method], $arguments);
            return;
        }

        throw new Exception("No method found for $method");
    }

    public function __set(string $field, mixed $value): void {
        if ($field === "id" && ($this->data[$field] ?? null) !== $value) {
            $this->setId($value);
            return;
        }

        $this->data[$field] = $value;
    }

    public function __get(string $field): mixed {
        return $this->data[$field] ?? null;
    }

    public function __isset(string $field): bool {
        if (array_key_exists($field, $this->data)) {
            return isset($this->data[$field]);
        }

        return false;
    }

    private function getInlineStylesheetsForPage(): array {
        return [
            "/assets/css/above-the-fold.css",
        ];
    }

    private function getStylesheetsForPage(): array {
        return [];
    }

    public function getDeferredStylesheetsForPage(): array {
        $pageId = $this->data["id"];

        $stylesheets = [
            ["src" => "/assets/css/global.css"],
        ];

        $pageScript = new File("/assets/css/$pageId.css");
        if ($pageScript->exists()) {
            $stylesheets[] = ["src" => $pageScript->getPath()];
        }

        // Only some pages use Font Awesome, so only add if it uses it
        $pagesUsingFA = [
            "home", "portfolio",
        ];
        if (in_array($pageId, $pagesUsingFA)) {
            $stylesheets[] = [
                "src" => "/assets/css/third-party/font-awesome.min.css",
                "version" => "5.10.0",
            ];
        }

        return $stylesheets;
    }

    private function setUpGlobalData(): void {
        $url = "/";

        $filePath = realpath(dirname($_SERVER["SCRIPT_FILENAME"]));
        if ($filePath !== realpath(PUBLIC_ROOT)) {
            $url = dirname($_SERVER["SCRIPT_NAME"]) . "/";
        }

        $this->data["indexed"] = $this->site->isProduction() || $this->site->isDevelopment();
        $this->data["currentURL"] = $this->site->makeURL($url);
        $this->data["inlineStylesheets"] = $this->getInlineStylesheetsForPage();
        $this->data["stylesheets"] = $this->getStylesheetsForPage();
        $this->data["deferredStylesheets"] = $this->getDeferredStylesheetsForPage();
        $this->data["jsGlobals"] = [
            "breakpoints" => load(JPI_SITE_ROOT . "/config/breakpoints.json", false)->getArray(),
        ];
        $this->data["scripts"] = [];
        $this->data["inlineJS"] = "";
        $this->data["onLoadInlineJS"] = "";
        $this->data["jsTemplates"] = [];
    }

    public function addPageData(array $newPageData): void {
        $this->data = array_replace_recursive($this->data, $newPageData);
    }

    public function addJSGlobal(string $global, ?string $subKey, mixed $value): void {
        if ($subKey) {
            $this->data["jsGlobals"][$global][$subKey] = $value;
        }
        else {
            $this->data["jsGlobals"][$global] = $value;
        }
    }

    public function addInlineJS(string $code, bool $isOnLoad = false): void {
        $code = trim($code);
        if ($isOnLoad) {
            $this->data["onLoadInlineJS"] .= $code;
        }
        else {
            $this->data["inlineJS"] .= $code;
        }
    }

    public function addScript(URL|string $src, string $version = null): void {
        $this->data["scripts"][] = ["src" => $src, "version" => $version];
    }

    public function addScripts(array $scripts): void {
        foreach ($scripts as $script) {
            $src = $script["src"];
            $version = $script["ver"] ?? null;
            $this->addScript($src, $version);
        }
    }

    public function addJSTemplate(string $name, string $template): void {
        $this->data["jsTemplates"][$name] = $template;
    }
}
