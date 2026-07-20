const API = "https://marokip3s-api.marokip3s.workers.dev/api";

let servers = [];
let matches = [];
let editingId = null;

const table = document.getElementById("serversTable");
const modal = document.getElementById("serverModal");
const modalTitle = document.getElementById("modalTitle");
const saveBtn = document.getElementById("saveBtn");

// ===========================
// Load Matches
// ===========================

async function loadMatches() {

    const res = await fetch(API + "/matches");
    const matches = await res.json();

    const select = document.getElementById("match_id");

    select.innerHTML = "";
    matches.forEach(match => {

        select.innerHTML += `
            <option value="${match.id}">
                ${match.team1_name} vs ${match.team2_name}
            </option>
        `;

    });

}
// ===========================
// Load Servers
// ===========================

async function loadServers() {

    const res = await fetch(API + "/servers");

    servers = await res.json();

    renderServers(servers);

}

// ===========================
// Render Table
// ===========================

function renderServers(list) {

    table.innerHTML = "";

    if (list.length === 0) {

        table.innerHTML = `
        <tr>
            <td colspan="7">
                No Servers Found
            </td>
        </tr>
        `;

        return;

    }

    list.forEach(server => {

        table.innerHTML += `

<tr>

<td>${server.id}</td>

<td>
    ${server.team1_name} vs ${server.team2_name}
</td>

<td>${server.name}</td>

<td>${server.quality}</td>

<td>${server.type}</td>

<td>
${server.enabled ? "Enabled" : "Disabled"}
</td>

<td>

<button onclick="editServer(${server.id})">
Edit
</button>

<button onclick="deleteServer(${server.id})">
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

function searchServers() {

    const keyword = document
        .getElementById("search")
        .value
        .toLowerCase();

    const filtered = servers.filter(server => {

        return (
            String(server.id).includes(keyword) ||
            (server.team1_name || "").toLowerCase().includes(keyword) ||
            (server.team2_name || "").toLowerCase().includes(keyword) ||
            (server.name || "").toLowerCase().includes(keyword) ||
            (server.quality || "").toLowerCase().includes(keyword) ||
            (server.type || "").toLowerCase().includes(keyword)
        );

    });

    renderServers(filtered);

}

// ===========================
// Open Modal
// ===========================

function openModal() {

    editingId = null;

    modalTitle.innerText = "Add Server";

    document.getElementById("match_id").value = "";
    document.getElementById("name").value = "";
    document.getElementById("quality").value = "";
    document.getElementById("type").value = "m3u8";
    document.getElementById("url").value = "";
    document.getElementById("enabled").value = "1";
    document.getElementById("sort_order").value = "1";

    modal.style.display = "flex";

}

// ===========================
// Close Modal
// ===========================

function closeModal() {

    modal.style.display = "none";

}

// ===========================
// Edit Server
// ===========================

function editServer(id) {

    const server = servers.find(item => item.id == id);

    if (!server) return;

    editingId = id;

    modalTitle.innerText = "Edit Server";

    document.getElementById("match_id").value = server.match_id;
    document.getElementById("name").value = server.name;
    document.getElementById("quality").value = server.quality;
    document.getElementById("type").value = server.type;
    document.getElementById("url").value = server.url;
    document.getElementById("enabled").value = server.enabled;
    document.getElementById("sort_order").value = server.sort_order;

    modal.style.display = "flex";

}

// ===========================
// Delete Server
// ===========================

async function deleteServer(id) {

    if (!confirm("Delete this server?"))
        return;

    await fetch(API + "/servers/" + id, {
        method: "DELETE"
    });

    loadServers();

}
// ===========================
// Save Server
// ===========================

async function saveServer() {

    const data = {
        match_id: Number(document.getElementById("match_id").value),
        name: document.getElementById("name").value.trim(),
        quality: document.getElementById("quality").value.trim(),
        type: document.getElementById("type").value,
        url: document.getElementById("url").value.trim(),
        enabled: Number(document.getElementById("enabled").value),
        sort_order: Number(document.getElementById("sort_order").value)
    };

    if (!data.name || !data.url) {
        alert("Please fill all required fields.");
        return;
    }

    let endpoint = API + "/servers";
    let method = "POST";

    if (editingId !== null) {
        endpoint = API + "/servers/" + editingId;
        method = "PUT";
    }

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
    loadServers();

}

// ===========================
// Events
// ===========================

document.getElementById("addBtn").addEventListener("click", openModal);

saveBtn.addEventListener("click", saveServer);

window.addEventListener("click", function (e) {

    if (e.target === modal) {
        closeModal();
    }

});

// ===========================
// Start
// ===========================

async function init() {

    await loadMatches();
    await loadServers();

}

init();
