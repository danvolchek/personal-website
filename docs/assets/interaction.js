document.addEventListener('DOMContentLoaded', function () {
    const projects = document.querySelectorAll("[data-project]");
    for (const project of projects) {
        project.onanimationend = handleAnimationEnd;
    }

    const links = document.querySelectorAll(`a[href^="#"]`);
    for (const link of links) {
        link.onclick = handleProjectLinkClick;
    }

    window.onhashchange = handleHashChange;

    const currentHash = window.location.hash.substring(1);
    if (isValidProject(currentHash)) {
        transitionImmediate("", currentHash)
    } else {
        window.location.hash = "";
    }
});

function handleProjectLinkClick(event) {
    const anyAnimating = document.querySelector(".fadeIn, .fadeOut") != null;

    if (anyAnimating) {
        event.preventDefault();
    }
}

function handleHashChange(event) {
    const oldHash = new URL(event.oldURL).hash.substring(1);
    const newHash = window.location.hash.substring(1);

    if (!isValidProject(newHash)) {
        transition(oldHash, "");
    } else {
        transition(oldHash, newHash);
    }
}

function transition(from, to) {
    if (from === to) {
        return;
    }

    const fromProject = getProject(from);
    const toProject = getProject(to);

    fromProject?.classList.add("fadeOut");
    toProject.classList.add("fadeIn");

    window.location.hash = to;
}

function transitionImmediate(from, to) {
    const fromProject = getProject(from);
    const toProject = getProject(to);

    fromProject.classList.add("hidden")
    toProject.classList.remove("hidden")

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

function getProject(id) {
    return document.querySelector(`[data-project="${id}"]`)
}

function isValidProject(id) {
    const projects = Array.from(document.querySelectorAll(`[data-project]`));
    const projectIds = projects.map(project => {
        return project.attributes.getNamedItem("data-project").value
    })
    return projectIds.includes(id);
}