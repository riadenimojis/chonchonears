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
    function loadTrack(index) {
/* =========================
   PLAYER CONTROLS
========================= */

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

    if (tracks.length === 0) return;

    if (shuffle) {

        current =
            Math.floor(
                Math.random() *
                tracks.length
            );

    } else {

        current++;
    }

    if (current >= tracks.length) {

        current = 0;
    }

    loadTrack(current);
};

prevBtn.onclick = () => {

    if (tracks.length === 0) return;

    current--;

    if (current < 0) {

        current =
            tracks.length - 1;
    }

    loadTrack(current);
};

/* =========================
   SHUFFLE / REPEAT
========================= */

shuffleBtn.onclick = () => {

    shuffle = !shuffle;

    shuffleBtn.classList.toggle(
        "active"
    );
};

repeatOneBtn.onclick = () => {

    repeatOne = !repeatOne;

    repeatOneBtn.classList.toggle(
        "active"
    );
};

repeatFolderBtn.onclick = () => {

    repeatFolder =
        !repeatFolder;

    repeatFolderBtn.classList.toggle(
        "active"
    );
};

/* =========================
   AUDIO EVENTS
========================= */

audio.addEventListener(
    "ended",
    () => {

        if (repeatOne) {

            loadTrack(current);

            return;
        }

        nextBtn.click();
    }
);

audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration)
            return;

        progress.value =
            (
                audio.currentTime /
                audio.duration
            ) * 100;
    }
);

progress.addEventListener(
    "input",
    () => {

        if (!audio.duration)
            return;

        audio.currentTime =
            (
                progress.value /
                100
            ) *
            audio.duration;
    }
);

/* =========================
   TRACK VOLUME
========================= */

if (volumeSlider) {

    volumeSlider.addEventListener(
        "input",
        () => {

            const value =
                Number(
                    volumeSlider.value
                );

            audio.volume =
                value / 100;

            if (
                tracks[current]
            ) {

                tracks[current].volume =
                    value;

                saveLibrary();
            }
        }
    );
}

/* =========================
   SORT
========================= */

document
.querySelectorAll("[data-sort]")
.forEach(button => {

    button.onclick = () => {

        const type =
            button.dataset.sort;

        let sorted =
            [...tracks];

        sorted.sort(
            (a, b) => {

                if (
                    type === "date"
                ) {

                    return (
                        new Date(
                            b.dateAdded
                        ) -
                        new Date(
                            a.dateAdded
                        )
                    );
                }

                return (
                    a[type] || ""
                )
                .localeCompare(
                    b[type] || ""
                );
            }
        );

        render(sorted);
    };
});

/* =========================
   SEARCH
========================= */

document
.getElementById("search")
.addEventListener(
    "input",
    e => {

        const value =
            e.target.value
            .toLowerCase();

        const filtered =
            tracks.filter(
                track =>

                    track.title
                    .toLowerCase()
                    .includes(
                        value
                    )

                    ||

                    track.artist
                    .toLowerCase()
                    .includes(
                        value
                    )

                    ||

                    track.album
                    .toLowerCase()
                    .includes(
                        value
                    )
            );

        render(filtered);
    }
);

/* =========================
   MUSIC IMPORT
========================= */

const input =
document.getElementById(
    "musicInput"
);

document
.getElementById(
    "loadMusic"
)
.onclick = () => {

    input.click();
};

input.addEventListener(
    "change",
    e => {

        [...e.target.files]
        .forEach(file => {

            tracks.push({

                title:
                    file.name
                    .replace(
                        /\.[^/.]+$/,
                        ""
                    ),

                artist:
                    "Unknown",

                album:
                    "Local Files",

                folder:
                    "Local",

                volume:
                    100,

                dateAdded:
                    new Date()
                    .toISOString(),

                file:
                    URL
                    .createObjectURL(
                        file
                    )
            });
        });

        saveLibrary();

        render(tracks);
    }
);
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

/* =========================
   EDIT TRACK
========================= */

const editTrackBtn =
    document.getElementById(
        "editTrack"
    );

if (editTrackBtn) {

    editTrackBtn.onclick = () => {

        const track =
            tracks[current];

        if (!track) return;

        editTitle.value =
            track.title || "";

        editArtist.value =
            track.artist || "";

        editAlbum.value =
            track.album || "";

        editFolder.value =
            track.folder || "";

        editModal.classList.remove(
            "hidden"
        );
    };
}

/* =========================
   SAVE TRACK
========================= */

const saveTrackBtn =
    document.getElementById(
        "saveTrack"
    );

if (saveTrackBtn) {

    saveTrackBtn.onclick = () => {

        const track =
            tracks[current];

        if (!track) return;

        track.title =
            editTitle.value.trim();

        track.artist =
            editArtist.value.trim();

        track.album =
            editAlbum.value.trim();

        track.folder =
            editFolder.value.trim();

        saveLibrary();

        render(tracks);

        loadTrack(current);

        editModal.classList.add(
            "hidden"
        );
    };
}

