
/* ==========================================
   DSA PROGRESS ANALYZER
   PROBLEMS PAGE JAVASCRIPT
========================================== */
console.log("PROBLEMS JS VERSION 3 - PAGINATION LOADED");
const userId = 2;

let allProblems = [];
let filteredProblems = [];

let currentPage = 1;
let pageSize = 25;


/* ==========================================
   INITIALIZATION
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    loadProblems();

    // Search
    document
        .getElementById("problemSearch")
        .addEventListener("input", applyFilters);

    // Difficulty filter
    document
        .getElementById("difficultyFilter")
        .addEventListener("change", applyFilters);

    // Topic filter
    document
        .getElementById("topicFilter")
        .addEventListener("change", applyFilters);

    // Platform filter
    document
        .getElementById("platformFilter")
        .addEventListener("change", applyFilters);

    // Sorting
    document
        .getElementById("sortFilter")
        .addEventListener("change", applyFilters);

    // Reset filters
    document
        .getElementById("clearFilters")
        .addEventListener("click", clearFilters);

    // Page size
    document
        .getElementById("pageSize")
        .addEventListener("change", event => {

            pageSize = Number(event.target.value) || 25;

            currentPage = 1;

            displayProblems();

        });

    // Previous page
    document
        .getElementById("prevPage")
        .addEventListener("click", () => {

            if (currentPage > 1) {

                currentPage--;

                displayProblems();

            }

        });

    // Next page
    document
        .getElementById("nextPage")
        .addEventListener("click", () => {

            const totalPages = Math.ceil(
                filteredProblems.length / pageSize
            );

            if (currentPage < totalPages) {

                currentPage++;

                displayProblems();

            }

        });

});


/* ==========================================
   LOAD PROBLEMS FROM BACKEND
========================================== */

