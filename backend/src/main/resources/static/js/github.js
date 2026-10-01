const userId = 2;

document.addEventListener("DOMContentLoaded", () => {
    loadGitHubAccount();
});

function loadGitHubAccount() {

    fetch(`/users/${userId}/github-accounts`)
        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load GitHub account");
            }

            return response.json();
        })

        .then(data => {

            console.log("GitHub account data:", data);

            const status = document.getElementById("githubStatus");
            const username = document.getElementById("githubUsername");
            const repository = document.getElementById("repositoryName");

            // No GitHub account found
            if (!data || data.length === 0) {

                username.textContent = "Not connected";
                repository.textContent = "No repository selected";
                status.textContent = "● Not Connected";

                return;
            }

            // GitHub account exists
            const account = data[0];

            username.textContent =
                account.githubUsername || "Unknown";

            repository.textContent =
                account.repositoryName || "No repository selected";

            status.textContent = "● Connected";
        })

        .catch(error => {

            console.error("GitHub account error:", error);

            const status = document.getElementById("githubStatus");

            if (status) {
                status.textContent = "● Connection Error";
            }
        });
}


function syncGitHub() {

    const button = document.getElementById("syncButton");
    const message = document.getElementById("syncMessage");

    button.disabled = true;
    button.textContent = "Syncing...";

    message.textContent =
        "Synchronizing your GitHub repository. Please wait...";

    fetch(`/users/${userId}/sync`, {
        method: "POST"
    })

        .then(response => {

            if (!response.ok) {
                throw new Error("GitHub synchronization failed");
            }

            return response.text();
        })

        .then(data => {

            console.log("Sync response:", data);

            message.textContent =
                "GitHub synchronization completed successfully.";

            button.textContent = "Synced ✓";

            // Refresh GitHub account information
            loadGitHubAccount();
        })

        .catch(error => {

            console.error("Sync error:", error);

            message.textContent =
                "Synchronization failed. Please reconnect GitHub.";

            button.textContent = "Sync Now →";
        })

        .finally(() => {

            button.disabled = false;
        });
}