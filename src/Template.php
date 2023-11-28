<?php

declare(strict_types=1);

namespace App;

class Template {

    private ?bool $exists = null;

    public function __construct(
        private string $path,
        private array $data = []
    ) {
    }

    public function exists(): bool {
        if ($this->exists === null) {
            $this->exists = file_exists($this->path);
        }

        return $this->exists;
    }

    public function include(): void {
        if ($this->exists()) {
            include_once($this->path);
        }
    }

    public function __get(string $key): mixed {
        return $this->data[$key];
    }

    public function __isset(string $key): bool {
        return array_key_exists($key, $this->data);
    }
}
