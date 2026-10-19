
const userId = APP_USER_ID;

// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    loadGitHubData();

    document.getElementById("saveSettingsBtn")
        ?.addEventListener("click", saveSettings);

    document.getElementById("viewGithubBtn")
        ?.addEventListener("click", viewGithubProfile);

    document.getElementById("testGithubBtn")
        ?.addEventListener("click", testGithubConnection);

    document.getElementById("syncGithubBtn")
        ?.addEventListener("click", syncGithub);

    document.getElementById("disconnectGithubBtn")
        ?.addEventListener("click", disconnectGithub);

    document.getElementById("connectGithubBtn")
        ?.addEventListener("click", connectGithub);

    // Receive successful OAuth notification from the popup.
    window.addEventListener("message", async (event) => {
        if (event.origin !== window.location.origin) {
            return;
        }

        if (event.data?.type !== "GITHUB_OAUTH_SUCCESS") {
            return;
        }

        showGithubMessage(
            "GitHub connected successfully!",
            "success"
        );

        const button = document.getElementById("connectGithubBtn");
        if (button) {
            button.disabled = false;
        }

        await loadGitHubData();
    });
});

// ============================================================
// CONNECT GITHUB
// ============================================================

function connectGithub() {
    const button = document.getElementById("connectGithubBtn");

    const popup = window.open(
        `/github/login?userId=${encodeURIComponent(userId)}`,
        "githubOAuthPopup",
        "width=600,height=750,resizable=yes,scrollbars=yes"
    );

    if (!popup) {
        showGithubMessage(
            "Popup blocked. Allow popups for this site and try again.",
            "error"
        );
        return;
    }

    showGithubMessage(
        "Complete GitHub authorization in the popup.",
        "info"
    );

    button.disabled = true;
    button.textContent = "Waiting for GitHub...";
}


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

        const savedProfile = localStorage.getItem(`dsaProfile_${userId}`);

        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            document.getElementById("userName").value =
                profile.name || data.name || "";
        } else {
            document.getElementById("userName").value =
                data.name || "";
        }

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

    const connectButton = document.getElementById("connectGithubBtn");

    if (connectButton) {
        connectButton.hidden = true;
    }

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
    const select = document.getElementById("repositoryName");

    if (!select) {
        console.error("Repository dropdown not found.");
        return;
    }

    select.disabled = true;
    select.innerHTML = '<option value="">Loading repositories...</option>';

    try {
        // Get the connected GitHub account.
        const accountResponse = await fetch(
            `/users/${userId}/github-accounts`
        );

        if (!accountResponse.ok) {
            throw new Error("Failed to load GitHub account.");
        }

        const accounts = await accountResponse.json();

        if (!accounts || accounts.length === 0) {
            select.innerHTML =
                '<option value="">Connect GitHub first</option>';
            return;
        }

        const account = accounts[0];
        window.githubAccountId = account.id;
        window.githubUsername = account.githubUsername;

        // Fetch repositories available to this GitHub account.
        const response = await fetch(
            `/users/${userId}/github-repositories`
        );

        if (!response.ok) {
            throw new Error(
                `Could not load repositories (HTTP ${response.status}).`
            );
        }

        const repositories = await response.json();
        const savedRepository = account.repositoryName || "";

        select.innerHTML = "";

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Select a repository";
        select.appendChild(placeholder);

        repositories.forEach(repository => {
            const option = document.createElement("option");
            option.value = repository.name;
            option.textContent = repository.name;
            select.appendChild(option);
        });

        // Restore the previously saved repository, if available.
        if (
            savedRepository &&
            repositories.some(repo => repo.name === savedRepository)
        ) {
            select.value = savedRepository;
        } else {
            select.value = "";
        }

        window.selectedRepository = select.value || null;

        document.getElementById("githubRepositoryCount").textContent =
            repositories.length;

        select.disabled = false;

        // Register the change handler only once.
        if (select.dataset.changeHandlerAttached !== "true") {
            select.addEventListener("change", changeRepository);
            select.dataset.changeHandlerAttached = "true";
        }

    } catch (error) {
        console.error("Repository loading error:", error);

        select.innerHTML =
            '<option value="">Unable to load repositories</option>';

        select.disabled = true;
        showGithubMessage(error.message, "error");
    }
}




