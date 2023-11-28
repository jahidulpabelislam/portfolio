<?php
$site = site();
$page = page();

$pagination = $page->pagination ?? [];

if ($page->indexed) {
    $liveURL = $site->getCurrentURL(true, true);
    echo "<link rel='canonical' href='$liveURL' />";
}
else {
    echo "<meta name='robots' content='noindex,nofollow' />";
}