/* =========================
   CLOSE MODAL
========================= */

const closeModalBtn =
    document.getElementById(
        "closeModal"
    );

if (closeModalBtn) {

    closeModalBtn.onclick = () => {

        editModal.classList.add(
            "hidden"
        );
    };
}

if (editModal) {

    editModal.addEventListener(
        "click",
        e => {

            if (
                e.target === editModal
            ) {

                editModal.classList.add(
                    "hidden"
                );
            }
        }
    );
}

/* =========================
   DELETE TRACK
========================= */

const deleteTrackBtn =
    document.getElementById(
        "deleteTrack"
    );

if (deleteTrackBtn) {

    deleteTrackBtn.onclick = () => {

        const track =
            tracks[current];

        if (!track) return;

        if (
            !confirm(
                `Supprimer "${track.title}" ?`
            )
        ) {
            return;
        }

        tracks.splice(
            current,
            1
        );

        saveLibrary();

        render(tracks);

        audio.pause();

        title.textContent =
            "Aucun morceau";

        artist.textContent =
            "---";

        progress.value = 0;
    };
}

/* =========================
   NEW FOLDER
========================= */

const newFolderBtn =
    document.getElementById(
        "newFolder"
    );

if (newFolderBtn) {

    newFolderBtn.onclick = () => {

        const folder =
            prompt(
                "Nom du dossier"
            );

        if (!folder) return;

        tracks.push({

            title:
                "Nouvelle piste",

            artist:
                "Unknown",

            album:
                "Sans album",

            folder:
                folder,

            volume:
                100,

            dateAdded:
                new Date()
                .toISOString(),

            file: ""
        });

        saveLibrary();

        render(tracks);
    };
}

/* =========================
   RENAME FOLDER
========================= */

const renameFolderBtn =
    document.getElementById(
        "renameFolder"
    );

if (renameFolderBtn) {

    renameFolderBtn.onclick = () => {

        const track =
            tracks[current];

        if (!track) return;

        const oldFolder =
            track.folder;

        const newFolder =
            prompt(
                "Nouveau nom",
                oldFolder
            );

        if (!newFolder) return;

        tracks.forEach(t => {

            if (
                t.folder ===
                oldFolder
            ) {

                t.folder =
                    newFolder;
            }
        });

        saveLibrary();

        render(tracks);
    };
}

/* =========================
   NEW ALBUM
========================= */

const newAlbumBtn =
    document.getElementById(
        "newAlbum"
    );

if (newAlbumBtn) {

    newAlbumBtn.onclick = () => {

        const album =
            prompt(
                "Nom du nouvel album"
            );

        if (!album) return;

        tracks.push({

            title:
                "Nouvelle piste",

            artist:
                "Unknown",

            album:
                album,

            folder:
                "Albums",

            volume:
                100,

            dateAdded:
                new Date()
                .toISOString(),

            file: ""
        });

        saveLibrary();

        render(tracks);
    };
}

/* =========================
   RENAME ALBUM
========================= */

const renameAlbumBtn =
    document.getElementById(
        "renameAlbum"
    );

if (renameAlbumBtn) {

    renameAlbumBtn.onclick = () => {

        const track =
            tracks[current];

        if (!track) return;

        const oldAlbum =
            track.album;

        const newAlbum =
            prompt(
                "Nouveau nom de l'album",
                oldAlbum
            );

        if (!newAlbum) return;

        tracks.forEach(t => {

            if (
                t.album ===
                oldAlbum
            ) {

                t.album =
                    newAlbum;
            }
        });

        saveLibrary();

        render(tracks);
    };
}

/* =========================
   DELETE ALBUM
========================= */

const deleteAlbumBtn =
    document.getElementById(
        "deleteAlbum"
    );

if (deleteAlbumBtn) {

    deleteAlbumBtn.onclick = () => {

        const track =
            tracks[current];

        if (!track) return;

        const album =
            track.album;

        if (
            !confirm(
                `Supprimer tout l'album "${album}" ?`
            )
        ) {
            return;
        }

        tracks =
            tracks.filter(
                t =>
                    t.album !==
                    album
            );

        saveLibrary();

        render(tracks);

        audio.pause();
    };
}

/* =========================
   CHANGE COVER
========================= */

const coverInput =
    document.getElementById(
        "coverInput"
    );

const changeCoverBtn =
    document.getElementById(
        "changeCover"
    );

if (
    changeCoverBtn &&
    coverInput
) {

    changeCoverBtn.onclick = () => {

        if (
            !tracks[current]
        ) return;

        coverInput.click();
    };

    coverInput.addEventListener(
        "change",
        e => {

            const file =
                e.target.files[0];

            if (
                !file ||
                !tracks[current]
            ) {
                return;
            }

            tracks[current].cover =
                URL.createObjectURL(
                    file
                );

            saveLibrary();

            render(tracks);
        }
    );
}

/* =========================
   AUTO SAVE
========================= */

window.addEventListener(
    "beforeunload",
    () => {

        saveLibrary();
    }
);

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
