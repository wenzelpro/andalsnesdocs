const manifestUrl = "kraftfondet/manifest.json";
const list = document.querySelector("#dataset-list");
const statusEl = document.querySelector("#status");
const searchInput = document.querySelector("#search");
const yearSelect = document.querySelector("#year-filter");

const formatDate = (isoDate) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formatter.format(new Date(isoDate));
};

const createCard = (entry) => {
  const article = document.createElement("article");
  article.className = "card";

  const title = document.createElement("h3");
  title.className = "card__title";
  title.textContent = entry.tittel;
  article.appendChild(title);

  const date = document.createElement("p");
  date.className = "card__date";
  date.textContent = formatDate(entry.dato);
  article.appendChild(date);

  const link = document.createElement("a");
  link.className = "card__link";
  link.href = entry.url;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "Open JSON document";
  article.appendChild(link);

  return article;
};

const renderList = (entries) => {
  list.innerHTML = "";

  if (!entries.length) {
    statusEl.hidden = false;
    statusEl.textContent = "No meetings match the selected filters.";
    list.hidden = true;
    return;
  }

  const fragment = document.createDocumentFragment();
  entries.forEach((entry) => {
    fragment.appendChild(createCard(entry));
  });

  list.appendChild(fragment);
  list.hidden = false;
  statusEl.hidden = true;
};

const filterEntries = (entries) => {
  const query = searchInput.value.trim().toLowerCase();
  const year = yearSelect.value;

  return entries.filter((entry) => {
    const matchesYear = year === "all" || entry.dato.startsWith(year);
    if (!matchesYear) {
      return false;
    }

    if (!query) {
      return true;
    }

    const combinedText = `${entry.tittel} ${entry.dato}`.toLowerCase();
    return combinedText.includes(query);
  });
};

const populateYearSelect = (entries) => {
  const years = Array.from(
    new Set(entries.map((entry) => entry.dato.slice(0, 4)))
  ).sort((a, b) => Number(b) - Number(a));

  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
};

const init = async () => {
  try {
    const response = await fetch(manifestUrl);

    if (!response.ok) {
      throw new Error(`Failed to load manifest (${response.status})`);
    }

    const manifest = await response.json();
    const entries = manifest
      .map((entry) => ({
        ...entry,
        dato: entry.dato,
        tittel: entry.tittel,
      }))
      .sort((a, b) => new Date(b.dato) - new Date(a.dato));

    populateYearSelect(entries);
    renderList(entries);

    const handleChange = () => {
      const filtered = filterEntries(entries);
      renderList(filtered);
    };

    searchInput.addEventListener("input", handleChange);
    yearSelect.addEventListener("change", handleChange);
  } catch (error) {
    statusEl.hidden = false;
    statusEl.textContent =
      "We couldn't load the archive right now. Please refresh the page to try again.";
    console.error(error);
  }
};

init();