async function changeRepository() {
    const select = document.getElementById("repositoryName");
    const repositoryName = select.value;

    if (!repositoryName || !window.githubAccountId) {
        return;
    }

    const previousRepository = window.selectedRepository;

    select.disabled = true;

    try {
        const response = await fetch(
            `/github-accounts/${window.githubAccountId}/repository?repositoryName=${encodeURIComponent(repositoryName)}`,
            { method: "PUT" }
        );

        if (!response.ok) {
            throw new Error(
                (await response.text()) ||
                "Failed to save repository selection."
            );
        }

        const account = await response.json();

        window.selectedRepository = account.repositoryName;

        showGithubMessage(
            `Repository changed to ${account.repositoryName}.`,
            "success"
        );

    } catch (error) {
        console.error("Repository update error:", error);

        showGithubMessage(error.message, "error");

        select.value = previousRepository || "";
    } finally {
        select.disabled = false;
    }
}



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

        const connectButton = document.getElementById("connectGithubBtn");

        if (connectButton) {
            connectButton.hidden = false;
            connectButton.disabled = false;
            connectButton.textContent = "◈ Connect GitHub";
        }
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

/* Profile photo selection and preview */


/* Profile photo preview and persistence */

//document.addEventListener("DOMContentLoaded", () => {
//    const photo = document.getElementById("profilePhoto");
//    const fileInput = document.getElementById("profilePhotoInput");
//
//    if (!photo || !fileInput) {
//        console.error("Profile photo elements were not found.");
//        return;
//    }
//
//    const STORAGE_KEY = "profilePhoto";
//    const defaultPhoto = photo.src;
//
//    try {
//        const savedPhoto = localStorage.getItem(STORAGE_KEY);
//        if (savedPhoto) {
//            photo.src = savedPhoto;
//        }
//    } catch (error) {
//        console.error("Could not restore saved photo:", error);
//    }
//
//    fileInput.addEventListener("change", () => {
//        const file = fileInput.files?.[0];
//        if (!file) return;
//
//        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
//            alert("Select a PNG, JPG, or WebP image.");
//            fileInput.value = "";
//            return;
//        }
//
//        if (file.size > 5 * 1024 * 1024) {
//            alert("Select an image smaller than 5 MB.");
//            fileInput.value = "";
//            return;
//        }
//
//        const reader = new FileReader();
//
//        reader.onload = () => {
//            photo.src = reader.result;
//
//            try {
//                localStorage.setItem(STORAGE_KEY, reader.result);
//            } catch (error) {
//                console.error("Photo preview works, but saving failed:", error);
//                alert("The photo preview works, but browser storage failed. Check the Console.");
//            }
//        };
//
//        reader.onerror = () => {
//            console.error("Failed to read the selected image.");
//            alert("Could not read the selected image.");
//        };
//
//        reader.readAsDataURL(file);
//    });
//});


