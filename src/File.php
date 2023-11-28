<?php

declare(strict_types=1);

/**
 * A helper class to use when handling files
 */

namespace App;

use JPI\Utils\URL;

class File {

    private string $fullPath;

    private ?bool $exists = null;
    private ?string $contents = null;
    private ?array $contentsAsArray = null;

    public function __construct(
        private string $path,
        bool $isRelative = true
    ) {
        if ($isRelative) {
            $path = PUBLIC_ROOT . URL::addLeadingSlash($path);
        }

        $this->fullPath = $path;
    }

    public function getPath(): string {
        return $this->path;
    }

    public function exists(): bool {
        if ($this->exists === null) {
            $this->exists = file_exists($this->fullPath);
        }

        return $this->exists;
    }

    public function include(): void {
        if ($this->exists()) {
            include_once($this->fullPath);
        }
    }

    public function get(?string $default = null): ?string {
        if ($this->contents === null && $this->exists()) {
            $this->contents = file_get_contents($this->fullPath);
        }

        return $this->contents ?? $default;
    }

    public function getArray(?array $default = null): ?array {
        if ($this->contentsAsArray === null) {
            $jsonString = $this->get();

            if ($jsonString) {
                $this->contentsAsArray = json_decode($jsonString, true);
            }
        }

        return $this->contentsAsArray ?? $default;
    }

    public function render(string $default = ""): void {
        echo $this->get($default);
    }
}
