const audio = document.getElementById("audio");
const library = document.getElementById("library");

const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const shuffleBtn = document.getElementById("shuffle");
const repeatOneBtn = document.getElementById("repeatOne");
const repeatFolderBtn = document.getElementById("repeatFolder");

const progress = document.getElementById("progress");

const title = document.getElementById("trackTitle");
const artist = document.getElementById("trackArtist");

let tracks = [];
let current = 0;

let shuffle = false;
let repeatOne = false;
let repeatFolder = false;

const saved = localStorage.getItem("library");

if (saved) {
    tracks = JSON.parse(saved);
    render(tracks);
} else {
    fetch("music-library.json")
        .then(res => res.json())
        .then(data => {
            tracks = data.tracks;
            render(tracks);
        });
}

function render(list) {

    library.innerHTML = "";

    list.forEach((track, index) => {

        const card = document.createElement("div");
        card.className = "track-card";

        card.innerHTML = `
            <img class="cover"
                 src="${track.cover || 'assets/default-cover.png'}">

            <h3>${track.title}</h3>
            <p>${track.artist}</p>
            <small>${track.customName || track.album}</small>
        `;

        card.onclick = () => {
            current = index;
            loadTrack(current);
        };

        library.appendChild(card);
    });
}

function loadTrack(index) {

    const track = tracks[index];

    audio.src = track.file;

    title.textContent = track.title;

    artist.textContent =
        `${track.artist} • ${track.customName || track.album}`;

    audio.play();

    playBtn.textContent = "⏸";
}

playBtn.onclick = () => {

    if (audio.paused) {
        audio.play();
        playBtn.textContent = "⏸";
    } else {
        audio.pause();
        playBtn.textContent = "▶";
    }
};

nextBtn.onclick = () => {

    if (shuffle) {
        current = Math.floor(Math.random() * tracks.length);
    } else {
        current++;
    }

    if (current >= tracks.length) {
        current = 0;
    }

    loadTrack(current);
};

prevBtn.onclick = () => {

    current--;

    if (current < 0) {
        current = tracks.length - 1;
    }

    loadTrack(current);
};

shuffleBtn.onclick = () => {
    shuffle = !shuffle;
    shuffleBtn.classList.toggle("active");
};

repeatOneBtn.onclick = () => {
    repeatOne = !repeatOne;
    repeatOneBtn.classList.toggle("active");
};

repeatFolderBtn.onclick = () => {
    repeatFolder = !repeatFolder;
    repeatFolderBtn.classList.toggle("active");
};

audio.addEventListener("ended", () => {

    if (repeatOne) {
        loadTrack(current);
        return;
    }

    nextBtn.click();
});

audio.addEventListener("timeupdate", () => {

    if (audio.duration) {
        progress.value =
            (audio.currentTime / audio.duration) * 100;
    }
});

progress.addEventListener("input", () => {

    if (audio.duration) {
        audio.currentTime =
            (progress.value / 100) * audio.duration;
    }
});

document.querySelectorAll("[data-sort]")
    .forEach(button => {

        button.onclick = () => {

            const type = button.dataset.sort;

            let sorted = [...tracks];

            sorted.sort((a, b) => {

                if (type === "date") {
                    return new Date(b.dateAdded)
                        - new Date(a.dateAdded);
                }

                return (a[type] || "")
                    .localeCompare(b[type] || "");
            });

            render(sorted);
        };
    });

document.getElementById("search")
    .addEventListener("input", e => {

        const value = e.target.value.toLowerCase();

        const filtered = tracks.filter(track =>
            track.title.toLowerCase().includes(value) ||
            track.artist.toLowerCase().includes(value) ||
            track.album.toLowerCase().includes(value)
        );

        render(filtered);
    });

const input = document.getElementById("musicInput");

document.getElementById("loadMusic").onclick = () => {
    input.click();
};

input.addEventListener("change", e => {

    [...e.target.files].forEach(file => {

        tracks.push({
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Unknown",
            album: "Local Files",
            folder: "Local",
            dateAdded: new Date().toISOString(),
            file: URL.createObjectURL(file)
        });
    });

    localStorage.setItem(
        "library",
        JSON.stringify(tracks)
    );

    render(tracks);
});

document.getElementById("renameAlbum").onclick = () => {

    const nouveauNom = prompt("Nouveau nom :");

    if (nouveauNom) {

        tracks[current].customName = nouveauNom;

        localStorage.setItem(
            "library",
            JSON.stringify(tracks)
        );

        render(tracks);
    }
};

const coverInput = document.getElementById("coverInput");

document.getElementById("changeCover").onclick = () => {
    coverInput.click();
};

coverInput.addEventListener("change", e => {

    const file = e.target.files[0];

    if (file) {

        tracks[current].cover =
            URL.createObjectURL(file);

        localStorage.setItem(
            "library",
            JSON.stringify(tracks)
        );

        render(tracks);
    }
});
