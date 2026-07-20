const API = "https://marokip3s-api.marokip3s.workers.dev/api";

const modal = document.getElementById("matchModal");
const modalTitle = document.getElementById("modalTitle");
const saveBtn = document.querySelector(".saveBtn");

let editingId = null;
let allMatches = [];
let competitions = [];
let teams = [];

function openModal() {
    modal.style.display = "block";
}

function closeModal() {

    modal.style.display = "none";

    editingId = null;

    modalTitle.innerText = "Add Match";
    saveBtn.innerText = "Save Match";

    document.getElementById("team1").value = "";
    document.getElementById("team2").value = "";
    document.getElementById("competition").value = "";
    document.getElementById("start_time").value = "";
    document.getElementById("status").value = "Upcoming";

}

window.onclick = function(e) {

    if (e.target === modal) {
        closeModal();
    }

};

async function loadMatches() {

    try {

        const res = await fetch(API + "/matches");

        allMatches = await res.json();

        renderMatches(allMatches);

    } catch (err) {

        console.error(err);
        alert("Error loading matches");

    }

}

function renderMatches(matches) {

    let html = "";

    matches.forEach(match => {

        html += `
        <tr>

            <td>${match.id}</td>

            <td>${match.team1_name}</td>

            <td>${match.team2_name}</td>

            <td>${match.competition_name}</td>

            <td>${match.start_time}</td>

            <td>
                <span class="status ${match.status.toLowerCase()}">
                    ${match.status}
                </span>
            </td>

            <td>

                <button
                    class="editBtn"
                    onclick="editMatch(${match.id})">
                    ✏️
                </button>

                <button
                    class="deleteBtn"
                    onclick="deleteMatch(${match.id})">
                    🗑️
                </button>

            </td>

        </tr>
        `;

    });

    document.getElementById("matches").innerHTML = html;

}
function searchMatches() {

    const keyword = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = allMatches.filter(match => {

        return (
            match.team1.toLowerCase().includes(keyword) ||
            match.team2.toLowerCase().includes(keyword) ||
            match.competition.toLowerCase().includes(keyword) ||
            match.status.toLowerCase().includes(keyword)
        );

    });

    renderMatches(filtered);

}

function editMatch(id) {

    const match = allMatches.find(m => m.id == id);

    if (!match) return;

    editingId = id;

    document.getElementById("team1").value = match.team1_id;
document.getElementById("team2").value = match.team2_id;
document.getElementById("competition").value = match.competition_id;

    document.getElementById("start_time").value = match.start_time;

    document.getElementById("status").value = match.status;

    modalTitle.innerText = "Edit Match";
    saveBtn.innerText = "Update Match";

    openModal();

}
async function saveMatch() {

    const data = {
    competition_id: Number(document.getElementById("competition").value),
    team1_id: Number(document.getElementById("team1").value),
    team2_id: Number(document.getElementById("team2").value),
    start_time: document.getElementById("start_time").value,
    status: document.getElementById("status").value
};

    if (
    !data.team1_id ||
    !data.team2_id ||
    !data.competition_id ||
    !data.start_time
) {
    alert("Please fill all fields");
    return;
    }

    try {

        let url = API + "/matches";
        let method = "POST";

        if (editingId !== null) {
            url = API + "/matches/" + editingId;
            method = "PUT";
        }

        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!result.success) {
            alert(result.message || result.error);
            return;
        }

        alert(editingId === null ? "Match Added Successfully" : "Match Updated Successfully");

        closeModal();
        await loadMatches();

    } catch (err) {

        console.error(err);
        alert("Server Error");

    }

}

async function deleteMatch(id) {

    if (!confirm("Are you sure you want to delete this match?")) {
        return;
    }

    try {

        const res = await fetch(API + "/matches/" + id, {
            method: "DELETE"
        });

        const result = await res.json();

        if (!result.success) {
            alert(result.message || result.error);
            return;
        }

        alert("Match Deleted Successfully");

        await loadMatches();

    } catch (err) {

        console.error(err);
        alert("Server Error");

    }

}

// ===========================
// Load Competitions
// ===========================

async function loadCompetitions() {

    try {

        const res = await fetch(API + "/competitions");

        competitions = await res.json();

        const select = document.getElementById("competition");

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

    }

}

// ===========================
// Load Teams
// ===========================

async function loadTeams() {

    try {

        const res = await fetch(API + "/teams");

        teams = await res.json();

        const home = document.getElementById("team1");
        const away = document.getElementById("team2");

        home.innerHTML = `
            <option value="">
                Select Home Team
            </option>
        `;

        away.innerHTML = `
            <option value="">
                Select Away Team
            </option>
        `;

        teams.forEach(team => {

            const option = `
                <option value="${team.id}">
                    ${team.name}
                </option>
            `;

            home.innerHTML += option;
            away.innerHTML += option;

        });

    } catch (err) {

        console.error(err);

    }

}
window.onload = async () => {

    await loadCompetitions();

    await loadTeams();

    await loadMatches();

};