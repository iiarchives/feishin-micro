// Copyright (c) 2024 iiPython
// Not my best work, but it sure as hell gets the job done.

// Initialization
const elements = {
    cover:    document.querySelector("#cover"),
    bgimage:  document.querySelector("#background-image"),
    name:     document.querySelector("h3"),
    combo:    document.querySelector("h4"),
    prev:     document.querySelector("#btn-prev"),
    next:     document.querySelector("#btn-next"),
    toggle:   document.querySelector("#btn-toggle"),
};
const cache = {
    status: null,  // Current playback status
    last:   null,  // Last played song metadata
    time:   null,  // Current song progress (seconds)
};

elements.cover.addEventListener("load", () => {
    const color_grade = checkImageBrightness(elements.cover) ? "dark" : "light";
    for (const element of document.querySelectorAll(".autocolor")) {
        element.classList.remove("dark", "light");
        element.classList.add(color_grade);
    }
});

// Setup visualizer
const visualizer = { audio:  new Audio() };
visualizer.motion = new AudioMotionAnalyzer(
    document.getElementById("visualizer"),
    {
        source: visualizer.audio,
        ansiBands: true,
        connectSpeakers: false,
        mode: 4,
        gradient: "steelblue",
        overlay: true,
        showBgColor: false,
        showPeaks: false,
        showScaleX: false,
        smoothing: 0.8
    }
);

// Random helpers
function update_toggle_status(status) {
    elements.toggle.children[0].innerHTML = `
        ${status === "paused" ?
            `<path d = "m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />`
            : `<path d = "M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5" />`
        }
    `;
    cache.status = status;

    const audio = visualizer.audio;
    if (!audio.src) return;
    if ((!audio.paused && status === "paused") || (audio.paused && status === "playing")) audio[status === "paused" ? "pause" : "play"]();
}

function set_text(title, description, error) {
    if (error) {
        elements.cover.src = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
        elements.bgimage.style.background = "#002D62";
        document.querySelector(".progress-bar > div").style.width = "0%";
        update_toggle_status("paused");
    }
    elements.name.innerText = title;
    elements.combo.innerText = description;
    if (!cache.last || (description !== `${cache.last.artistName} · ${cache.last.album}`)) {
        elements.combo.style.paddingLeft = "", elements.combo.style.animation = "";
        setTimeout(() => {
            if (elements.combo.offsetWidth >= 290) {
                elements.combo.style.paddingLeft = "100%";
                elements.combo.style.animation = "marquee 15s linear infinite";
            }
        }, 10);
    }
}

// Message handling
function handle_message(d) {
    const raw = JSON.parse(d.data);
    switch (raw.event) {
        case "playback":
            update_toggle_status(raw.data);
            break;

        case "position":
            const duration = cache.last.duration / 1000;
            visualizer.audio.currentTime = raw.data;
            cache.time = raw.data;
            document.querySelector(".progress-bar > div").style.width = `${(raw.data / duration) * 100}%`;
            break;

        case "state":
        case "song":
            if (raw.data.status) update_toggle_status(raw.data.status);

            const song = raw.data.song ? raw.data.song : raw.data;
            if (!song.name) return set_text("Nothing Playing", "Start playing a song in Feishin to have this update.", true);

            // Handle visualizer
            visualizer.audio.src = song.streamUrl;
            if (cache.status === "playing") visualizer.audio.play();

            // Handle images
            elements.cover.src = `${song.imageUrl}`.replace(/size=\d{3}/, "size=1000");
            elements.bgimage.style.background = "";
            elements.bgimage.style.backgroundImage = `url("${song.imageUrl}")`;

            // Final updates
            set_text(song.name, `${song.artistName} · ${song.album}`);
            cache.last = song;
    }
}

// Establish connection
var socket, timeout, missing_config;
function establish_connection() {
    socket = new WebSocket("ws://localhost:4333");
    socket.addEventListener("open", async () => {
        if (timeout) clearTimeout(timeout);
        console.log("Connection established!");
        socket.addEventListener("message", handle_message);

        // Send login payload
        const username = await api.getStoreValue("user"), password = await api.getStoreValue("pass");
        if (!(username && password)) {
            missing_config = true;
            return set_text("Config Required", "Place user credentials inside ~/.config/feishin-micro/config.json and relaunch.", true);
        }
        socket.send(JSON.stringify({
            event: "authenticate",
            header: `Basic ${btoa(`${username}:${password}`)}`
        }));
    });
    socket.addEventListener("close", () => {
        if (missing_config) return;
        set_text("Disconnected", "Reopen Feishin in order to proceed.", true);
        timeout = setTimeout(establish_connection, 5000);
    });
    socket.addEventListener("error", (error) => {
        console.error(error)
        set_text("Socket Error", "Check console for more details.", true);
        timeout = setTimeout(establish_connection, 5000);
    });
}
establish_connection();

// Handle buttons
elements.prev.addEventListener("click", () => socket.send(JSON.stringify({ event: "previous" })));
elements.next.addEventListener("click", () => socket.send(JSON.stringify({ event: "next" })));
elements.toggle.addEventListener("click", () => socket.send(JSON.stringify({ event: cache.status === "playing" ? "pause" : "play" })));

// Handle seeking
document.querySelector(".progress-bar").addEventListener("click", (e) => {
    socket.send(JSON.stringify({
        event: "seek",
        offset: ((e.offsetX / 282) * (cache.last.duration / 1000)) - cache.time
    }));
});
