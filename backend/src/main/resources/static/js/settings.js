const userId = 2;

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();

    document.getElementById("saveSettingsBtn")
        .addEventListener("click", saveSettings);
});

async function loadSettings() {
    try {
        const response = await fetch(`/users/${userId}/settings`);
        const data = await response.json();

        // Profile
        document.getElementById("userName").value = data.name;
        document.getElementById("userEmail").value = data.email;

        // GitHub
        document.getElementById("githubUsername").value = data.githubUsername || "";
        document.getElementById("repositoryName").value = data.repositoryName || "";
        document.getElementById("githubStatus").textContent =
            data.connected ? "Connected" : "Not Connected";

        // Goals
        document.getElementById("weeklyGoal").value = data.weeklyGoal;
        document.getElementById("monthlyGoal").value = data.monthlyGoal;
        document.getElementById("targetGoal").value = data.targetGoal;

    } catch (error) {
        console.error("Failed to load settings:", error);
    }
}

async function saveSettings() {
    const payload = {
        name: document.getElementById("userName").value.trim(),
        email: document.getElementById("userEmail").value.trim(),
        repositoryName: document.getElementById("repositoryName").value.trim(),
        weeklyGoal: Number(document.getElementById("weeklyGoal").value),
        monthlyGoal: Number(document.getElementById("monthlyGoal").value),
        targetGoal: Number(document.getElementById("targetGoal").value)
    };

    const message = document.getElementById("saveMessage");

    try {
        const response = await fetch(`/users/${userId}/settings`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();

        message.style.color = "green";
        message.textContent = "Settings saved successfully.";

        // Reload latest values from DB
        await loadSettings();

    } catch (error) {
        message.style.color = "red";
        message.textContent = error.message;
        console.error(error);
    }
}