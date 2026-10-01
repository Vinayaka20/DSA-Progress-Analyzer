const userId = 2;

document.addEventListener("DOMContentLoaded", () => {

    loadAnalyticsSummary();
    loadTopicChart();
    loadProgressHistory();

});


function loadAnalyticsSummary() {

    fetch(`/users/${userId}/dashboard`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load analytics data");
            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Analytics dashboard data:",
                data
            );

            document.getElementById("analyticsTotal").textContent =
                data.totalSolved;

            document.getElementById("analyticsEasy").textContent =
                data.easy;

            document.getElementById("analyticsMedium").textContent =
                data.medium;

            document.getElementById("analyticsHard").textContent =
                data.hard;


            // Difficulty breakdown

            const total = data.totalSolved;

            const easyPercent =
                total > 0
                    ? ((data.easy / total) * 100).toFixed(1)
                    : 0;

            const mediumPercent =
                total > 0
                    ? ((data.medium / total) * 100).toFixed(1)
                    : 0;

            const hardPercent =
                total > 0
                    ? ((data.hard / total) * 100).toFixed(1)
                    : 0;


            document.getElementById("breakdownEasy").textContent =
                data.easy;

            document.getElementById("breakdownMedium").textContent =
                data.medium;

            document.getElementById("breakdownHard").textContent =
                data.hard;


            document.getElementById("breakdownEasyPercent").textContent =
                easyPercent + "%";

            document.getElementById("breakdownMediumPercent").textContent =
                mediumPercent + "%";

            document.getElementById("breakdownHardPercent").textContent =
                hardPercent + "%";

        })

        .catch(error => {

            console.error(
                "Analytics error:",
                error
            );

        });
}


function loadTopicChart() {

    fetch(`/users/${userId}/topic-progress-db`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load topic data");
            }

            return response.json();

        })

        .then(data => {

            console.log("Topic analytics data:", data);

            const labels = data.map(
                item => item.topic
            );

            const values = data.map(
                item => item.solvedCount
            );

            const canvas =
                document.getElementById(
                    "analyticsTopicChart"
                );

            /*
             * Give every topic enough vertical space.
             */
            const chartHeight =
                Math.max(500, data.length * 32);

            canvas.style.height =
                chartHeight + "px";


            const ctx =
                canvas.getContext("2d");


            new Chart(ctx, {

                type: "bar",

                data: {

                    labels: labels,

                    datasets: [{

                        label: "Problems Solved",

                        data: values

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    indexAxis: "y",

                    scales: {

                        x: {

                            beginAtZero: true

                        }

                    },

                    plugins: {

                        legend: {

                            display: false

                        }

                    }

                }

            });

        })

        .catch(error => {

            console.error(
                "Topic chart error:",
                error
            );

        });
}


function loadProgressHistory() {

    fetch(`/users/${userId}/progress-history`)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    "Failed to load progress history"
                );
            }

            return response.json();

        })

        .then(data => {

            console.log(
                "Progress history data:",
                data
            );


            data.sort(
                (a, b) =>
                    new Date(a.date) - new Date(b.date)
            );


            const labels =
                data.map(
                    item => item.date
                );


            const values =
                data.map(
                    item => item.totalSolved
                );


            const canvas =
                document.getElementById(
                    "analyticsProgressChart"
                );


            if (!canvas) {

                console.error(
                    "analyticsProgressChart canvas not found"
                );

                return;
            }


            const ctx =
                canvas.getContext("2d");


            new Chart(ctx, {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [{

                        label: "Problems Solved",

                        data: values,

                        tension: 0.3,

                        fill: false

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {

                            beginAtZero: false

                        }

                    },

                    plugins: {

                        legend: {

                            display: true

                        }

                    }

                }

            });

        })

        .catch(error => {

            console.error(
                "Progress history error:",
                error
            );

        });
}