/* ============================================================
   USER PROFILE: LOAD, SAVE, PHOTO PREVIEW, AND CANCEL
   Temporary persistence with localStorage
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const photo = document.getElementById("profilePhoto");
    const photoInput = document.getElementById("profilePhotoInput");
    const saveButton = document.getElementById("saveProfileBtn");
    const cancelButton = document.getElementById("cancelProfileBtn");
    const message = document.getElementById("profileMessage");


const fields = {
    name: document.getElementById("userName"),
    linkedin: document.getElementById("userLinkedIn"),
    phone: document.getElementById("userPhone")
};

// ADD THE LINKEDIN CODE HERE
const linkedinLink = document.getElementById("linkedinProfileLink");

function updateLinkedInLink(url) {
    if (!linkedinLink) return;

    const value = (url || "").trim();
    const isValidLinkedIn =
        /^https:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9_%\-]+\/?$/i.test(value);

    if (isValidLinkedIn) {
        linkedinLink.href = value;
        linkedinLink.hidden = false;
    } else {
        linkedinLink.removeAttribute("href");
        linkedinLink.hidden = true;
    }
}

fields.linkedin.addEventListener("input", () => {
    updateLinkedInLink(fields.linkedin.value);
});

updateLinkedInLink(fields.linkedin.value);

// YOUR EXISTING PROFILE CODE CONTINUES BELOW


    if (!photo || !photoInput || !saveButton || !cancelButton ||
        !fields.name || !fields.linkedin || !fields.phone) {
        console.error("Profile form elements are missing.");
        return;
    }

    const storageKey = `dsaProfile_${userId}`;
    const defaultPhoto = photo.src;
    let savedProfile = null;
    let pendingPhoto = null;

    function getCurrentProfile() {
        return {
            name: fields.name.value.trim(),
            linkedin: fields.linkedin.value.trim(),
            phone: fields.phone.value.trim(),
            photo: pendingPhoto || photo.src
        };
    }

    function showMessage(text, isError = false) {
        message.textContent = text;
        message.style.color = isError ? "red" : "green";
    }

    function updateDisplayedName(name) {
        document.querySelectorAll(".top-user strong, .sidebar-user strong")
            .forEach(element => {
                element.textContent = name || "User";
            });

        document.querySelectorAll(".top-user .avatar, .sidebar-user .avatar")
            .forEach(element => {
                element.textContent = (name || "U").charAt(0).toUpperCase();
            });
    }

    function applyProfile(profile) {
        updateLinkedInLink(profile.linkedin);
        fields.name.value = profile.name || "";
        fields.linkedin.value = profile.linkedin || "";
        fields.phone.value = profile.phone || "";
        photo.src = profile.photo || defaultPhoto;
        updateDisplayedName(profile.name);
    }

    function readSavedProfile() {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error("Could not load saved profile:", error);
            return null;
        }
    }

    // Load profile data saved in this browser.
    savedProfile = readSavedProfile();

    if (savedProfile) {
        applyProfile(savedProfile);
    } else {
        savedProfile = getCurrentProfile();
        savedProfile.photo = defaultPhoto;
    }

    // Keep the existing backend-loaded name unless a local profile exists.
    // loadSettings() may finish after this listener, so reapply saved values
    // after the existing settings request completes.
    const originalLoadSettings = window.loadSettings;
    if (typeof originalLoadSettings === "function") {
        window.loadSettings = async function (...args) {
            await originalLoadSettings.apply(this, args);

            const storedProfile = readSavedProfile();
            if (storedProfile) {
                savedProfile = storedProfile;
                applyProfile(storedProfile);
            } else {
                updateDisplayedName(fields.name.value.trim());
                savedProfile = getCurrentProfile();
                savedProfile.photo = defaultPhoto;
            }
        };
    }

    // Preview a selected image. Do not permanently save until Save Changes.
    photoInput.addEventListener("change", () => {
    console.log("Photo input changed");
        const file = photoInput.files?.[0];
        console.log("Selected file:", file);
        if (!file) return;

        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            showMessage("Choose a PNG, JPG, or WebP image.", true);
            photoInput.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showMessage("Choose an image smaller than 5 MB.", true);
            photoInput.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            pendingPhoto = reader.result;
            photo.src = pendingPhoto;
            showMessage("Photo preview updated. Click Save Changes to keep it.");
        };

        reader.onerror = () => {
            showMessage("Unable to read the selected image.", true);
        };

        reader.readAsDataURL(file);
    });

    // Save profile fields together in browser storage.
    saveButton.addEventListener("click", () => {
        const name = fields.name.value.trim();
        const linkedin = fields.linkedin.value.trim();
        const phone = fields.phone.value.trim();

        if (!name) {
            showMessage("Username cannot be empty.", true);
            fields.name.focus();
            return;
        }

        if (linkedin && !/^https:\/\/(www\.)?linkedin\.com\/.+/i.test(linkedin)) {
            showMessage("Enter a valid LinkedIn profile URL starting with https://.", true);
            fields.linkedin.focus();
            return;
        }

        const profile = {
            name,
            linkedin,
            phone,
            photo: pendingPhoto || photo.src || defaultPhoto
        };

        try {
            localStorage.setItem(storageKey, JSON.stringify(profile));
            savedProfile = profile;
            pendingPhoto = null;
            photoInput.value = "";
            updateDisplayedName(name);
            showMessage("Profile saved successfully in this browser.");
        } catch (error) {
            console.error("Could not save profile:", error);
            showMessage("Unable to save profile. The photo may be too large for browser storage.", true);
        }
    });

    // Restore the last saved profile.
    cancelButton.addEventListener("click", () => {
        const storedProfile = readSavedProfile();

        if (storedProfile) {
            savedProfile = storedProfile;
            applyProfile(storedProfile);
        } else {
            applyProfile({
                name: fields.name.value,
                linkedin: "",
                phone: "",
                photo: defaultPhoto
            });
        }

        pendingPhoto = null;
        photoInput.value = "";
        showMessage("Unsaved changes cancelled.");
    });
});


