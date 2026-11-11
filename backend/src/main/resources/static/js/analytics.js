
const userId = 2;

document.addEventListener("DOMContentLoaded", () => {
    loadAnalyticsSummary();
    loadTopicHistogram();
    loadGrowthJourney();
});


/* =========================================
   1. SUMMARY CARDS + DIFFICULTY BREAKDOWN
========================================= */

function loadAnalyticsSummary() {

    fetch(`/users/${userId}/dashboard`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load analytics data");
            }

            return response.json();
        })
        .then(data => {

            setText("analyticsTotal", data.totalSolved ?? 0);
            setText("analyticsEasy", data.easy ?? 0);
            setText("analyticsMedium", data.medium ?? 0);
            setText("analyticsHard", data.hard ?? 0);

            const total = Number(data.totalSolved) || 0;
            const easy = Number(data.easy) || 0;
            const medium = Number(data.medium) || 0;
            const hard = Number(data.hard) || 0;

            const percent = value =>
                total
                    ? ((value / total) * 100).toFixed(1) + "%"
                    : "0%";

            setText("breakdownEasy", easy);
            setText("breakdownMedium", medium);
            setText("breakdownHard", hard);

            setText("breakdownEasyPercent", percent(easy));
            setText("breakdownMediumPercent", percent(medium));
            setText("breakdownHardPercent", percent(hard));
        })
        .catch(error => {
            console.error("Analytics summary error:", error);
        });
}


/* =========================================
   2. TOPIC-WISE PRACTICE HISTOGRAM
========================================= */

function loadTopicHistogram() {

    const container = document.getElementById("analyticsTopicChart");

    if (!container) return;

    container.innerHTML =
        '<p class="analytics-empty">Loading topic analysis...</p>';

    fetch(`/users/${userId}/topic-progress-db`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load topic data");
            }

            return response.json();
        })
        .then(data => {

            console.log("Topic analytics data:", data);

            const topics = (Array.isArray(data) ? data : [])
                .map(item => ({
                    topic: String(item.topic || "Other"),
                    solvedCount: Math.max(
                        0,
                        Number(item.solvedCount) || 0
                    )
                }))
                .sort((a, b) => a.solvedCount - b.solvedCount);

            renderTopicHistogram(container, topics);
        })
        .catch(error => {

            console.error("Topic histogram error:", error);

            container.innerHTML =
                '<p class="analytics-empty">Could not load topic analysis.</p>';
        });
}


function renderTopicHistogram(container, topics) {

    container.innerHTML = "";

    if (!topics.length) {
        container.innerHTML =
            '<p class="analytics-empty">No topic data available yet.</p>';
        return;
    }

    const maxSolved = Math.max(
        ...topics.map(topic => topic.solvedCount),
        1
    );

    const TOP_LIMIT = 10;
    let showAll = false;

    const chart = document.createElement("div");
    chart.className = "topic-histogram";

    const button = document.createElement("button");
    button.className = "topic-view-toggle";
    button.type = "button";

    function drawChart() {

        chart.innerHTML = "";

        const visibleTopics = showAll
            ? topics
            : topics.slice(0, TOP_LIMIT);

        visibleTopics.forEach((item, index) => {

            const percentage =
                (item.solvedCount / maxSolved) * 100;

            const row = document.createElement("div");
            row.className = "topic-bar-row";

            const label = document.createElement("div");
            label.className = "topic-bar-label";
            label.textContent = item.topic;
            label.title = item.topic;

            const track = document.createElement("div");
            track.className = "topic-bar-track";

            const bar = document.createElement("div");
            bar.className = "topic-bar-fill";

            if (index < Math.ceil(topics.length / 3)) {
                bar.classList.add("topic-bar-weak");
            }

            bar.style.width = `${percentage}%`;

            const count = document.createElement("span");
            count.className = "topic-bar-count";
            count.textContent = item.solvedCount;

            bar.appendChild(count);
            track.appendChild(bar);

            row.appendChild(label);
            row.appendChild(track);

            chart.appendChild(row);
        });

        button.textContent = showAll
            ? "Show Top 10"
            : `View All Topics (${topics.length})`;

        button.style.display =
            topics.length > TOP_LIMIT ? "block" : "none";
    }

    button.addEventListener("click", () => {
        showAll = !showAll;
        drawChart();
    });

    const legend = document.createElement("div");
    legend.className = "topic-chart-legend";

    legend.innerHTML = `
        <span><i class="legend-weak"></i> Less practiced</span>
        <span><i class="legend-strong"></i> More practiced</span>
    `;

    container.appendChild(chart);
    container.appendChild(button);
    container.appendChild(legend);

    drawChart();
}


/* =========================================
   3. DATE-WISE PROGRESS HISTORY
========================================= */