async function loadProblems() {

    const tbody = document.getElementById("problemsTableBody");

    try {

        const response = await fetch(
            `/users/${userId}/solved-problems-db`
        );

        if (!response.ok) {

            throw new Error(
                `Request failed with status ${response.status}`
            );

        }

        const data = await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "Expected an array of solved problems."
            );

        }

        console.log("Problems data:", data);

        allProblems = data;

        // Update summary cards
        updateSummary(allProblems);

        // Populate filters
        populateFilters(allProblems);

        // Display filtered problems
        applyFilters();

    } catch (error) {

        console.error("Problems error:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="table-state">
                    Could not load problems.
                    Check your server connection and try again.
                </td>
            </tr>
        `;

        document.getElementById("problemCount").textContent =
            "Unable to load problems";

        document.getElementById("paginationInfo").textContent = "";

    }

}


/* ==========================================
   UPDATE SUMMARY CARDS
========================================== */

function updateSummary(problems) {

    const easy = problems.filter(problem =>
        String(problem.difficulty || "").toLowerCase() === "easy"
    ).length;

    const medium = problems.filter(problem =>
        String(problem.difficulty || "").toLowerCase() === "medium"
    ).length;

    const hard = problems.filter(problem =>
        String(problem.difficulty || "").toLowerCase() === "hard"
    ).length;

    document.getElementById("problemTotal").textContent =
        problems.length;

    document.getElementById("problemEasy").textContent =
        easy;

    document.getElementById("problemMedium").textContent =
        medium;

    document.getElementById("problemHard").textContent =
        hard;

}


/* ==========================================
   POPULATE TOPIC AND PLATFORM FILTERS
========================================== */

function populateFilters(problems) {

    const topics = new Set();

    const platforms = new Set();

    problems.forEach(problem => {

        const problemTopics = Array.isArray(problem.topics)
            ? problem.topics
            : [];

        problemTopics.forEach(topic => {

            if (topic) {

                topics.add(String(topic));

            }

        });

        if (problem.platform) {

            platforms.add(String(problem.platform));

        }

    });

    // Sort topics alphabetically
    const sortedTopics = [...topics].sort(
        (a, b) => a.localeCompare(b)
    );

    // Sort platforms alphabetically
    const sortedPlatforms = [...platforms].sort(
        (a, b) => a.localeCompare(b)
    );

    appendOptions("topicFilter", sortedTopics);

    appendOptions("platformFilter", sortedPlatforms);

}


function appendOptions(elementId, values) {

    const select = document.getElementById(elementId);

    values.forEach(value => {

        const option = document.createElement("option");

        option.value = value;

        option.textContent = value;

        select.appendChild(option);

    });

}


/* ==========================================
   SEARCH AND FILTER
========================================== */

function applyFilters() {

    const searchText = document
        .getElementById("problemSearch")
        .value
        .toLowerCase()
        .trim();

    const difficulty =
        document.getElementById("difficultyFilter").value;

    const topic =
        document.getElementById("topicFilter").value;

    const platform =
        document.getElementById("platformFilter").value;

    const sort =
        document.getElementById("sortFilter").value;


    filteredProblems = allProblems.filter(problem => {

        const title = String(problem.title || "");

        const number = String(problem.problemNumber ?? "");

        const topics = Array.isArray(problem.topics)
            ? problem.topics
            : [];

        // Search by title, number or topic
        const matchesSearch = !searchText ||
            title.toLowerCase().includes(searchText) ||
            number.toLowerCase().includes(searchText) ||
            topics.some(item =>
                String(item).toLowerCase().includes(searchText)
            );

        // Difficulty
        const matchesDifficulty =
            difficulty === "all" ||
            String(problem.difficulty || "").toLowerCase() ===
            difficulty.toLowerCase();

        // Topic
        const matchesTopic =
            topic === "all" ||
            topics.includes(topic);

        // Platform
        const matchesPlatform =
            platform === "all" ||
            String(problem.platform || "") === platform;

        return (
            matchesSearch &&
            matchesDifficulty &&
            matchesTopic &&
            matchesPlatform
        );

    });


    // Sorting
    if (sort === "name-asc") {

        filteredProblems.sort((a, b) =>
            String(a.title || "").localeCompare(
                String(b.title || "")
            )
        );

    }

    else if (sort === "name-desc") {

        filteredProblems.sort((a, b) =>
            String(b.title || "").localeCompare(
                String(a.title || "")
            )
        );

    }

    else if (sort === "difficulty") {

        const rank = {
            Easy: 1,
            Medium: 2,
            Hard: 3
        };

        filteredProblems.sort((a, b) =>
            (rank[a.difficulty] || 9) -
            (rank[b.difficulty] || 9)
        );

    }

    else if (sort === "number") {

        filteredProblems.sort((a, b) =>
            Number(a.problemNumber) -
            Number(b.problemNumber)
        );

    }


    // Reset pagination after filtering
    currentPage = 1;

    displayProblems();

}


/* ==========================================
   DISPLAY PROBLEMS WITH PAGINATION
========================================== */

function displayProblems() {

    const tbody =
        document.getElementById("problemsTableBody");

    const total = filteredProblems.length;

    const totalPages = Math.ceil(total / pageSize);

    currentPage = Math.min(
        Math.max(currentPage, 1),
        Math.max(totalPages, 1)
    );


    // Calculate current page range
    const startIndex = (currentPage - 1) * pageSize;

    const pageProblems = filteredProblems.slice(
        startIndex,
        startIndex + pageSize
    );


    document.getElementById("problemCount").textContent =
        `${total} ${total === 1 ? "problem" : "problems"} found`;


    // No problems
    if (total === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="table-state">
                    No matching problems.
                    Try changing or clearing your filters.
                </td>
            </tr>
        `;

    }

    else {

        tbody.innerHTML = pageProblems.map(problem => {

            const topics = Array.isArray(problem.topics)
                ? problem.topics
                : [];

            const topicMarkup = topics.length

                ? topics.map(topic => `
                    <span class="topic-tag">
                        ${escapeHTML(topic)}
                    </span>
                `).join("")

                : `<span class="topic-tag">Uncategorized</span>`;


            const difficulty =
                String(problem.difficulty || "Unknown");

            const difficultyClass = [
                "easy",
                "medium",
                "hard"
            ].includes(difficulty.toLowerCase())
                ? difficulty.toLowerCase()
                : "";


            const url = safeHttpUrl(problem.problemUrl);

            const linkMarkup = url

                ? `
                    <a
                        class="problem-link"
                        href="${escapeHTML(url)}"
                        target="_blank"
                        rel="noopener noreferrer">
                        Open ↗
                    </a>
                `

                : `<span class="platform-label">No link</span>`;


            return `
                <tr>

                    <td>
                        ${escapeHTML(problem.problemNumber ?? "—")}
                    </td>

                    <td>
                        <div class="problem-title">
                            ${escapeHTML(problem.title || "Untitled problem")}
                        </div>
                    </td>

                    <td>
                        <span class="difficulty-badge ${difficultyClass}">
                            ${escapeHTML(difficulty)}
                        </span>
                    </td>

                    <td>
                        <div class="problem-topics">
                            ${topicMarkup}
                        </div>
                    </td>

                    <td>
                        <span class="platform-label">
                            ${escapeHTML(problem.platform || "—")}
                        </span>
                    </td>

                    <td>
                        ${linkMarkup}
                    </td>

                </tr>
            `;

        }).join("");

    }


    // Pagination information
    const from = total === 0
        ? 0
        : startIndex + 1;

    const to = Math.min(
        startIndex + pageSize,
        total
    );

    document.getElementById("paginationInfo").textContent =
        total === 0
            ? "No results to display"
            : `Showing ${from}–${to} of ${total}`;


    // Enable/disable pagination buttons
    document.getElementById("prevPage").disabled =
        currentPage <= 1;

    document.getElementById("nextPage").disabled =
        totalPages === 0 || currentPage >= totalPages;


    renderPageNumbers(totalPages);

}


