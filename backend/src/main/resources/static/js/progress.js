console.log("PROGRESS JS VERSION 2 LOADED", new Date().toLocaleTimeString());
let progressHistory = [];
const userId = 2;
window.weeklySolved = 0;
window.monthlySolved = 0;



async function initializeProgress() {
    console.log("1. initialize started");

        await loadGoals();
        console.log("2. goals loaded");

        await loadDashboard();
        console.log("3. dashboard loaded");

        await loadProgressHistory();
        console.log("4. history loaded");
}

document.addEventListener("DOMContentLoaded", initializeProgress);

// Runs again when returning from another page


async function loadDashboard() {

    const response = await fetch(`/users/${userId}/dashboard`);
    const data = await response.json();

    document.getElementById("totalSolved").textContent = data.totalSolved;
    window.totalSolved = data.totalSolved;

    updateTargetProgress();
}

async function loadGoals() {

    const response = await fetch(`/users/${userId}/goals`);
    const data = await response.json();

    console.log("API returned:", data);

    window.weeklyGoal = data.weeklyGoal;
    window.monthlyGoal = data.monthlyGoal;
    window.targetGoal = data.targetGoal;

    console.log("Window values:", window.weeklyGoal, window.monthlyGoal);

    updateTargetProgress();

    if (progressHistory.length > 0) {
        calculateWeeklyMonthlyProgress(progressHistory);
    }
}

async function loadProgressHistory() {

    const response = await fetch(`/users/${userId}/progress-history`);
    const data = await response.json();

    progressHistory = data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    calculateStreaks(progressHistory);
    calculateWeeklyMonthlyProgress(progressHistory);
    console.log("5. updateGoalBars should have run");
    console.log(document.getElementById("weeklyGoalText").textContent);
}

function calculateStreaks(data) {

    if (data.length === 0) {
        return;
    }

    let longest = 1;
    let current = 1;

    for (let i = 1; i < data.length; i++) {

        const previous = new Date(data[i - 1].date);
        const currentDate = new Date(data[i].date);

        const difference =
            (currentDate - previous) / 86400000;

        if (difference === 1) {

            current++;

        } else {

            current = 1;

        }

        longest = Math.max(longest, current);

    }

    // Check if the latest activity is today or yesterday
    const latestDate = new Date(data[data.length - 1].date);
    const today = new Date();

    latestDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    const daysSinceLastActivity =
        (today - latestDate) / 86400000;

    if (daysSinceLastActivity > 1) {
        current = 0;
    }

    document.getElementById("currentStreak").textContent = current;
    document.getElementById("longestStreak").textContent = longest;
}

function calculateWeeklyMonthlyProgress(data) {

    if (data.length === 0) return;

    let weeklySolved = 0;
    let monthlySolved = 0;

  const today = new Date();
  today.setHours(0,0,0,0);

    const sevenDaysAgo =
        new Date(today);

    sevenDaysAgo.setDate(today.getDate() - 6);

    const currentMonth =
        today.getMonth();

    const currentYear =
        today.getFullYear();

    for (let i = 1; i < data.length; i++) {

        const date =
            new Date(data[i].date);

        const increase =
            data[i].totalSolved -
            data[i - 1].totalSolved;

        if (date >= sevenDaysAgo) {

            weeklySolved += increase;

        }

        if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        ) {

            monthlySolved += increase;

        }

    }

   window.weeklySolved = weeklySolved;
   window.monthlySolved = monthlySolved;

   updateGoalBars(weeklySolved, monthlySolved);

}

function updateGoalBars(
        weeklySolved,
        monthlySolved) {

    if (!window.weeklyGoal || !window.monthlyGoal)
        return;

    document.getElementById("weeklyGoalText").textContent =
        `${weeklySolved} / ${window.weeklyGoal}`;

    document.getElementById("monthlyGoalText").textContent =
        `${monthlySolved} / ${window.monthlyGoal}`;

    document.getElementById("weeklyBar").style.width =
        `${Math.min(
            (weeklySolved / window.weeklyGoal) * 100,
            100
        )}%`;

    document.getElementById("monthlyBar").style.width =
        `${Math.min(
            (monthlySolved / window.monthlyGoal) * 100,
            100
        )}%`;

}

function updateTargetProgress() {

    if (!window.totalSolved || !window.targetGoal)
        return;

    document.getElementById("targetGoalText").textContent =
        `${window.totalSolved} / ${window.targetGoal}`;

    const percentage =
        Math.min(
            (window.totalSolved / window.targetGoal) * 100,
            100
        );

    document.getElementById("targetBar").style.width =
        `${percentage}%`;

    document.getElementById("remainingText").textContent =
        `Remaining: ${Math.max(
            window.targetGoal - window.totalSolved,
            0
        )}`;

}