const userId = APP_USER_ID;


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    loadSettings();
    loadGitHubData();

    document
        .getElementById("saveSettingsBtn")
        .addEventListener("click", saveSettings);

    document
        .getElementById("viewGithubBtn")
        .addEventListener("click", viewGithubProfile);

    document
        .getElementById("testGithubBtn")
        .addEventListener("click", testGithubConnection);

    document
        .getElementById("syncGithubBtn")
        .addEventListener("click", syncGithub);

    document
        .getElementById("disconnectGithubBtn")
        .addEventListener(
            "click",
            disconnectGithub
        );


});


// ============================================================
// LOAD GENERAL SETTINGS
// ============================================================

async function loadSettings() {

    try {

        const response =
            await fetch(
                `/users/${userId}/settings`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load settings"
            );
        }

        const data =
            await response.json();


        // ----------------------------------------------------
        // PROFILE
        // ----------------------------------------------------

        document.getElementById(
            "userName"
        ).value =
            data.name || "";

        document.getElementById(
            "userEmail"
        ).value =
            data.email || "";


        // ----------------------------------------------------
        // GOALS
        // ----------------------------------------------------

        document.getElementById(
            "weeklyGoal"
        ).value =
            data.weeklyGoal ?? "";

        document.getElementById(
            "monthlyGoal"
        ).value =
            data.monthlyGoal ?? "";

        document.getElementById(
            "targetGoal"
        ).value =
            data.targetGoal ?? "";


    } catch (error) {

        console.error(
            "Failed to load settings:",
            error
        );

        showGithubMessage(
            "Unable to load general settings.",
            "error"
        );
    }
}


// ============================================================
// LOAD GITHUB DATA
// ============================================================

async function loadGitHubData() {

    setGithubStatus(
        "checking"
    );

    try {

        // ----------------------------------------------------
        // 1. Check GitHub connection
        // ----------------------------------------------------

        const connectionResponse =
            await fetch(
                `/users/${userId}/github-connected`
            );

        if (!connectionResponse.ok) {
            throw new Error(
                "Unable to check GitHub connection"
            );
        }

        const connected =
            await connectionResponse.json();


        if (!connected) {

            handleGithubDisconnected();

            return;
        }


        // ----------------------------------------------------
        // 2. Get GitHub account
        // ----------------------------------------------------

        const accountResponse =
            await fetch(
                `/users/${userId}/github-accounts`
            );

        if (!accountResponse.ok) {
            throw new Error(
                "Unable to load GitHub account"
            );
        }

        const accounts =
            await accountResponse.json();


        if (
            !accounts ||
            accounts.length === 0
        ) {

            handleGithubDisconnected();

            return;
        }


        const account =
            accounts[0];

            if (account.lastSyncedAt) {
                document.getElementById("lastSyncText").textContent =
                    formatLastSync(account.lastSyncedAt);
            } else {
                document.getElementById("lastSyncText").textContent =
                    "Not synced yet";
            }


        // ----------------------------------------------------
        // 3. Display username
        // ----------------------------------------------------

        const username =
            account.githubUsername || "";


        document.getElementById(
            "githubUsername"
        ).textContent =
            username
                ? `@${username}`
                : "Unknown";


        // Save account ID for later
        window.githubAccountId =
            account.id;


        // Save username globally
        window.githubUsername =
            username;


        // Save selected repository
        window.selectedRepository =
            account.repositoryName;


        // ----------------------------------------------------
        // 4. Connected status
        // ----------------------------------------------------

        setGithubStatus(
            "connected"
        );


        document.getElementById(
            "githubConnectionTitle"
        ).textContent =
            "GitHub connection active";


        document.getElementById(
            "githubConnectionMessage"
        ).textContent =
            "Your GitHub account is connected and ready to sync.";


        // ----------------------------------------------------
        // 5. Load repositories
        // ----------------------------------------------------

        await loadRepositories();


        // ----------------------------------------------------
        // 6. Load statistics
        // ----------------------------------------------------

        await loadGithubStatistics();


    } catch (error) {

        console.error(
            "GitHub loading error:",
            error
        );

        setGithubStatus(
            "disconnected"
        );

        document.getElementById(
            "githubConnectionTitle"
        ).textContent =
            "GitHub connection error";


        document.getElementById(
            "githubConnectionMessage"
        ).textContent =
            error.message;


        showGithubMessage(
            error.message,
            "error"
        );
    }
}