function loadGrowthJourney() {

    const container =
        document.getElementById("analyticsProgressChart");

    if (!container) return;

    container.innerHTML =
        '<p class="analytics-empty">Loading progress history...</p>';

    fetch(`/users/${userId}/progress-history`)
        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load progress history");
            }

            return response.json();
        })
        .then(data => {

            console.log("Progress history data:", data);

            const history = (Array.isArray(data) ? data : [])
                .map(item => ({
                    date: parseLocalDate(item.date),
                    totalSolved: Number(item.totalSolved)
                }))
                .filter(item =>
                    item.date &&
                    !Number.isNaN(item.date.getTime()) &&
                    Number.isFinite(item.totalSolved)
                )
                .sort((a, b) => a.date - b.date);

            renderGrowthJourney(container, history);
        })
        .catch(error => {

            console.error("Progress history error:", error);

            container.innerHTML =
                '<p class="analytics-empty">Could not load progress history.</p>';
        });
}


/* =========================================
   4. DATE UTILITY
========================================= */

function parseLocalDate(value) {

    if (!value) return null;

    const match = String(value).match(
        /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]) - 1;
        const day = Number(match[3]);

        const date = new Date(year, month, day);

        // Reject invalid calendar dates.
        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate()
    );
}


function formatHistoryDate(date) {

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function getTodayDate() {

    const today = new Date();

    return new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
}


/* =========================================
   5. RENDER DATE-WISE PROGRESS TABLE
========================================= */

function renderGrowthJourney(container, history) {

    container.innerHTML = "";

    if (!history.length) {

        container.innerHTML =
            '<p class="analytics-empty">No progress history available yet.</p>';

        return;
    }

    const today = getTodayDate();

    /*
       Calculate changes between consecutive snapshots.
       These are changes between records, NOT guaranteed
       daily solved counts.
    */

    const records = history.map((item, index) => {

        const previousTotal = index > 0
            ? history[index - 1].totalSolved
            : null;

        const change = previousTotal === null
            ? null
            : item.totalSolved - previousTotal;

        return {
            date: item.date,
            totalSolved: item.totalSolved,
            change: change,
            isFuture: item.date > today
        };
    });

    // Newest record first.
    records.reverse();

    // Summary section.
    const summary = document.createElement("div");
    summary.className = "growth-summary";

    const recordCard = document.createElement("div");
    recordCard.className = "growth-stat";

    recordCard.innerHTML = `
        <span>History Records</span>
        <strong>${records.length}</strong>
    `;

    const latestDateCard = document.createElement("div");
    latestDateCard.className = "growth-stat";

    const latestNonFuture = records.find(record => !record.isFuture);

    latestDateCard.innerHTML = `
        <span>Latest Recorded Date</span>
        <strong>${latestNonFuture
            ? formatHistoryDate(latestNonFuture.date)
            : "No current records"}</strong>
    `;

    summary.appendChild(recordCard);
    summary.appendChild(latestDateCard);

    // Table wrapper.
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "growth-history-table-wrapper";

    const table = document.createElement("table");
    table.className = "growth-history-table";

    // Table header.
    const thead = document.createElement("thead");

    thead.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Total Solved</th>
            <th>Change Since Previous Record</th>
        </tr>
    `;

    table.appendChild(thead);

    // Table body.
    const tbody = document.createElement("tbody");

    records.forEach(record => {

        const row = document.createElement("tr");

        const dateCell = document.createElement("td");
        dateCell.textContent = formatHistoryDate(record.date);

        if (record.isFuture) {

            const warning = document.createElement("span");
            warning.className = "growth-future-label";
            warning.textContent = "Future date";

            dateCell.appendChild(document.createTextNode(" "));
            dateCell.appendChild(warning);
        }

        const totalCell = document.createElement("td");
        totalCell.textContent = record.totalSolved;

        const changeCell = document.createElement("td");

        if (record.change === null) {
            changeCell.textContent = "—";
        } else {
            const sign = record.change > 0 ? "+" : "";
            changeCell.textContent = `${sign}${record.change}`;
        }

        row.appendChild(dateCell);
        row.appendChild(totalCell);
        row.appendChild(changeCell);

        if (record.isFuture) {
            row.classList.add("growth-future-row");
        }

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableWrapper.appendChild(table);

    // Explanation.
    const note = document.createElement("p");
    note.className = "growth-history-note";
    note.textContent =
        "Change shows the difference between consecutive recorded snapshots. It does not represent verified daily solved activity.";

    container.appendChild(summary);
    container.appendChild(tableWrapper);
    container.appendChild(note);
}


/* =========================================
   6. SMALL DOM UTILITY
========================================= */

function setText(elementId, value) {

    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}
