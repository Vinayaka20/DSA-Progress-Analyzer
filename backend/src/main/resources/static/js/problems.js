const userId = 2;

let allProblems = [];

document.addEventListener("DOMContentLoaded", () => {

    loadProblems();

    document
        .getElementById("problemSearch")
        .addEventListener("input", applyFilters);

    document
        .getElementById("difficultyFilter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("topicFilter")
        .addEventListener("change", applyFilters);

    document
        .getElementById("clearFilters")
        .addEventListener("click", clearFilters);

});


function loadProblems() {

    fetch(`/users/${userId}/solved-problems-db`)
        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load problems");
            }

            return response.json();

        })
        .then(data => {

            console.log("Problems data:", data);

            allProblems = data;

            updateSummary(data);

            populateTopicFilter(data);

            displayProblems(data);

        })
        .catch(error => {

            console.error("Problems error:", error);

            document.getElementById("problemsTableBody").innerHTML = `
                <tr>
                    <td colspan="6">
                        Failed to load problems.
                    </td>
                </tr>
            `;

        });

}


function updateSummary(problems) {

    const total = problems.length;

    const easy = problems.filter(
        problem => problem.difficulty === "Easy"
    ).length;

    const medium = problems.filter(
        problem => problem.difficulty === "Medium"
    ).length;

    const hard = problems.filter(
        problem => problem.difficulty === "Hard"
    ).length;


    document.getElementById("problemTotal").textContent = total;

    document.getElementById("problemEasy").textContent = easy;

    document.getElementById("problemMedium").textContent = medium;

    document.getElementById("problemHard").textContent = hard;

}


function populateTopicFilter(problems) {

    const topicFilter = document.getElementById("topicFilter");

    const topics = new Set();

    problems.forEach(problem => {

        if (problem.topics) {

            problem.topics.forEach(topic => {
                topics.add(topic);
            });

        }

    });


    const sortedTopics = [...topics].sort();

    sortedTopics.forEach(topic => {

        const option = document.createElement("option");

        option.value = topic;

        option.textContent = topic;

        topicFilter.appendChild(option);

    });

}


function applyFilters() {

    const searchText =
        document
            .getElementById("problemSearch")
            .value
            .toLowerCase()
            .trim();


    const difficulty =
        document.getElementById("difficultyFilter").value;


    const topic =
        document.getElementById("topicFilter").value;


    const filteredProblems = allProblems.filter(problem => {

        const matchesSearch =
            problem.title.toLowerCase().includes(searchText) ||
            problem.problemNumber.toString().includes(searchText) ||
            problem.topics.some(
                item => item.toLowerCase().includes(searchText)
            );


        const matchesDifficulty =
            difficulty === "all" ||
            problem.difficulty === difficulty;


        const matchesTopic =
            topic === "all" ||
            problem.topics.includes(topic);


        return (
            matchesSearch &&
            matchesDifficulty &&
            matchesTopic
        );

    });


    displayProblems(filteredProblems);

}


function displayProblems(problems) {

    const tableBody =
        document.getElementById("problemsTableBody");

    const problemCount =
        document.getElementById("problemCount");


    problemCount.textContent =
        `${problems.length} problems`;


    if (problems.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No problems found.
                </td>
            </tr>
        `;

        return;
    }


    tableBody.innerHTML = problems.map(problem => {

        const topics = problem.topics
            .map(topic => `<span class="topic-tag">${topic}</span>`)
            .join(" ");


        return `
            <tr>

                <td>
                    ${problem.problemNumber}
                </td>

                <td>
                    <strong>${problem.title}</strong>
                </td>

                <td>

                    <span class="difficulty-badge ${problem.difficulty.toLowerCase()}">
                        ${problem.difficulty}
                    </span>

                </td>

                <td>
                    ${topics}
                </td>

                <td>
                    ${problem.platform}
                </td>

                <td>

                    <a
                        href="${problem.problemUrl}"
                        target="_blank"
                        rel="noopener noreferrer">

                        Open ↗

                    </a>

                </td>

            </tr>
        `;

    }).join("");

}


function clearFilters() {

    document.getElementById("problemSearch").value = "";

    document.getElementById("difficultyFilter").value = "all";

    document.getElementById("topicFilter").value = "all";

    displayProblems(allProblems);

}