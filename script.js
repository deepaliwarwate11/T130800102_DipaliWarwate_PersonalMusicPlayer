// ---------------------------
// script.js (corrected)
// ---------------------------

// Song Database (use your actual files in songs/ and images/)
const songs = [
  { title: "beliver", artist: "Arijit Singh", src: "songs/beliver.mp3", img: "images/beliver.jpg" },
  { title: "partyover", artist: "Shreya Ghoshal", src: "songs/partyover.mp3", img: "images/partyover.jpg" },
  { title: "dreamypattern", artist: "Lata Mangeshkar", src: "songs/dreamypattern.mp3", img: "images/dreamypattern.jpg" },
  { title: "krishna flute", artist: "Arijit Singh", src: "songs/krishna flute.mp3", img: "images/krishna flute.jpg" },
  { title: "radhakrishna", artist: "Arijit Singh", src: "songs/radhakrishna.mp3", img: "images/radhakrishna.jpg" },
  { title: "na-na-grove", artist: "Arijit Singh", src: "songs/na-na-grove.mp3", img: "images/na-na-grove.jpg" },
  { title: "diss-na-wid-zow", artist: "Arijit Singh", src: "songs/diss-na-wid-zow.mp3", img: "images/diss-na-wid-zow.jpg" }
];

// State
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// Elements (make sure IDs exist in your HTML)
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const progress = document.getElementById("progress");
const titleEl = document.getElementById("song-title");
const artistEl = document.getElementById("song-artist");
const albumArt = document.getElementById("album-art");
const playlistEl = document.getElementById("playlist");
const favoritesListEl = document.getElementById("favorites");
const recentlyListEl = document.getElementById("recently-played");
const visitorCounter = document.getElementById("visitor-counter");

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Load localStorage data (only once)
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let recentlyPlayed = JSON.parse(localStorage.getItem("recently") || "[]");

// ---------- Helpers ----------
function isFavoriteSong(song) {
  return favorites.some(f => f.src === song.src && f.title === song.title && f.artist === song.artist);
}

function saveFavoritesToStorage() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function saveRecentlyToStorage() {
  localStorage.setItem("recently", JSON.stringify(recentlyPlayed));
}

// ---------- Rendering ----------
function renderPlaylist(filtered = songs) {
  playlistEl.innerHTML = "";
  filtered.forEach(song => {
    // find original index in songs array
    const index = songs.findIndex(s => s.src === song.src && s.title === song.title && s.artist === song.artist);

    const li = document.createElement("li");
    li.className = "playlist-item";
    li.dataset.index = index;
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.padding = "6px 10px";

    const textSpan = document.createElement("span");
    textSpan.innerHTML = `<span class="song-title">${song.title}</span> - <span class="song-artist">${song.artist}</span>`;
    textSpan.style.cursor = "pointer";

    // Play when clicking the text
    textSpan.addEventListener("click", () => {
      currentIndex = index;
      loadSong(currentIndex);
      audio.play();
      isPlaying = true;
      playBtn.textContent = "⏸";
      updateRecentlyPlayed(songs[currentIndex]);
    });

    // Favorite toggle button for each item
    const favBtn = document.createElement("button");
    favBtn.className = "add-fav-btn";
    favBtn.title = "Toggle Favorite";
    favBtn.style.marginLeft = "12px";
    favBtn.style.cursor = "pointer";
    favBtn.textContent = isFavoriteSong(song) ? "💖" : "☆";

    favBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent triggering the play
      toggleFavoriteByIndex(index);
    });

    li.appendChild(textSpan);
    li.appendChild(favBtn);
    playlistEl.appendChild(li);
  });
}

function renderFavorites() {
  favoritesListEl.innerHTML = "";
  if (favorites.length === 0) {
    favoritesListEl.innerHTML = "<p>No favorites yet.</p>";
    return;
  }
  favorites.forEach(song => {
    const li = document.createElement("li");
    li.textContent = `${song.title} - ${song.artist}`;
    li.style.padding = "4px 8px";
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      // play favorite when clicked
      const idx = songs.findIndex(s => s.src === song.src && s.title === song.title && s.artist === song.artist);
      if (idx >= 0) {
        currentIndex = idx;
        loadSong(currentIndex);
        audio.play();
        isPlaying = true;
        playBtn.textContent = "⏸";
        updateRecentlyPlayed(songs[currentIndex]);
      }
    });
    favoritesListEl.appendChild(li);
  });
}

