/* ==========================================
   MAROKIP3S PLAYER V2
   PART 1 - CORE
========================================== */

const Player = {
  
    modal: null,
    video: null,
    iframe: null,
    loading: null,

    hls: null,
    dash: null,

    currentServer: null,

    serverList: [],

    currentIndex: -1,

    retryCount: 0,

    maxRetries: 1,
  
    qualityLevels: [],

    initialized: false

};

/* ==========================================
   INIT
========================================== */

Player.init = function () {

    if (this.initialized) return;

    this.modal = document.getElementById("playerModal");
    this.video = document.getElementById("videoPlayer");
    this.iframe = document.getElementById("iframePlayer");
    this.loading = document.getElementById("playerLoading");

    if (!this.video || !this.modal) {

        console.error("Player elements not found");

        return;

    }

    this.video.controls = true;
    this.video.autoplay = true;
    this.video.playsInline = true;
    this.video.preload = "auto";

    this.bindEvents();
  const last = localStorage.getItem("last_server");

if(last){

    try{

        this.currentServer = JSON.parse(last);

    }catch(e){}

}

    this.initialized = true;

};

/* ==========================================
   EVENTS
========================================== */

Player.bindEvents = function () {

    this.video.addEventListener("waiting", () => {

        this.showLoading();

    });

    this.video.addEventListener("playing", () => {

    this.retryCount = 0;

    this.hideLoading();

});

    this.video.addEventListener("canplay", () => {

        this.hideLoading();

    });

    this.video.addEventListener("pause", () => {

    });

    this.video.addEventListener("ended", () => {

        showToast("انتهى البث", "success");

    });

    this.video.addEventListener("error", () => {

        this.hideLoading();

        showToast("تعذر تشغيل البث", "error");

    });

    // ضغطتين على الفيديو = Fullscreen
    this.video.addEventListener("dblclick", () => {

        toggleFullscreen();

    });

    // اختصارات الكيبورد
    document.addEventListener("keydown", (e) => {

        if (!this.modal || !this.modal.classList.contains("show"))
            return;

        switch (e.key.toLowerCase()) {

            case "f":

                toggleFullscreen();

                break;

            case "m":

                toggleMute();

                break;

            case " ":

                e.preventDefault();

                if (this.video.paused) {

                    this.video.play();

                } else {

                    this.video.pause();

                }

                break;

        }

    });

};

/* ==========================================
   OPEN
========================================== */

Player.open = function () {
  
    this.init();

    this.modal.classList.add("show");

};

/* ==========================================
   CLOSE
========================================== */

Player.close = function () {

    this.stop();

    if(document.fullscreenElement){

        document.exitFullscreen();

    }

    this.modal.classList.remove("show");

};

/* ==========================================
   LOADING
========================================== */

Player.showLoading = function () {

    this.loading?.classList.add("show");

};

Player.hideLoading = function () {

    this.loading?.classList.remove("show");

};

/* ==========================================
   RESET
========================================== */

Player.reset = function () {

    if (this.video) {

        this.video.pause();

        this.video.removeAttribute("src");

        this.video.load();

        this.video.style.display = "none";

    }

    if (this.iframe) {

        this.iframe.src = "";

        this.iframe.style.display = "none";

    }

};

/* ==========================================
   STOP
========================================== */

Player.stop = function(){

    if(this.hls){

        this.hls.destroy();

        this.hls = null;

    }

    if(this.dash){

        this.dash.reset();

        this.dash = null;

    }

    this.reset();

    this.hideLoading();

    this.currentServer = null;

};

/* ==========================================
   PLACEHOLDERS
========================================== */

/* ==========================================
   LOAD SERVER
========================================== */

Player.load = function(server){

    this.open();

    this.stop();

    this.currentServer = server;

    if(Array.isArray(this.serverList)){

        this.currentIndex = this.serverList.findIndex(
            s => s.url === server.url
        );

    }

    localStorage.setItem(
        "last_server",
        JSON.stringify(server)
    );

    if(!server || !server.url){

        showToast("رابط البث غير صالح","error");

        return;

    }

    this.showLoading(); 

    const originalUrl = server.url.trim();
    const url = originalUrl.toLowerCase();

    if(this.video){

        this.video.style.display="none";

    }

    if(this.iframe){

        this.iframe.style.display="none";

        this.iframe.src="";

    }

    if (
    url.includes(".m3u8") ||
    url.includes("/m3u8")
){
    this.loadHLS(originalUrl);
    return;
}

if (
    url.includes(".mpd")
){
    this.loadDASH(originalUrl);
    return;
}

if (
    url.endsWith(".mp4") ||
    url.endsWith(".mkv") ||
    url.endsWith(".webm") ||
    url.endsWith(".ts") ||
    url.includes(".ts?")
){
    this.loadDirect(originalUrl);
    return;
}

this.loadIframe(originalUrl);

};
/* ==========================================
   DIRECT VIDEO
========================================== */

