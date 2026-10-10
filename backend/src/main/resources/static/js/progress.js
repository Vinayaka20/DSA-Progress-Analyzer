console.log(
    "PROGRESS JS VERSION 3 LOADED",
    new Date().toLocaleTimeString()
);

let progressHistory = [];

const userId = 2;

window.weeklySolved = 0;
window.monthlySolved = 0;


// ============================================================
// INITIALIZE PROGRESS PAGE
// ============================================================

async function initializeProgress() {

    console.log("1. initialize started");

    await loadGoals();
    console.log("2. goals loaded");

    await loadDashboard();
    console.log("3. dashboard loaded");

    await loadProgressHistory();
    console.log("4. history loaded");

    await loadStreaks();
    console.log("5. streaks loaded");
}

document.addEventListener(
    "DOMContentLoaded",
    initializeProgress
);


// ============================================================
// LOAD DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        const response =
            await fetch(`/users/${userId}/dashboard`);

        if (!response.ok) {
            throw new Error("Failed to load dashboard");
        }

        const data = await response.json();

        document.getElementById("totalSolved").textContent =
            data.totalSolved;

        window.totalSolved = data.totalSolved;

        updateTargetProgress();

    } catch (error) {

        console.error(
            "Error loading dashboard:",
            error
        );
    }
}


// ============================================================
// LOAD GOALS
// ============================================================

async function loadGoals() {

    try {

        const response =
            await fetch(`/users/${userId}/goals`);

        if (!response.ok) {
            throw new Error("Failed to load goals");
        }

        const data = await response.json();

        console.log("API returned:", data);


        // Current goals
        window.weeklyGoal =
            data.weeklyGoal;

        window.monthlyGoal =
            data.monthlyGoal;

        window.targetGoal =
            data.targetGoal;


        // Current weekly cycle
        window.weeklyStartDate =
            data.weeklyStartDate;

        window.weeklyStartSolved =
            data.weeklyStartSolved;


        // Current monthly cycle
        window.monthlyStartDate =
            data.monthlyStartDate;

        window.monthlyStartSolved =
            data.monthlyStartSolved;


        // Previous weekly cycle
        window.previousWeeklySolved =
            data.previousWeeklySolved;

        window.previousWeeklyCompleted =
            data.previousWeeklyCompleted;


        // Previous monthly cycle
        window.previousMonthlySolved =
            data.previousMonthlySolved;

        window.previousMonthlyCompleted =
            data.previousMonthlyCompleted;


        console.log(
            "Window values:",
            window.weeklyGoal,
            window.monthlyGoal
        );


        updateTargetProgress();

        calculateWeeklyMonthlyProgress();

    } catch (error) {

        console.error(
            "Error loading goals:",
            error
        );
    }
}


// ============================================================
// LOAD PROGRESS HISTORY
// ============================================================

async function loadProgressHistory() {

    try {

        const response =
            await fetch(
                `/users/${userId}/progress-history`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load progress history"
            );
        }

        const data = await response.json();

        progressHistory = data.sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


        /*
         * IMPORTANT:
         *
         * Progress history is NO LONGER used
         * for calculating streaks.
         *
         * Streaks come from:
         *
         * /users/{userId}/streak
         *
         * which uses GitHub solution commit dates
         * stored in UserProblem.solvedDate.
         */


        calculateWeeklyMonthlyProgress();

        console.log(
            "5. updateGoalBars should have run"
        );

        console.log(
            document.getElementById(
                "weeklyGoalText"
            ).textContent
        );

    } catch (error) {

        console.error(
            "Error loading progress history:",
            error
        );
    }
}


// ============================================================
// LOAD STREAKS FROM BACKEND
// ============================================================

async function loadStreaks() {

    try {

        const response =
            await fetch(
                `/users/${userId}/streak`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load streak"
            );
        }

        const data =
            await response.json();

        console.log(
            "Streak API returned:",
            data
        );


        // Update current streak
        document.getElementById(
            "currentStreak"
        ).textContent =
            data.currentStreak;


        // Update longest streak
        document.getElementById(
            "longestStreak"
        ).textContent =
            data.longestStreak;


    } catch (error) {

        console.error(
            "Error loading streak:",
            error
        );


        // Safe fallback
        document.getElementById(
            "currentStreak"
        ).textContent = 0;

        document.getElementById(
            "longestStreak"
        ).textContent = 0;
    }
}


// ============================================================
// WEEKLY + MONTHLY PROGRESS
// ============================================================