/* ==========================================
   PAGE NUMBER BUTTONS
========================================== */

function renderPageNumbers(totalPages) {

    const container =
        document.getElementById("pageNumbers");

    container.innerHTML = "";

    if (totalPages <= 1) {

        return;

    }


    const pages = new Set([

        1,

        totalPages,

        currentPage - 1,

        currentPage,

        currentPage + 1

    ]);


    const visiblePages = [...pages]

        .filter(page =>
            page >= 1 && page <= totalPages
        )

        .sort((a, b) => a - b);


    visiblePages.forEach((page, index) => {

        // Add ellipsis between distant pages
        if (
            index > 0 &&
            page - visiblePages[index - 1] > 1
        ) {

            const dots = document.createElement("span");

            dots.textContent = "…";

            dots.className = "page-ellipsis";

            container.appendChild(dots);

        }


        const button = document.createElement("button");

        button.type = "button";

        button.className =
            `page-number${page === currentPage ? " active" : ""}`;

        button.textContent = page;

        button.setAttribute(
            "aria-label",
            `Go to page ${page}`
        );

        if (page === currentPage) {

            button.setAttribute("aria-current", "page");

        }


        button.addEventListener("click", () => {

            currentPage = page;

            displayProblems();

        });


        container.appendChild(button);

    });

}


/* ==========================================
   RESET FILTERS
========================================== */

function clearFilters() {

    document.getElementById("problemSearch").value = "";

    document.getElementById("difficultyFilter").value = "all";

    document.getElementById("topicFilter").value = "all";

    document.getElementById("platformFilter").value = "all";

    document.getElementById("sortFilter").value = "default";

    applyFilters();

}


/* ==========================================
   SAFE HTML RENDERING
========================================== */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({

        "&": "&amp;",

        "<": "&lt;",

        ">": "&gt;",

        '"': "&quot;",

        "'": "&#39;"

    })[character]);

}


/* ==========================================
   VALIDATE PROBLEM URL
========================================== */

function safeHttpUrl(value) {

    try {

        const url = new URL(String(value || ""));

        if (
            url.protocol === "http:" ||
            url.protocol === "https:"
        ) {

            return url.href;

        }

        return "";

    }

    catch {

        return "";

    }

}
