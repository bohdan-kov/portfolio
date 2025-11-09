<template>
  <div class="portfolio-page">
    <header class="portfolio-page__header">
      <svg
        viewBox="0 0 2458 186"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#noise-filter)">
          <text
            x="50%"
            y="55%"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="white"
            font-family="Montserrat, 'Helvetica Neue', Arial, sans-serif"
            font-size="180"
            font-weight="700"
          >
            KOVAL BOHDAN
          </text>
        </g>
        <defs>
          <filter
            id="noise-filter"
            x="0"
            y="0"
            width="2458"
            height="186"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.909"
              stitchTiles="stitch"
              numOctaves="3"
              result="noise"
              seed="162"
            />
            <feComponentTransfer in="noise" result="coloredNoise">
              <feFuncR type="linear" slope="2" intercept="-0.5" />
              <feFuncG type="linear" slope="2" intercept="-0.5" />
              <feFuncB type="linear" slope="2" intercept="-0.5" />
              <feFuncA
                type="discrete"
                tableValues="1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0"
              />
            </feComponentTransfer>
            <feComposite
              operator="in"
              in2="shape"
              in="coloredNoise"
              result="noiseClipped"
            />
            <feComponentTransfer in="noiseClipped" result="colorEffect">
              <feFuncA type="table" tableValues="0 0.81" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="shape" />
              <feMergeNode in="colorEffect" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </header>

    <main class="portfolio-page__content">
      <section
        v-for="section in sections"
        :key="section.id"
        class="portfolio-page__section"
        :class="`portfolio-page__section--${section.id}`"
      >
        <h2 class="portfolio-page__section-title">{{ section.title }}</h2>
        <div
          v-for="(item, index) in section.items"
          :key="index"
          class="portfolio-page__item"
        >
          <div class="portfolio-page__item-content">
            <img
              src="@/assets/images/star.svg"
              alt=""
              class="portfolio-page__item-icon"
            />
            <p class="portfolio-page__item-text">
              {{ item.text }}
              <span
                v-if="item.description"
                class="portfolio-page__item-description"
              >
                {{ item.description }}
              </span>
            </p>
          </div>
          <img
            v-if="item.line"
            src="@/assets/images/line.svg"
            alt=""
            class="portfolio-page__item-divider"
          />
        </div>
      </section>

      <aside class="portfolio-page__links">
        <ul class="portfolio-page__links-list">
          <li v-for="link in links" :key="link.id">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="portfolio-page__links-link"
            >
              {{ link.title }}
            </a>
          </li>
        </ul>
        <img
          src="@/assets/images/line.svg"
          alt=""
          class="portfolio-page__links-divider"
        />
      </aside>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";

const calculateDuration = (startDate, endDate = null) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());

  if (totalMonths === 0) return "less than a month";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0) return `${months} month${months > 1 ? "s" : ""}`;
  if (months === 0) return `${years} year${years > 1 ? "s" : ""}`;

  return `${years} year${years > 1 ? "s" : ""} ${months} month${
    months > 1 ? "s" : ""
  }`;
};

const sections = computed(() => [
  {
    id: "about",
    title: "About me",
    items: [
      {
        text: "I am a motivated front-end developer and information systems student who is passionate about creating interactive web interfaces and constantly improving my coding skills.",
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    items: [
      {
        text: "Front-End Developer — SkyService POS",
        description: `Contributed to building intuitive Vue-based interfaces, improving product usability and customer experience through close team collaboration.\nOct 2024 – Present (${calculateDuration(
          "2024-10-01"
        )})`,
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    items: [
      {
        text: "Bachelor of Information Systems (Expected 2027)",
        description:
          'National Technical University of Ukraine "Igor Sikorsky Kyiv Polytechnic Institute"',
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    items: [
      { text: "Ukrainian (Native)" },
      { text: "English (B1)" },
      { text: "Vue 2 / Vue 3" },
      { text: "Nuxt 4" },
      { text: "JavaScript (ES6+)" },
      { text: "HTML / CSS / Tailwind" },
      { text: "Git / GitHub", line: true },
      { text: "Node.js" },
      { text: "REST API" },
      { text: "SQL / Databases" },
    ],
  },
]);

const links = computed(() => [
  { id: "github", title: "GitHub", url: "https://github.com/bohdan-kov" },
  {
    id: "linkedin",
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/bohdan-kov/",
  },
  { id: "telegram", title: "Telegram", url: "https://t.me/KovalBohdan" },
]);
</script>

<style scoped>
.portfolio-page__header {
  margin-top: 16px;
}

.portfolio-page__content {
  position: fixed;
  top: 50%;
  left: 50%;
}

.portfolio-page__section {
  position: absolute;
}

.portfolio-page__section-title {
  font-size: 40px;
  line-height: 1.2;
  margin-bottom: 8px;
}

.portfolio-page__item {
  margin-bottom: 4px;
}

.portfolio-page__item-content {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.portfolio-page__item-icon {
  flex-shrink: 0;
  margin-top: 4px;
}

.portfolio-page__item-text {
  margin: 0;
}

.portfolio-page__item-description {
  display: block;
  font-size: 15px;
  color: #a4a4a4;
  white-space: pre-line;
}

.portfolio-page__item-divider {
  width: 100%;
  margin: 8px 0;
}

.portfolio-page__section--about {
  left: -550px;
  top: -260px;
  width: 400px;
}

.portfolio-page__section--experience {
  left: 140px;
  top: -230px;
  width: 500px;
}

.portfolio-page__section--education {
  left: -500px;
  top: 110px;
  width: 450px;
}

.portfolio-page__section--skills {
  left: 200px;
  top: -10px;
  width: 280px;
}

.portfolio-page__links {
  position: absolute;
  top: -300px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 270px;
}

.portfolio-page__links-divider {
  width: 100%;
}

.portfolio-page__links-list {
  display: flex;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.portfolio-page__links-link {
  text-decoration: none;
  color: #ababab;
  transition: all 0.2s ease;
}

.portfolio-page__links-link:hover {
  transform: scale(1.2);
  color: white;
}
</style>
