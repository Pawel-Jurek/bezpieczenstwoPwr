import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: "en",
  title: "Bezpieczenstwo PWr",
  description: "Docs for our packages",
  srcDir: "src",
  cleanUrls: true,
  base: "/bezpieczenstwoPwr/docs/",
  locales: {
    root: {
      label: "English",
      lang: "en",
    },
    pl: {
      label: "Polski",
      lang: "pl",
      themeConfig: {
        nav: [
          {
            text: "Strona startowa",
            link: "/pl",
          },
          {
            text: "Zaczynanie",
            link: "/pl/getting-started",
          },
          {
            text: "Pakiety",
            link: "/pl/packages",
          },
          {
            text: "Przyklady",
            link: "/pl/examples",
          },
        ],
        sidebar: [
          {
            text: "Pierwsze kroki",
            items: [
              {
                text: "Instalacja i użycie",
                link: "/getting-started",
              },
            ],
          },
          {
            text: "Pakiety",
            items: [{ text: "Pakiety", link: "/packages" }],
          },
          {
            text: "Przykłady",
            items: [
              {
                text: "Przykłady",
                link: "/examples",
              },
            ],
          },
          {
            text: "Dane i modele",
            items: [{ text: "Dane i modele", link: "/data-and-models" }],
          },
          {
            text: "Dziennik zmian",
            items: [
              {
                text: "Dziennik zmian",
                link: "/changelog",
              },
            ],
          },
        ],
      },
    },
  },
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting started", link: "/getting-started" },
      { text: "Packages", link: "/packages" },
      { text: "Examples", link: "/examples" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          {
            text: "Installation and usage",
            link: "/getting-started",
          },
        ],
      },
      {
        text: "Packages",
        items: [{ text: "Packages", link: "/packages" }],
      },
      {
        text: "Examples",
        items: [
          {
            text: "Examples",
            link: "/examples",
          },
        ],
      },
      {
        text: "Data and models",
        items: [{ text: "Data and models", link: "/data-and-models" }],
      },
      {
        text: "Changelog",
        items: [
          {
            text: "Changelog",
            link: "/changelog",
          },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/Pawel-Jurek/bezpieczenstwoPwr",
      },
      { icon: "npm", link: "https://npmjs.com/bbotd" },
    ],
  },
});