function calculateWeeklyMonthlyProgress() {

    if (
        window.totalSolved === undefined ||
        window.weeklyStartSolved === undefined ||
        window.monthlyStartSolved === undefined
    ) {
        return;
    }


    // Calculate weekly progress
    const weeklySolved =
        Math.max(
            window.totalSolved -
            window.weeklyStartSolved,
            0
        );


    // Calculate monthly progress
    const monthlySolved =
        Math.max(
            window.totalSolved -
            window.monthlyStartSolved,
            0
        );


    window.weeklySolved =
        weeklySolved;

    window.monthlySolved =
        monthlySolved;


    updateGoalBars(
        weeklySolved,
        monthlySolved
    );

    updateGoalResults();
}


// ============================================================
// UPDATE GOAL RESULT MESSAGES
// ============================================================

function updateGoalResults() {

    const weeklyResult =
        document.getElementById(
            "weeklyResult"
        );

    const monthlyResult =
        document.getElementById(
            "monthlyResult"
        );


    // Clear previous messages
    weeklyResult.textContent = "";

    monthlyResult.textContent = "";


    // ========================================================
    // CURRENT WEEKLY GOAL
    // ========================================================

    if (
        window.weeklySolved >=
            window.weeklyGoal &&
        window.weeklyGoal > 0
    ) {

        weeklyResult.textContent =
            `🎉 Weekly Goal Completed! You solved ${window.weeklySolved} / ${window.weeklyGoal}.`;

    }


    // Previous weekly cycle completed
    else if (
        window.previousWeeklyCompleted === true
    ) {

        weeklyResult.textContent =
            `🎉 Previous week completed! You solved ${window.previousWeeklySolved} / ${window.weeklyGoal}.`;

    }


    // Previous weekly cycle not completed
    else if (
        window.previousWeeklyCompleted === false &&
        window.previousWeeklySolved !== null &&
        window.previousWeeklySolved !== undefined
    ) {

        weeklyResult.textContent =
            `👏 Well played! You solved ${window.previousWeeklySolved} / ${window.weeklyGoal}.`;
    }


    // ========================================================
    // CURRENT 30-DAY GOAL
    // ========================================================

    if (
        window.monthlySolved >=
            window.monthlyGoal &&
        window.monthlyGoal > 0
    ) {

        monthlyResult.textContent =
            `🎉 30-Day Goal Completed! You solved ${window.monthlySolved} / ${window.monthlyGoal}.`;

    }


    // Previous monthly cycle completed
    else if (
        window.previousMonthlyCompleted === true
    ) {

        monthlyResult.textContent =
            `🎉 Previous 30-day goal completed! You solved ${window.previousMonthlySolved} / ${window.monthlyGoal}.`;

    }


    // Previous monthly cycle not completed
    else if (
        window.previousMonthlyCompleted === false &&
        window.previousMonthlySolved !== null &&
        window.previousMonthlySolved !== undefined
    ) {

        monthlyResult.textContent =
            `👏 Well played! You solved ${window.previousMonthlySolved} / ${window.monthlyGoal}.`;
    }
}


// ============================================================
// UPDATE WEEKLY + MONTHLY GOAL BARS
// ============================================================

function updateGoalBars(
    weeklySolved,
    monthlySolved
) {

    if (
        !window.weeklyGoal ||
        !window.monthlyGoal
    ) {
        return;
    }


    // Weekly text
    document.getElementById(
        "weeklyGoalText"
    ).textContent =
        `${weeklySolved} / ${window.weeklyGoal}`;


    // Monthly text
    document.getElementById(
        "monthlyGoalText"
    ).textContent =
        `${monthlySolved} / ${window.monthlyGoal}`;


    // Weekly progress bar
    document.getElementById(
        "weeklyBar"
    ).style.width =
        `${Math.min(
            (weeklySolved /
                window.weeklyGoal) *
                100,
            100
        )}%`;


    // Monthly progress bar
    document.getElementById(
        "monthlyBar"
    ).style.width =
        `${Math.min(
            (monthlySolved /
                window.monthlyGoal) *
                100,
            100
        )}%`;
}


// ============================================================
// UPDATE TARGET PROGRESS
// ============================================================

function updateTargetProgress() {

    if (
        window.totalSolved === undefined ||
        window.targetGoal === undefined ||
        window.targetGoal <= 0
    ) {
        return;
    }


    // Target text
    document.getElementById(
        "targetGoalText"
    ).textContent =
        `${window.totalSolved} / ${window.targetGoal}`;


    // Calculate percentage
    const percentage =
        Math.min(
            (window.totalSolved /
                window.targetGoal) *
                100,
            100
        );


    // Target progress bar
    document.getElementById(
        "targetBar"
    ).style.width =
        `${percentage}%`;


    // Remaining problems
    document.getElementById(
        "remainingText"
    ).textContent =
        `Remaining: ${Math.max(
            window.targetGoal -
            window.totalSolved,
            0
        )}`;
}