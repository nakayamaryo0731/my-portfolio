// Posts page client-side logic
import type { PostItem } from "./types";
import { EXTERNAL_URLS } from "./constants";
import { formatDateJP, getPostTarget, renderSourceBadge } from "./helpers";

const getYearMonth = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const getYear = (dateStr: string) => new Date(dateStr).getFullYear().toString();

let allPosts: PostItem[] = [];
let selectedYear = "";
let selectedMonth = "";
let selectedTags: Set<string> = new Set();

function renderPosts(posts: PostItem[]) {
  const listContainer = document.getElementById("posts-list");
  const resultsCount = document.getElementById("results-count");
  if (!listContainer || !resultsCount) return;

  resultsCount.textContent = `${posts.length} posts`;

  if (posts.length === 0) {
    listContainer.innerHTML = '<li class="text-gray-500">No posts found.</li>';
    return;
  }

  listContainer.innerHTML = posts.map((post) => `
    <li class="border-b border-neutral-700 pb-4">
      <a href="${post.link}" target="${getPostTarget(post.source)}" class="group block">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          ${renderSourceBadge(post.source)}
          <h2 class="text-lg font-medium group-hover:text-primary-400 transition-colors">${post.title}</h2>
        </div>
        ${post.description ? `<p class="text-gray-400 text-sm line-clamp-2">${post.description}</p>` : ""}
        <div class="flex items-center gap-2 mt-1 flex-wrap">
          <time class="text-xs text-gray-500">${formatDateJP(post.pubDate)}</time>
          ${post.tags ? post.tags.map(tag => `<span class="text-xs text-gray-500">#${tag}</span>`).join("") : ""}
        </div>
      </a>
    </li>
  `).join("");
}

function filterPosts() {
  let filtered = allPosts;

  if (selectedYear && !selectedMonth) {
    filtered = filtered.filter(post => getYear(post.pubDate) === selectedYear);
  }

  if (selectedMonth) {
    filtered = filtered.filter(post => getYearMonth(post.pubDate) === selectedMonth);
  }

  if (selectedTags.size > 0) {
    filtered = filtered.filter(post => post.tags && post.tags.some(tag => selectedTags.has(tag)));
  }

  renderPosts(filtered);
}

function setupArchive(posts: PostItem[]) {
  const nav = document.getElementById("archive-nav");
  const select = document.getElementById("archive-select") as HTMLSelectElement;
  if (!nav) return;

  const yearMonthMap: Record<string, Record<string, number>> = {};
  const yearCounts: Record<string, number> = {};

  posts.forEach(post => {
    const year = getYear(post.pubDate);
    const month = getYearMonth(post.pubDate).split("-")[1];
    if (!yearMonthMap[year]) yearMonthMap[year] = {};
    if (!yearMonthMap[year][month]) yearMonthMap[year][month] = 0;
    yearMonthMap[year][month]++;
    if (!yearCounts[year]) yearCounts[year] = 0;
    yearCounts[year]++;
  });

  const years = Object.keys(yearMonthMap).sort().reverse();

  // Desktop nav
  nav.innerHTML = years.map(year => {
    const months = Object.keys(yearMonthMap[year]).sort();
    return `
      <div class="mb-1">
        <div class="archive-year flex items-center gap-2 py-1 cursor-pointer text-sm text-gray-200 hover:text-white" data-year="${year}">
          <svg style="width: 1rem; height: 1rem;" class="transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
          </svg>
          <span>${year}</span>
          <span class="text-gray-500 text-xs">(${yearCounts[year]})</span>
        </div>
        <div class="archive-months ml-6">
          ${months.map(month => `
            <div class="archive-month block py-1 text-sm text-gray-400 cursor-pointer hover:text-primary-400" data-month="${year}-${month}">
              ${parseInt(month)}月 <span class="text-gray-500 text-xs">(${yearMonthMap[year][month]})</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  // Year click - toggle collapse
  nav.querySelectorAll(".archive-year").forEach(yearEl => {
    yearEl.addEventListener("click", () => {
      const months = yearEl.nextElementSibling as HTMLElement;
      const svg = yearEl.querySelector("svg");
      const isCollapsed = yearEl.classList.toggle("collapsed");
      months?.classList.toggle("hidden", isCollapsed);
      svg?.classList.toggle("-rotate-90", isCollapsed);
    });
  });

  // Month click - filter
  nav.querySelectorAll(".archive-month").forEach(monthEl => {
    monthEl.addEventListener("click", (e) => {
      e.stopPropagation();
      nav.querySelectorAll(".archive-month").forEach(el => {
        el.classList.remove("text-primary-400");
        el.classList.add("text-gray-400");
      });
      monthEl.classList.remove("text-gray-400");
      monthEl.classList.add("text-primary-400");
      selectedMonth = (monthEl as HTMLElement).dataset.month || "";
      selectedYear = "";
      filterPosts();
    });
  });

  // Mobile select
  if (select) {
    years.forEach(year => {
      const months = Object.keys(yearMonthMap[year]).sort();
      months.forEach(month => {
        const option = document.createElement("option");
        option.value = `${year}-${month}`;
        option.textContent = `${year}年${parseInt(month)}月 (${yearMonthMap[year][month]})`;
        select.appendChild(option);
      });
    });

    select.addEventListener("change", () => {
      selectedMonth = select.value;
      selectedYear = "";
      filterPosts();
    });
  }
}

function setupTags(posts: PostItem[]) {
  const section = document.getElementById("tags-section");
  const nav = document.getElementById("tags-nav");
  const mobile = document.getElementById("tags-mobile");
  if (!section || !nav) return;

  const tagCounts: Record<string, number> = {};
  posts.forEach(post => {
    post.tags?.forEach(tag => {
      if (!tagCounts[tag]) tagCounts[tag] = 0;
      tagCounts[tag]++;
    });
  });

  const tags = Object.keys(tagCounts).sort();
  if (tags.length === 0) return;

  section.classList.remove("hidden");

  const renderTags = (container: HTMLElement) => {
    container.innerHTML = tags.map(tag =>
      `<span class="tag-chip text-xs rounded-full bg-neutral-700 text-gray-400 cursor-pointer transition-all hover:bg-neutral-600 hover:text-gray-200" style="padding: 0.25rem 0.75rem;" data-tag="${tag}">${tag}</span>`
    ).join("");

    container.querySelectorAll(".tag-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const tag = (chip as HTMLElement).dataset.tag!;
        if (selectedTags.has(tag)) {
          selectedTags.delete(tag);
          chip.classList.remove("bg-primary-500", "text-white");
          chip.classList.add("bg-neutral-700", "text-gray-400");
        } else {
          selectedTags.add(tag);
          chip.classList.remove("bg-neutral-700", "text-gray-400");
          chip.classList.add("bg-primary-500", "text-white");
        }
        filterPosts();
      });
    });
  };

  renderTags(nav);

  if (mobile) {
    mobile.classList.remove("hidden");
    mobile.classList.add("flex");
    renderTags(mobile);
  }
}

async function loadPosts() {
  const listContainer = document.getElementById("posts-list");
  const summaryContainer = document.getElementById("posts-summary");
  if (!listContainer || !summaryContainer) return;

  try {
    const response = await fetch("/api/posts");
    if (!response.ok) throw new Error("Failed to fetch");

    allPosts = await response.json();

    if (allPosts.length === 0) {
      listContainer.innerHTML = '<li class="text-gray-500">No posts yet.</li>';
      return;
    }

    const blogCount = allPosts.filter(p => p.source === "Blog").length;
    const zennCount = allPosts.filter(p => p.source === "Zenn").length;
    const noteCount = allPosts.filter(p => p.source === "note").length;

    summaryContainer.innerHTML = `
      <span class="text-gray-400">Sources:</span>
      <a href="/blog" class="text-primary-400 hover:underline">Blog (${blogCount})</a>
      <a href="${EXTERNAL_URLS.zenn}" target="_blank" class="text-blue-400 hover:underline">Zenn (${zennCount})</a>
      <a href="${EXTERNAL_URLS.note}" target="_blank" class="text-green-400 hover:underline">note (${noteCount})</a>
    `;

    setupArchive(allPosts);
    setupTags(allPosts);
    renderPosts(allPosts);
  } catch (error) {
    listContainer.innerHTML = '<li class="text-gray-500">Failed to load posts.</li>';
  }
}

// Initialize
loadPosts();
