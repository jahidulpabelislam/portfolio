<?php
include_once($_SERVER["DOCUMENT_ROOT"] . "/../bootstrap.php");

$site = site();
$page = page();

$name = $site::NAME;
$job = $site::JOB;

$projectsPerPage = 6;

$pageNum = (int) ($_GET["page"] ?? 1);

$apiRequestParams = [
    "limit" => $projectsPerPage,
    "page" => $pageNum,
];

$projectTypesURL = $site::getAPIEndpoint("/project-types/");

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $projectTypesURL);
curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER, [
        "Accept: application/json",
    ]
);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Seconds

$projectTypesRes = json_decode(curl_exec($ch), true);
curl_close($ch);

$projectTypes = $projectTypesRes["data"] ?? [];

usort($projectTypes, static function ($projectTypeA, $projectTypeB) {
    return strcmp($projectTypeA["name"], $projectTypeB["name"]);
});

foreach ($projectTypes as $i => $projectType) {
    $projectTypes[$i]["urlname"] = preg_replace("/[^a-z0-9]+/", "-", strtolower($projectType["name"]));
}

$type = $_GET["type"] ?? null;
if ($type) {
    foreach ($projectTypes as $i => $projectType) {
        if ($type !== $projectType["urlname"]) {
            continue;
        }

        $typeId = $projectType["id"];
        break;
    }

    $apiRequestParams["filters"] = [
        "type_id" => $typeId ?? "",
    ];
}

$projectsURL = $site::getAPIEndpoint("/projects/");

$requestParamsString = "";
if (count($apiRequestParams) > 0) {
    $requestParamsString = "?" . http_build_query($apiRequestParams, "", "&");
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $projectsURL . $requestParamsString);
curl_setopt(
    $ch,
    CURLOPT_HTTPHEADER, [
       "Accept: application/json",
   ]
);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Seconds

$apiRes = json_decode(curl_exec($ch), true);
curl_close($ch);

$projects = $apiRes["data"] ?? [];

$page->addJSGlobal("projects", "apiResponse", $apiRes);

$page->renderHtmlStart();
$page->renderHead([
    "title" => "Portfolio",
    "description" => "Portfolio of $name, a $job based at Bognor Regis, West Sussex down by the South Coast of England.",
]);
$page->renderBodyStart();
$page->renderPageStart();
$page->renderNav();
$page->renderHeader([
    "title" => "My Portfolio",
    "description" => "See My Skills In Action",
]);
$page->renderContentStart();

$yearsSinceStarted = getTimeDifference($site->getStartDate(), new DateTime(), "%r%y");
?>

<section class="row row--alt projects">
    <div class="container">
        <p>Here you will see some pieces of work I have completed in the last <?php echo $yearsSinceStarted; ?> years.</p>
        <p>Most of these started as I am always on the lookout for ways to improve my skill set, whether that is experimenting with new technologies, integrating new libraries &amp; plugins (this being my main experiment).</p>

        <input type="hidden" class="js-page" value="<?php echo $pageNum; ?>" />

        <div class="projects__header">
            <?php
            $paginationStatusFormat = "Showing <strong>{start}</strong> - <strong>{end}</strong> of <strong>{total}</strong> projects";
            $paginationStatus = str_replace(
                [
                    "{start}",
                    "{end}",
                    "{total}",
                ],
                [
                    (count($projects) ? 1 : 0) + ($pageNum - 1) * $projectsPerPage,
                    ($pageNum - 1) * $projectsPerPage + count($projects),
                    $apiRes["_total_count"]
                ],
                $paginationStatusFormat
            )
            ?>
            <p class="projects__pagination-status" data-format="<?php echo $paginationStatusFormat; ?>"><?php echo $paginationStatus; ?></p>

            <?php if (count($projectTypes) > 1): ?>
                <div class="projects__type-filter">
                    <label for="projects-type" class="projects__type-filter-label">Filter by:</label>
                    <select name="project-type" id="projects-type" class="projects__type-filter-select input js-project-type">
                        <option value="" <?php echo !$type ? "selected" : "" ?>>All</option>
                        <?php foreach ($projectTypes as $projectType): ?>
                            <option
                                value="<?php echo $projectType["id"] ?>"
                                data-urlname="<?php echo $projectType["urlname"] ?>"
                                <?php echo $type === $projectType["urlname"] ? "selected" : "" ?>
                            >
                                <?php echo $projectType["name"] ?>
                            </option>
                        <?php endforeach; ?>
                    </select>
                </div>
            <?php endif; ?>
        </div>

        <p class="projects__error"></p>
        <i class="projects__loading fas fa-spinner fa-spin fa-3x"></i>
        <div class="projects__items"></div>
        <ul class="pagination projects__pagination"></ul>
    </div>
</section>