// ============================================================
// LOAD GITHUB REPOSITORIES
// ============================================================

async function loadRepositories() {

    const repositoryDisplay =
        document.getElementById("repositoryName");

    repositoryDisplay.textContent = "Loading...";

    try {

        const response =
            await fetch(
                `/users/${userId}/github-accounts`
            );

        if (!response.ok) {
            throw new Error(
                "Failed to load GitHub account"
            );
        }

        const accounts =
            await response.json();

        if (
            !accounts ||
            accounts.length === 0
        ) {
            repositoryDisplay.textContent =
                "No repository selected";

            document.getElementById(
                "githubRepositoryCount"
            ).textContent = "—";

            return;
        }

        const account = accounts[0];

        repositoryDisplay.textContent =
            account.repositoryName ||
            "No repository selected";

        window.selectedRepository =
            account.repositoryName;

        // Repository count can still come from GitHub
        const repositoriesResponse =
            await fetch(
                `/users/${userId}/github-repositories`
            );

        if (repositoriesResponse.ok) {

            const repositories =
                await repositoriesResponse.json();

            document.getElementById(
                "githubRepositoryCount"
            ).textContent =
                repositories.length;
        }

    } catch (error) {

        console.error(
            "Repository loading error:",
            error
        );

        repositoryDisplay.textContent =
            "Unable to load repository";
    }
}


// ============================================================
// CHANGE SELECTED REPOSITORY
// ============================================================

//async function changeRepository() {
//
//    const select =
//        document.getElementById(
//            "repositoryName"
//        );
//
//    const repositoryName =
//        select.value;
//
//
//    if (!repositoryName) {
//        return;
//    }
//
//
//    if (!window.githubAccountId) {
//
//        showGithubMessage(
//            "GitHub account not found.",
//            "error"
//        );
//
//        return;
//    }
//
//
//    try {
//
//        select.disabled = true;
//
//
//        const response =
//            await fetch(
//                `/github-accounts/${window.githubAccountId}/repository?repositoryName=${encodeURIComponent(repositoryName)}`,
//                {
//                    method: "PUT"
//                }
//            );
//
//
//        if (!response.ok) {
//
//            const errorText =
//                await response.text();
//
//            throw new Error(
//                errorText ||
//                "Failed to update repository"
//            );
//        }
//
//
//        const account =
//            await response.json();
//
//
//        window.selectedRepository =
//            account.repositoryName;
//
//
//        showGithubMessage(
//            `Repository changed to ${repositoryName}.`,
//            "success"
//        );
//
//
//    } catch (error) {
//
//        console.error(
//            "Repository update error:",
//            error
//        );
//
//        showGithubMessage(
//            error.message,
//            "error"
//        );
//
//
//        // Restore previous value
//        await loadRepositories();
//
//
//    } finally {
//
//        select.disabled = false;
//    }
//}


// ============================================================
// VIEW GITHUB PROFILE
// ============================================================

function viewGithubProfile() {

    if (!window.githubUsername) {

        showGithubMessage(
            "GitHub username is not available.",
            "error"
        );

        return;
    }


    const url =
        `https://github.com/${encodeURIComponent(
            window.githubUsername
        )}`;


    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}


// ============================================================
// TEST GITHUB CONNECTION
// ============================================================