function renderRecently() {
  recentlyListEl.innerHTML = "";
  if (recentlyPlayed.length === 0) {
    recentlyListEl.innerHTML = "<p>No recently played songs.</p>";
    return;
  }
  recentlyPlayed.forEach(song => {
    const li = document.createElement("li");
    li.textContent = `${song.title} - ${song.artist}`;
    li.style.padding = "4px 8px";
    recentlyListEl.appendChild(li);
  });
}

// ---------- Core behaviors ----------
function loadSong(index) {
  if (index < 0 || index >= songs.length) return;
  const song = songs[index];
  audio.src = song.src;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  albumArt.src = song.img || "";
  // update playlist UI (to refresh stars)
  renderPlaylist(getCurrentSearchFilteredSongs());
}

function togglePlay() {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸";
    isPlaying = true;
  } else {
    audio.pause();
    playBtn.textContent = "▶";
    isPlaying = false;
  }
}

function nextSong() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * songs.length);
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  loadSong(currentIndex);
  audio.play();
  isPlaying = true;
  playBtn.textContent = "⏸";
  updateRecentlyPlayed(songs[currentIndex]);
}

function prevSong() {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  audio.play();
  isPlaying = true;
  playBtn.textContent = "⏸";
  updateRecentlyPlayed(songs[currentIndex]);
}

function toggleFavoriteByIndex(index) {
  const song = songs[index];
  const favIndex = favorites.findIndex(f => f.src === song.src && f.title === song.title && f.artist === song.artist);
  if (favIndex >= 0) {
    // remove
    favorites.splice(favIndex, 1);
  } else {
    // add
    favorites.push(song);
  }
  saveFavoritesToStorage();
  renderFavorites();
  renderPlaylist(getCurrentSearchFilteredSongs()); // refresh star icons
}

function updateRecentlyPlayed(song) {
  // remove duplicates of same song (based on src/title/artist)
  recentlyPlayed = recentlyPlayed.filter(s => !(s.src === song.src && s.title === song.title && s.artist === song.artist));
  recentlyPlayed.unshift(song);
  if (recentlyPlayed.length > 5) recentlyPlayed.pop();
  saveRecentlyToStorage();
  renderRecently();
}

// ---------- Progress/Volume/Search ----------
// progress update
audio.addEventListener("timeupdate", () => {
  progress.value = (audio.currentTime / audio.duration) * 100 || 0;
});

// seek bar
progress.addEventListener("input", () => {
  if (!audio.duration) return;
  audio.currentTime = (progress.value / 100) * audio.duration;
});

// shuffle & repeat
shuffleBtn.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.background = isShuffle ? "yellow" : "";
});
repeatBtn.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeatBtn.style.background = isRepeat ? "yellow" : "";
});

// when song ends
audio.addEventListener("ended", () => {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextSong();
  }
});

// ---------- Search helpers ----------
function getCurrentSearchFilteredSongs() {
  const q = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : "";
  if (!q) return songs;
  return songs.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.artist.toLowerCase().includes(q)
  );
}

if (searchInput) {
  // live search
  searchInput.addEventListener("input", () => {
    renderPlaylist(getCurrentSearchFilteredSongs());
  });
}
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    renderPlaylist(getCurrentSearchFilteredSongs());
  });
}

// ---------- Visitor counter ----------
let visits = parseInt(localStorage.getItem("visits") || "0", 10);
visits = visits + 1;
localStorage.setItem("visits", visits);
if (visitorCounter) visitorCounter.textContent = `👥 Visitors: ${visits}`;

// ---------- Event bindings ----------
if (playBtn) playBtn.addEventListener("click", togglePlay);
if (nextBtn) nextBtn.addEventListener("click", nextSong);
if (prevBtn) prevBtn.addEventListener("click", prevSong);

// ---------- Initialize UI ----------
renderPlaylist();        // initial full playlist
renderFavorites();       // show favorites from storage
renderRecently();        // show recently played from storage
loadSong(currentIndex);  // show first song
