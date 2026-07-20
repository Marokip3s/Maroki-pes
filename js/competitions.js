const API = "https://marokip3s-api.marokip3s.workers.dev/api";

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

        renderCompetitions(competitions);

    } catch (err) {

        console.error(err);
        alert("Error loading competitions");

    }

}

// ===========================
// Render Table
// ===========================

function renderCompetitions(list) {

    table.innerHTML = "";

    if (list.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="7">
                No Competitions Found
            </td>
        </tr>
        `;

        return;

    }

    list.forEach(c => {

        table.innerHTML += `

<tr>

<td>${c.id}</td>

<td>
<img src="${c.logo || ''}" width="40">
</td>

<td>${c.name}</td>

<td>${c.country}</td>

<td>${c.season}</td>

<td>${c.enabled ? "Enabled" : "Disabled"}</td>

<td>

<button onclick="editCompetition(${c.id})">
Edit
</button>

<button onclick="deleteCompetition(${c.id})">
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

function searchCompetitions() {

    const keyword = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = competitions.filter(c => {

        return (
            String(c.id).includes(keyword) ||
            (c.name || "").toLowerCase().includes(keyword) ||
            (c.country || "").toLowerCase().includes(keyword) ||
            (c.season || "").toLowerCase().includes(keyword)
        );

    });

    renderCompetitions(filtered);

}

// ===========================
// Open Modal
// ===========================

function openModal() {

    editingId = null;

    document.getElementById("modalTitle").innerText = "Add Competition";

    document.getElementById("name").value = "";
    document.getElementById("logo").value = "";
    document.getElementById("country").value = "";
    document.getElementById("season").value = "";
    document.getElementById("sort_order").value = "1";
    document.getElementById("enabled").value = "1";

    document.getElementById("competitionModal").style.display = "flex";

}

// ===========================
// Close Modal
// ===========================

function closeModal() {

    document.getElementById("competitionModal").style.display = "none";

}

// ===========================
// Edit Competition
// ===========================

function editCompetition(id) {

    const competition = competitions.find(item => item.id == id);

    if (!competition) return;

    editingId = id;

    document.getElementById("modalTitle").innerText = "Edit Competition";

    document.getElementById("name").value = competition.name;
    document.getElementById("logo").value = competition.logo || "";
    document.getElementById("country").value = competition.country || "";
    document.getElementById("season").value = competition.season || "";
    document.getElementById("sort_order").value = competition.sort_order;
    document.getElementById("enabled").value = competition.enabled;

    document.getElementById("competitionModal").style.display = "flex";

}
// ===========================
// Delete Competition
// ===========================

async function deleteCompetition(id) {

    if (!confirm("Delete this competition?"))
        return;

    try {

        const res = await fetch(API + "/competitions/" + id, {
            method: "DELETE"
        });

        const result = await res.json();

        if (!result.success) {
            alert(result.error || result.message || "Delete failed");
            return;
        }

        loadCompetitions();

    } catch (err) {

        console.error(err);
        alert("Server Error");

    }

}

// ===========================
// Save Competition
// ===========================

async function saveCompetition() {

    const data = {

        name: document.getElementById("name").value.trim(),
        logo: document.getElementById("logo").value.trim(),
        country: document.getElementById("country").value.trim(),
        season: document.getElementById("season").value.trim(),
        sort_order: Number(document.getElementById("sort_order").value),
        enabled: Number(document.getElementById("enabled").value)

    };

    if (
        !data.name ||
        !data.country ||
        !data.season
    ) {

        alert("Please fill all required fields.");
        return;

    }

    let endpoint = API + "/competitions";
    let method = "POST";

    if (editingId !== null) {

        endpoint = API + "/competitions/" + editingId;
        method = "PUT";

    }

    try {

        const res = await fetch(endpoint, {

            method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        const result = await res.json();

        if (!result.success) {

            alert(result.error || result.message || "Operation failed");
            return;

        }

        closeModal();

        loadCompetitions();

    } catch (err) {

        console.error(err);
        alert("Server Error");

    }

}
// ===========================
// Events
// ===========================

window.onload = function () {

    const addBtn = document.getElementById("addBtn");
    const saveBtn = document.getElementById("saveBtn");

    if (addBtn) {
        addBtn.addEventListener("click", openModal);
    }

    if (saveBtn) {
        saveBtn.addEventListener("click", saveCompetition);
    }

    window.addEventListener("click", function (e) {

        const modal = document.getElementById("competitionModal");

        if (e.target === modal) {
            closeModal();
        }

    });

    loadCompetitions();

  };