Player.loadDirect=function(url){

    this.video.style.display="block";

    this.video.src=url;

    this.video.load();

    this.video.play().catch(err=>{

    console.log(err);

    this.retry();

});

};

/* ==========================================
   IFRAME
========================================== */

Player.loadIframe=function(url){

    this.iframe.style.display="block";

    this.iframe.src=url;

    this.hideLoading();

};
/* ==========================================
   HLS
========================================== */

Player.loadHLS = function (url) {

    this.video.style.display = "block";

    if (Hls.isSupported()) {

        this.hls = new Hls({

            enableWorker: true,

            lowLatencyMode: true,

            backBufferLength: 90,

            maxBufferLength: 30,

            maxMaxBufferLength: 60

        });

        this.hls.loadSource(url);

        this.hls.attachMedia(this.video);

        this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {

            this.video.play().catch(console.error);

        });

        this.hls.on(Hls.Events.ERROR, (event, data) => {

            console.log(data);

            if (!data.fatal) return;

            switch (data.type) {

                case Hls.ErrorTypes.NETWORK_ERROR:

                    console.log("Retry Network");

                    this.hls.startLoad();

                    break;

                case Hls.ErrorTypes.MEDIA_ERROR:

                    console.log("Recover Media");

                    this.hls.recoverMediaError();

                    break;

                default:

                    this.retry();

            }

        });

        return;

    }

    if (this.video.canPlayType("application/vnd.apple.mpegurl")) {

        this.video.src = url;

        this.video.play();

        return;

    }

    showToast("HLS غير مدعوم", "error");

};
/* ==========================================
   DASH
========================================== */

Player.loadDASH = function (url) {

    this.video.style.display = "block";

    this.dash = dashjs.MediaPlayer().create();

    this.dash.initialize(

        this.video,

        url,

        true

    );

    this.dash.on("error", e => {

        console.log(e);

        this.retry();

    });

};
/* ==========================================
   PLAYER UI
========================================== */

function reloadCurrentServer(){

    if(Player.currentServer){

        Player.load(Player.currentServer);

    }

}

function toggleMute(){

    if(!Player.video) return;

    Player.video.muted=!Player.video.muted;

    const icon=document.querySelector(
        ".player-actions button:nth-child(3) i"
    );

    if(icon){

        icon.className=Player.video.muted
        ? "fa-solid fa-volume-xmark"
        : "fa-solid fa-volume-high";

    }

}

async function togglePiP(){

    if(!Player.video) return;

    try{

        if(document.pictureInPictureElement){

            await document.exitPictureInPicture();

        }else{

            await Player.video.requestPictureInPicture();

        }

    }catch(e){

        console.log(e);

    }

}

function toggleFullscreen(){

    const container=document.querySelector(".player-container");

    if(!container) return;

    if(document.fullscreenElement){

        document.exitFullscreen();

    }else{

        container.requestFullscreen();

    }

}

function stopPlayer(){

    Player.stop();

}
/* ==========================================
   RETRY
========================================== */

Player.retry = function(){

    if(!this.currentServer) return;

    if(this.retryCount < this.maxRetries){

        this.retryCount++;

        console.log("Retry:", this.retryCount);

        setTimeout(()=>{

            this.load(this.currentServer);

        },1500);

        return;

    }

    this.retryCount = 0;

    if(this.serverList.length > 1 &&
       this.currentIndex + 1 < this.serverList.length){

        this.currentIndex++;

        const nextServer = this.serverList[this.currentIndex];
      
      document.querySelectorAll(".server-item").forEach((btn,index)=>{

    btn.classList.toggle("active", index === this.currentIndex);

});

        showToast("الانتقال إلى السيرفر التالي","success");

        playServer(nextServer);

        return;

    }

    showToast("جميع السيرفرات غير متاحة","error");

};