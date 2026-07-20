const API = "https://marokip3s-api.marokip3s.workers.dev/api";

let teams = [];
let competitions = [];
let editingId = null;

const table = document.getElementById("tbody");

// ===========================
// Load Competitions
// ===========================

async function loadCompetitions() {

    try {

        const res = await fetch(API + "/competitions");

        competitions = await res.json();

        const select = document.getElementById("competition_id");

        select.innerHTML = `
            <option value="">
                Select Competition
            </option>
        `;

        competitions.forEach(c => {

            select.innerHTML += `
                <option value="${c.id}">
                    ${c.name}
                </option>
            `;

        });

    } catch (err) {

        console.error(err);
        alert("Error loading competitions");

    }

}

// ===========================
// Load Teams
// ===========================

async function loadTeams() {

    try {

        const res = await fetch(API + "/teams");

        teams = await res.json();

        renderTeams(teams);

    } catch (err) {

        console.error(err);
        alert("Error loading teams");

    }

}

// ===========================
// Render Table
// ===========================

function renderTeams(list) {

    table.innerHTML = "";

    if (list.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="7">
                No Teams Found
            </td>
        </tr>
        `;

        return;

    }

    list.forEach(team => {

        table.innerHTML += `

<tr>

<td>${team.id}</td>

<td>

<img
src="${team.logo || ''}"
width="40">

</td>

<td>${team.name}</td>

<td>${team.competition_name}</td>

<td>${team.country}</td>

<td>

${team.enabled ? "Enabled" : "Disabled"}

</td>

<td>

<button
onclick="editTeam(${team.id})">

Edit

</button>

<button
onclick="deleteTeam(${team.id})">

Delete

</button>

</td>

</tr>

`;

    });

}
// ===========================
// Search
// ===========================

function searchTeams() {

    const keyword = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = teams.filter(team => {

        return (

            String(team.id).includes(keyword) ||

            (team.name || "")
            .toLowerCase()
            .includes(keyword) ||

            (team.country || "")
            .toLowerCase()
            .includes(keyword) ||

            (team.competition_name || "")
            .toLowerCase()
            .includes(keyword)

        );

    });

    renderTeams(filtered);

}

// ===========================
// Open Modal
// ===========================

function openModal() {

    editingId = null;

    document.getElementById("modalTitle").innerText = "Add Team";

    document.getElementById("competition_id").value = "";
    document.getElementById("name").value = "";
    document.getElementById("logo").value = "";
    document.getElementById("country").value = "";
    document.getElementById("sort_order").value = "1";
    document.getElementById("enabled").value = "1";

    document.getElementById("teamModal").style.display = "flex";

}

// ===========================
// Close Modal
// ===========================

function closeModal() {

    document.getElementById("teamModal").style.display = "none";

}

// ===========================
// Edit Team
// ===========================

function editTeam(id) {

    const team = teams.find(item => item.id == id);

    if (!team) return;

    editingId = id;

    document.getElementById("modalTitle").innerText = "Edit Team";

    document.getElementById("competition_id").value = team.competition_id;
    document.getElementById("name").value = team.name;
    document.getElementById("logo").value = team.logo || "";
    document.getElementById("country").value = team.country || "";
    document.getElementById("sort_order").value = team.sort_order;
    document.getElementById("enabled").value = team.enabled;

    document.getElementById("teamModal").style.display = "flex";

}
// ===========================
// Save Team
// ===========================

async function saveTeam() {

    const data = {

        competition_id: Number(document.getElementById("competition_id").value),

        name: document.getElementById("name").value.trim(),

        logo: document.getElementById("logo").value.trim(),

        country: document.getElementById("country").value.trim(),

        sort_order: Number(document.getElementById("sort_order").value),

        enabled: Number(document.getElementById("enabled").value)

    };

    if (!data.competition_id || !data.name) {

        alert("Competition and Team Name are required");

        return;

    }

    try {

        const url = editingId
            ? API + "/teams/" + editingId
            : API + "/teams";

        const method = editingId
            ? "PUT"
            : "POST";

        await fetch(url, {

            method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        closeModal();

        loadTeams();

    } catch (err) {

        console.error(err);

        alert("Failed to save team");

    }

}

// ===========================
// Delete Team
// ===========================

async function deleteTeam(id) {

    if (!confirm("Delete this team?")) return;

    try {

        const res = await fetch(API + "/teams/" + id, {
            method: "DELETE"
        });

        if (!res.ok) {
            throw new Error("Delete failed");
        }

        await loadTeams();
        renderTeams(teams);

    } catch (err) {

        console.error(err);
        alert(err.message);

    }

}
// ===========================
// Events
// ===========================

document.getElementById("addBtn").addEventListener("click", openModal);

document.getElementById("saveBtn").addEventListener("click", saveTeam);

// ===========================
// Init
// ===========================

window.onload = async () => {

    await loadCompetitions();

    await loadTeams();

};

// ===========================
// Close Modal on Outside Click
// ===========================

window.onclick = function (event) {

    const modal = document.getElementById("teamModal");

    if (event.target === modal) {

        closeModal();

    }

};