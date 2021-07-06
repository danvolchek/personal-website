document.addEventListener('DOMContentLoaded', function () {
    const projectLinks = document.querySelectorAll("[data-project-link]");

    for (const projectLink of projectLinks) {
        projectLink.onclick = handleProjectLinkClick;
    }

    const projects = document.querySelectorAll("[data-project]");

    for (const project of projects) {
        project.onanimationend = handleAnimationEnd;
    }

    window.onhashchange = handleHashChange;

    const currentHash = window.location.hash.substring(1);
    if (isValidProject(currentHash)) {
        transition("", currentHash, true)
    } else {
        window.location.hash = "";
    }
});

function handleHashChange(event) {
    const oldHash = new URL(event.oldURL).hash.substring(1);
    const newHash = window.location.hash.substring(1);

    if (!isValidProject(newHash)) {
        transition(oldHash, "", false);
    } else {
        transition(oldHash, newHash, false);
    }
}

function handleProjectLinkClick(event) {
    transition(window.location.hash.substring(1), getAttribute(event.target, "data-project-link"), false)
}

function transition(from, to, immediate) {
    const anyAnimating = document.querySelector(".fadeIn, .fadeOut") != null;

    if (anyAnimating || from === to || !isValidProject(to)) {
        return;
    }

    const activeProject = document.querySelector(`[data-project="${from}"]`);

    const clickedProject = document.querySelector(`[data-project="${to}"]`);

    if (immediate) {
        activeProject?.classList.add("hidden")
        clickedProject.classList.remove("hidden")
    } else {
        activeProject?.classList.add("fadeOut");
        clickedProject.classList.add("fadeIn");
    }

    window.location.hash = to;
}

function handleAnimationEnd(event) {
    const element = event.target;
    if (element.classList.contains("fadeOut")) {
        element.classList.remove("fadeOut");
        element.classList.add("hidden")
        document.querySelector(".fadeIn").classList.remove("hidden")
    } else if (element.classList.contains("fadeIn")) {
        element.classList.remove("fadeIn");
    }
}

function getAttribute(element, name) {
    return element.attributes.getNamedItem(name).value;
}

function isValidProject(id) {
    return Array.from(document.querySelectorAll(`[data-project]`)).map(a => getAttribute(a, "data-project")).includes(id);
}