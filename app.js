/* ==================================================
   MAROKIP3S APP
================================================== */

const App = {

    data: {},

    matches: [],

    competitions: [],

    teams: [],

    servers: [],

    currentMatch: null,

    currentServers: [],

    currentServer: null,

    loading: false

};

/* ==================================================
DOM HELPERS
================================================== */

const $ = id => document.getElementById(id);

const $$ = selector => document.querySelectorAll(selector);

/* ==================================================
ROUTER
================================================== */

window.addEventListener("hashchange", router);

function router(){

    const hash = window.location.hash || "#/";

    $("homePage").style.display = "none";
    $("competitionPage").style.display = "none";

    if(hash === "#/"){

        $("homePage").style.display = "block";

        return;

    }

    if(hash.startsWith("#/competition/")){

        $("competitionPage").style.display = "block";

        return;

    }

}
/* ==================================================
INIT
================================================== */

document.addEventListener("DOMContentLoaded", initApp);

async function initApp(){

    try{

        showLoading();

        await loadData();

        renderCompetitions();

        renderMatches(App.matches);

        updateCounters();

        bindEvents();

        router();
      
        hideLoading();

    }

    catch(err){

        console.error(err);

        hideLoading();

        showToast(
            "تعذر تحميل البيانات",
            "error"
        );

    }

}

/* ==================================================
LOAD DATA
================================================== */

async function loadData(){

    const data = await API.getData();

    App.data = data;

    App.matches = data.matches || [];

    App.competitions = data.competitions || [];

    App.teams = data.teams || [];

    App.servers = data.servers || [];

}

/* ==================================================
HELPERS
================================================== */

function getCompetition(id){

    return App.competitions.find(item=>

        Number(item.id)===Number(id)

    ) || null;

}

function getTeam(id){

    return App.teams.find(item=>

        Number(item.id)===Number(id)

    ) || null;

}

function getServers(matchId){

    return App.servers.filter(server=>

        Number(server.match_id)===Number(matchId)

    );

}

function getMatchStatus(match){

    const status = String(

        match.status || ""

    ).toLowerCase();

    if(status==="live")

        return "live";

    if(status==="finished")

        return "finished";

    return "upcoming";

}

/* ==================================================
FORMAT DATE
================================================== */

function formatTime(dateString){

    if(!dateString)

        return "--:--";

    const date = new Date(dateString);

    return date.toLocaleTimeString(

        [],

        {

            hour:"2-digit",

            minute:"2-digit"

        }

    );

}

function formatDate(dateString){

    if(!dateString)

        return "";

    const date = new Date(dateString);

    return date.toLocaleDateString();

}

/* ==================================================
ESCAPE HTML
================================================== */