async function testGithubConnection() {

    const button =
        document.getElementById(
            "testGithubBtn"
        );


    try {

        button.classList.add(
            "loading"
        );

        button.textContent =
            "Checking...";


        const response =
            await fetch(
                `/users/${userId}/github-connected`
            );


        if (!response.ok) {
            throw new Error(
                "Unable to test GitHub connection"
            );
        }


        const connected =
            await response.json();


        if (connected) {

            setGithubStatus(
                "connected"
            );


            document.getElementById(
                "githubConnectionTitle"
            ).textContent =
                "Connection successful";


            document.getElementById(
                "githubConnectionMessage"
            ).textContent =
                "GitHub is connected and accessible.";


            showGithubMessage(
                "✓ GitHub connection is working.",
                "success"
            );

        } else {

            handleGithubDisconnected();

            showGithubMessage(
                "GitHub is not connected.",
                "error"
            );
        }


    } catch (error) {

        console.error(
            "GitHub connection test failed:",
            error
        );


        setGithubStatus(
            "disconnected"
        );


        showGithubMessage(
            error.message,
            "error"
        );


    } finally {

        button.classList.remove(
            "loading"
        );

        button.textContent =
            "✓ Test Connection";
    }
}


// ============================================================
// SYNC GITHUB
// ============================================================

async function syncGithub() {

    const button =
        document.getElementById(
            "syncGithubBtn"
        );
        let syncSucceeded = false;


    try {

        button.classList.add(
            "loading"
        );

        button.textContent =
            "⟳ Syncing GitHub...";


        showGithubMessage(
            "Syncing your GitHub solutions. Please wait...",
            "info"
        );


        const response =
            await fetch(
                `/users/${userId}/sync`,
                {
                    method: "POST"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "GitHub sync failed"
            );
        }


        const message =
            await response.text();


        console.log(
            "GitHub sync result:",
            message
        );


        showGithubMessage(
            "✓ GitHub sync completed successfully.",
            "success"
        );
        syncSucceeded = true;


        // Update last sync display
        await loadGitHubData();
        button.disabled = true;
        button.textContent = "✓ Already Synced";
        button.classList.add("synced");


        // Refresh statistics
        await loadGithubStatistics();


        // Refresh repository information
        await loadRepositories();


    } catch (error) {

        console.error(
            "GitHub sync failed:",
            error
        );


        showGithubMessage(
            `Sync failed: ${error.message}`,
            "error"
        );


    }finally {

         button.classList.remove(
             "loading"
         );

         if (syncSucceeded) {

             button.disabled = true;

             button.textContent =
                 "✓ Already Synced";

             button.classList.add(
                 "synced"
             );

         } else {

             button.disabled = false;

             button.textContent =
                 "⟳ Sync GitHub Now";

         }
     }
}


// ============================================================
// LOAD GITHUB STATISTICS
// ============================================================

async function loadGithubStatistics() {

    try {

        const response =
            await fetch(
                `/users/${userId}/progress-db`
            );


        if (!response.ok) {
            return;
        }


        const data =
            await response.json();


        /*
         * The existing DSAProgressResponse contains
         * the total solved count.
         */

        if (
            data &&
            data.totalSolved !== undefined
        ) {

            document.getElementById(
                "githubProblemsCount"
            ).textContent =
                data.totalSolved;
        }


    } catch (error) {

        console.error(
            "Failed to load GitHub statistics:",
            error
        );
    }
}


// ============================================================
// DISCONNECT GITHUB
// ============================================================