<section class="portfolio-links row">
    <div class="container">
        <h1 class="portfolio-links__heading row__heading">View My Packages</h1>
        <a class="portfolio-links__link social-link social-link--npm" href="<?php echo $site::getLinkToURL("npm") ?>" target="_blank" rel="noopener noreferrer">
            <img class="portfolio-links__image social-link__image" src="<?php echo $site::asset("/assets/images/logos/npm.svg"); ?>" alt="NPM logo" />
        </a>
        <a class="portfolio-links__link social-link social-link--packagist" href="<?php echo $site::getLinkToURL("packagist") ?>" target="_blank" rel="noopener noreferrer">
            <img class="portfolio-links__image social-link__image" src="<?php echo $site::asset("/assets/images/logos/packagist.svg"); ?>" alt="Packagist logo" />
        </a>
        <a class="portfolio-links__link social-link social-link--github" href="<?php echo $site::getLinkToURL("github") ?>" target="_blank" rel="noopener noreferrer">
            <img class="portfolio-links__image social-link__image" src="<?php echo $site::asset("/assets/images/logos/github.svg"); ?>" alt="GitHub logo" />
        </a>
    </div>
</section>

<?php
$page->addJSTemplate(
    "project",
    <<<HTML
    <article class="project">
        <div class="project__image">
            <img src="{{ images.0.url }}" alt="Screenshot of project" />
        </div>

        <div class="project__content">
            <p class="project__type">{{ type }}</p>
        
            <div class="project__header">
                <h3 class="project__title">{{ name }}</h3>
                <time class="project__date">{{ date }}</time>
            </div>
        
            <div class="project__description">{{ short_description }}</div>
        
            <div class="project__footer">
                <div class="project__links"></div>
                <button type="button" class="button button--brand project__read-more" data-project-id="{{ id }}">
                    Read More
                </button>
            </div>
        </div>
    </article>
    HTML
);

$page->addJSTemplate(
    "slide",
    <<<HTML
    <div class="slide-show__slide" id="slide-{{ id }}">
        <img class="slide-show__image js-expandable-image" src="{{ url }}" alt="Screenshot of project" data-slide-show-id="#slide-show-{{ project_id }}" data-slide-colour="{{ colour }}" />
    </div>
    HTML
);

$page->addJSTemplate(
    "slide-bullet",
    <<<HTML
    <button type="button" class="slide-show__bullet" data-slide-id="#slide-{{ id }}"></button>
    HTML
);

$page->addJSGlobal("projects", "perPage", $projectsPerPage);
$page->addJSGlobal("projects", "apiEndpoint", \JPI\Utils\URL::removeTrailingSlash($site::getAPIEndpoint()));

$page->renderContentEnd();
$page->renderFooter();
$page->renderPageEnd();
?>

<div class="modal detailed-project" role="dialog" aria-modal="true" aria-labelledby="detailed-project-title" aria-describedby="detailed-project-description" aria-hidden="true" hidden="hidden">
    <div class="modal__content">
        <button type="button" class="button modal__close js-modal-close" aria-label="Close">X</button>

        <h1 class="modal__heading" id="detailed-project-title"></h1>

        <div class="project__tags"></div>

        <div class="project__meta">
            <p class="project__type project__type--"></p>
            <time class="project__date">
                <?php echo date("Y"); ?>
            </time>
        </div>

        <div class="project__description" id="detailed-project-description"></div>
        <div class="project__links"></div>

        <div class="slide-show project__slide-show" id="detailed-project-slide-show">
            <div class="slide-show__viewport">
                <button type="button" class="slide-show__nav" data-direction="previous">
                    <span class="screen-reader-text">Navigate to the previous slide</span>
                    <?php renderFile("/assets/images/previous.svg"); ?>
                </button>
                <div class="slide-show__slides js-expandable-image-group"></div>
                <button type="button" class="slide-show__nav" data-direction="next">
                    <span class="screen-reader-text">Navigate to the next slide</span>
                    <?php renderFile("/assets/images/next.svg"); ?>
                </button>
            </div>
            <div class="slide-show__bullets"></div>
        </div>
    </div>
</div>

<div class="modal expanded-slide-show" role="dialog" aria-modal="true" aria-hidden="true" hidden="hidden">
    <button type="button" class="button expanded-slide-show__close js-modal-close" aria-label="Close">X</button>

    <div class="expanded-slide-show__image-container">
        <img class="expanded-slide-show__image expanded-slide-show__image--active" src="<?php echo $site::asset("/assets/images/blank.svg"); ?>" alt="Screenshot of project" />
    </div>

    <div class="expanded-slide-show__image-container">
        <img class="expanded-slide-show__image" src="<?php echo $site::asset("/assets/images/blank.svg"); ?>" alt="Screenshot of project" />
    </div>

    <div class="expanded-slide-show__controls">
        <p class="expanded-slide-show__counter">
            <span class="expanded-slide-show__current-count"></span>/<span class="expanded-slide-show__total-count"></span>
        </p>

        <div class="expanded-slide-show__bullets"></div>

        <div class="expanded-slide-show__navigations">
            <button type="button" class="expanded-slide-show__nav" data-direction="previous">
                <span class="screen-reader-text">Navigate to the previous slide</span>
                <?php renderFile("/assets/images/previous.svg"); ?>
            </button>
            <button type="button" class="expanded-slide-show__nav" data-direction="next">
                <span class="screen-reader-text">Navigate to the next slide</span>
                <?php renderFile("/assets/images/next.svg"); ?>
            </button>
        </div>
    </div>
</div>

<?php
$page->renderCookieModal();
$page->renderBodyEnd();
$page->renderHtmlEnd();