function escapeHtml(text){

    if(!text)

        return "";

    return String(text)

    .replace(/&/g,"&amp;")

    .replace(/</g,"&lt;")

    .replace(/>/g,"&gt;")

    .replace(/"/g,"&quot;")

    .replace(/'/g,"&#039;");

}
/* ==================================================
   COMPETITIONS
================================================== */

function renderCompetitions(){

    const container = $("competitionList");

    if(!container) return;

    container.innerHTML = "";

    // زر جميع المباريات
    const all = document.createElement("button");

    all.className = "competition-card active";

    all.innerHTML = `
        <span>🌍</span>
        <span>جميع البطولات</span>
    `;

    all.onclick = () => {

        $$(".competition-card").forEach(c=>{

            c.classList.remove("active");

        });

        all.classList.add("active");

        renderMatches(App.matches);

    };

    container.appendChild(all);

    App.competitions.forEach(comp=>{

        container.appendChild(

            createCompetitionCard(comp)

        );

    });

}


function createCompetitionCard(comp){

    const card = document.createElement("button");

    card.className = "competition-card";

    card.dataset.id = comp.id;

    card.innerHTML = `

        <img
            src="${comp.logo}"
            alt="${escapeHtml(comp.name)}">

        <span>

            ${escapeHtml(comp.name)}

        </span>

    `;

    card.onclick = ()=>{

        $$(".competition-card").forEach(c=>{

            c.classList.remove("active");

        });

        card.classList.add("active");

        const list = App.matches.filter(match=>

            Number(match.competition_id)===Number(comp.id)

        );

        renderMatches(list);

    };

    return card;

}

/* ==================================================
   MATCHES
================================================== */

function renderMatches(matches){

    const container = $("matchesGrid");

    if(!container) return;

    container.innerHTML = "";

    if(matches.length===0){

        container.innerHTML=`

        <div class="state-box">

            <i class="fa-solid fa-calendar-xmark"></i>

            <p>

                لا توجد مباريات

            </p>

        </div>

        `;

        return;

    }

    matches.forEach(match=>{

        container.innerHTML +=

        createMatchCard(match);

    });

}

/* ==================================================
   MATCH CARD
================================================== */

function createMatchCard(match){

    const home = getTeam(match.team1_id);
    const away = getTeam(match.team2_id);
    const competition = getCompetition(match.competition_id);

    const status = getMatchStatus(match);

    let badge = "";

    if(status==="live"){
    badge='<span class="live-badge-card live">🔴 مباشر</span>';
}else if(status==="upcoming"){
    badge='<span class="live-badge-card upcoming">🕒 قادمة</span>';
}else{
    badge='<span class="live-badge-card finished">✓ انتهت</span>';
    }

    return `

<div class="match-card">

<div class="match-header">

<div class="match-header-left">

${badge}

</div>

<div class="match-header-right">

<img
class="competition-logo"
src="${competition?.logo || ""}"
alt="">

<span class="competition-name">
${competition?.name || ""}
</span>

</div>

</div>

<div class="match-body">

<div class="team">

<img src="${home?.logo || ""}" alt="">

<span>${home?.name || ""}</span>

</div>

<div class="match-center">

<div class="match-time">
${formatTime(match.start_time)}
</div>

<div class="match-date">
${formatDate(match.start_time)}
</div>

</div>

<div class="team">

<img src="${away?.logo || ""}" alt="">

<span>${away?.name || ""}</span>

</div>

</div>

<div class="match-footer">

<button
class="watch-btn"
onclick="openPlayer(${match.id})">

<i class="fa-solid fa-play"></i>

مشاهدة

</button>

</div>

</div>

`;

}
/* ==================================================
   SEARCH
================================================== */

function searchMatches(keyword){

    keyword = keyword.trim().toLowerCase();

    if(!keyword){

        renderMatches(App.matches);

        return;

    }

    const result = App.matches.filter(match=>{

        const home = getTeam(match.team1_id);

        const away = getTeam(match.team2_id);

        const comp = getCompetition(match.competition_id);

        return(

            (home?.name || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (away?.name || "")
            .toLowerCase()
            .includes(keyword)

            ||

            (comp?.name || "")
            .toLowerCase()
            .includes(keyword)

        );

    });

    renderMatches(result);

}

/* ==================================================
   COUNTERS
================================================== */

function updateCounters(){

    let live = 0;

    let upcoming = 0;

    let finished = 0;

    App.matches.forEach(match=>{

        switch(getMatchStatus(match)){

            case "live":

                live++;

            break;

            case "finished":

                finished++;

            break;

            default:

                upcoming++;

        }

    });

    if($("liveCount"))
        $("liveCount").textContent = live;

    if($("upcomingCount"))
        $("upcomingCount").textContent = upcoming;

    if($("finishedCount"))
        $("finishedCount").textContent = finished;

}

/* ==================================================
   PLAYER
================================================== */

function openPlayer(matchId){

    App.currentMatch = App.matches.find(

        m=>Number(m.id)===Number(matchId)

    );

    if(!App.currentMatch){

        showToast(

            "المباراة غير موجودة",

            "error"

        );

        return;

    }

    App.currentServers = getServers(matchId);

    if(App.currentServers.length===0){

        showToast(

            "لا توجد سيرفرات",

            "error"

        );

        return;

    }

    Player.open();

    const home = getTeam(App.currentMatch.team1_id);

    const away = getTeam(App.currentMatch.team2_id);

    const comp = getCompetition(App.currentMatch.competition_id);

    $("playerTitle").textContent =

        `${home?.name || ""} VS ${away?.name || ""}`;

    $("playerSubtitle").textContent =

        comp?.name || "";

    if($("playerCompetitionLogo")){

        $("playerCompetitionLogo").src =

        comp?.logo || "";

    }

    renderServers();

    playServer(

        App.currentServers[0]

    );

}

/* ==================================================
   CLOSE PLAYER
================================================== */

function closePlayer(){

    $("playerModal")

    ?.classList

    .remove("show");

    if(typeof stopPlayer==="function")

        stopPlayer();

}

/* ==================================================
   SERVERS
================================================== */

function renderServers(){

    const container = $("serverList");

    if(!container)

        return;

    container.innerHTML = "";

    App.currentServers.forEach((server,index)=>{

        const btn = document.createElement("button");

        btn.className = "server-item";

        if(index===0)

            btn.classList.add("active");

        btn.innerHTML = `

            <span>

                ${escapeHtml(server.name)}

            </span>

            <small>

                ${server.quality}

            </small>

        `;

        btn.onclick = ()=>{

            document

            .querySelectorAll(".server-item")

            .forEach(item=>{

                item.classList.remove("active");

            });

            btn.classList.add("active");

            playServer(server);

        };

        container.appendChild(btn);

    });

}

/* ==================================================
   PLAY SERVER
================================================== */

function playServer(server){

    App.currentServer = server;

    if(typeof Player==="undefined"){

        console.error("Player.js غير محمل");

        return;

    }

    // إرسال جميع السيرفرات للمشغل
    Player.serverList = App.currentServers;

    Player.load(server);

}
/* ==================================================
   LOADING
================================================== */

function showLoading() {

    const loading = $("loadingScreen");

    if (loading) {
        loading.classList.add("show");
    }

}

function hideLoading() {

    const loading = $("loadingScreen");

    if (loading) {
        loading.classList.remove("show");
    }

}

/* ==================================================
   TOAST
================================================== */

function showToast(message, type = "success") {

    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.className = "toast";

    toast.classList.add(type);

    toast.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

/* ==================================================
   EVENTS
================================================== */

function bindEvents() {

    // Search
    const search = $("searchInput");

    if (search) {

        search.addEventListener("input", e => {

            searchMatches(e.target.value);

        });

    }

    // Close player button
    const closeBtn = $("closePlayer");

    if (closeBtn) {

        closeBtn.addEventListener("click", closePlayer);

    }

    // Close modal when clicking outside
    const modal = $("playerModal");

    if (modal) {

        modal.addEventListener("click", e => {

            if (e.target === modal) {

                closePlayer();

            }

        });

    }

    // ESC key
    document.addEventListener("keydown", e => {

        if (e.key === "Escape") {

            closePlayer();

        }

    });

    // Online
    window.addEventListener("online", () => {

        showToast("تم استرجاع الاتصال بالإنترنت", "success");

    });

    // Offline
    window.addEventListener("offline", () => {

        showToast("لا يوجد اتصال بالإنترنت", "error");

    });

}

/* ==================================================
   AUTO REFRESH
================================================== */

setInterval(async () => {

    try {

        const data = await API.getData();

        App.data = data;

        App.matches = data.matches || [];

        App.competitions = data.competitions || [];

        App.teams = data.teams || [];

        App.servers = data.servers || [];

        updateCounters();

        renderMatches(App.matches);

    }

    catch (err) {

        console.error(err);

    }

}, 60000);

/* ==================================================
   END
================================================== */