async function disconnectGithub() {

    if (!window.githubAccountId) {

        showGithubMessage(
            "GitHub account not found.",
            "error"
        );

        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to disconnect GitHub?\n\nYour existing DSA progress will not be deleted."
        );


    if (!confirmed) {
        return;
    }


    const button =
        document.getElementById(
            "disconnectGithubBtn"
        );


    try {

        button.disabled = true;

        button.textContent =
            "Disconnecting...";


        const response =
            await fetch(
                `/github-accounts/${window.githubAccountId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText ||
                "Failed to disconnect GitHub"
            );
        }


        handleGithubDisconnected();


        showGithubMessage(
            "GitHub disconnected successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "GitHub disconnect failed:",
            error
        );


        showGithubMessage(
            error.message,
            "error"
        );


    } finally {

        button.disabled = false;

        button.textContent =
            "Disconnect";
    }
}


// ============================================================
// HANDLE DISCONNECTED STATE
// ============================================================

function handleGithubDisconnected() {

    setGithubStatus(
        "disconnected"
    );


    document.getElementById(
        "githubUsername"
    ).textContent =
        "Not connected";


    document.getElementById(
        "githubConnectionTitle"
    ).textContent =
        "GitHub not connected";


    document.getElementById(
        "githubConnectionMessage"
    ).textContent =
        "Connect a GitHub account to start tracking your solutions.";


    const select =
        document.getElementById(
            "repositoryName"
        );


    select.innerHTML = "";


    const option =
        document.createElement(
            "option"
        );

    option.value = "";

    option.textContent =
        "Connect GitHub first";

    select.appendChild(
        option
    );


    select.disabled = true;


    document.getElementById(
        "githubProblemsCount"
    ).textContent = "—";


    document.getElementById(
        "githubRepositoryCount"
    ).textContent = "—";


    document.getElementById(
        "viewGithubBtn"
    ).disabled = true;


    document.getElementById(
        "testGithubBtn"
    ).disabled = true;


    document.getElementById(
        "syncGithubBtn"
    ).disabled = true;


    document.getElementById(
        "lastSyncText"
    ).textContent =
        "Not connected";


    window.githubAccountId =
        null;

    window.githubUsername =
        null;

    window.selectedRepository =
        null;
}


// ============================================================
// SET GITHUB STATUS BADGE
// ============================================================

function setGithubStatus(status) {

    const badge =
        document.getElementById(
            "githubStatusBadge"
        );


    badge.classList.remove(
        "connected",
        "disconnected",
        "checking"
    );


    if (status === "connected") {

        badge.classList.add(
            "connected"
        );

        badge.textContent =
            "● Connected";


        enableGithubActions();

    } else if (status === "disconnected") {

        badge.classList.add(
            "disconnected"
        );

        badge.textContent =
            "● Not Connected";


    } else {

        badge.classList.add(
            "checking"
        );

        badge.textContent =
            "Checking...";
    }
}


// ============================================================
// ENABLE GITHUB ACTIONS
// ============================================================

function enableGithubActions() {

    document.getElementById(
        "repositoryName"
    ).disabled = false;


    document.getElementById(
        "viewGithubBtn"
    ).disabled = false;


    document.getElementById(
        "testGithubBtn"
    ).disabled = false;


    document.getElementById(
        "syncGithubBtn"
    ).disabled = false;
}


// ============================================================
// SHOW GITHUB MESSAGE
// ============================================================

function showGithubMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "githubMessage"
        );


    element.textContent =
        message;


    element.className =
        `github-message ${type}`;
}


// ============================================================
// SAVE GENERAL SETTINGS
// ============================================================

async function saveSettings() {

    const payload = {

        name:
            document
                .getElementById("userName")
                .value
                .trim(),

        email:
            document
                .getElementById("userEmail")
                .value
                .trim(),

        repositoryName:
            document
                .getElementById("repositoryName")
                .value
                .trim(),

        weeklyGoal:
            Number(
                document
                    .getElementById("weeklyGoal")
                    .value
            ),

        monthlyGoal:
            Number(
                document
                    .getElementById("monthlyGoal")
                    .value
            ),

        targetGoal:
            Number(
                document
                    .getElementById("targetGoal")
                    .value
            )
    };


    const message =
        document.getElementById(
            "saveMessage"
        );


    try {

        const response =
            await fetch(
                `/users/${userId}/settings`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );
        }


        await response.json();


        message.style.color =
            "green";

        message.textContent =
            "Settings saved successfully.";


        await loadSettings();


    } catch (error) {

        message.style.color =
            "red";

        message.textContent =
            error.message;

        console.error(
            "Settings save error:",
            error
        );
    }

}

function formatLastSync(dateTime) {

    const date = new Date(dateTime);

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}