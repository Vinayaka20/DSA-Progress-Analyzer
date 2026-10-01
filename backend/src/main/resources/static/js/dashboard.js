document.addEventListener("DOMContentLoaded", () => {

    const userId = 2;

    fetch(`/users/${userId}/dashboard`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load dashboard data");
            }

            return response.json();
        })
        .then(data => {

            console.log("Dashboard data:", data);

            document.querySelector(".solved .stat-number").textContent =
                data.totalSolved;

            document.querySelector(".easy .stat-number").textContent =
                data.easy;

            document.querySelector(".medium .stat-number").textContent =
                data.medium;

            document.querySelector(".hard .stat-number").textContent =
                data.hard;
        })
        .catch(error => {
            console.error("Dashboard error:", error);
        });

        fetch(`/users/${userId}/difficulty-progress-db`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load difficulty data");
                }

                return response.json();
            })
            .then(data => {

                console.log("Difficulty data:", data);

                const easy = data.find(item => item.difficulty === "Easy");
                const medium = data.find(item => item.difficulty === "Medium");
                const hard = data.find(item => item.difficulty === "Hard");

                const ctx = document.getElementById("difficultyChart");

                new Chart(ctx, {
                    type: "doughnut",

                    data: {
                        labels: ["Easy", "Medium", "Hard"],

                        datasets: [{
                            data: [
                                easy ? easy.solvedCount : 0,
                                medium ? medium.solvedCount : 0,
                                hard ? hard.solvedCount : 0
                            ]
                        }]
                    },

                    options: {
                        responsive: true,

                        plugins: {
                            legend: {
                                position: "bottom"
                            }
                        }
                    }
                });

            })
            .catch(error => {
                console.error("Difficulty chart error:", error);
            });

            fetch(`/users/${userId}/topic-progress-db`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Failed to load topic data");
                    }

                    return response.json();
                })
                .then(data => {

                    console.log("Topic data:", data);

                    // Sort topics by solved count and take top 8
                    const topTopics = data
                        .sort((a, b) => b.solvedCount - a.solvedCount)
                        .slice(0, 8);

                    const labels = topTopics.map(item => item.topic);
                    const values = topTopics.map(item => item.solvedCount);

                    const ctx = document.getElementById("topicChart");

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
                            indexAxis: "y",

                            responsive: true,

                            plugins: {
                                legend: {
                                    display: false
                                }
                            },

                            scales: {
                                x: {
                                    beginAtZero: true
                                }
                            }
                        }
                    });

                })
                .catch(error => {
                    console.error("Topic chart error:", error);
                });

});