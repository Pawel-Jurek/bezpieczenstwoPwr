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
      { text: "Examples", link: "/examples" },
      { text: "Models", link: "/data-and-models" },
      { text: "Changelog", link: "/changelog" },
    ],
    sidebar: [
      {
        text: "Getting started",
        link: "/getting-started",
        items: [
          {
            text: "Project structure",
            link: "/getting-started#project-structure",
          },
          {
            text: "Running locally",
            link: "/getting-started#running-locally",
          },
        ],
      },
      {
        text: "Packages",
        link: "/packages",
        items: [
          {
            text: "bbotd",
            link: "/packages#bbotd",
          },
          {
            text: "ML model",
            link: "/packages#ml-model",
          },
        ],
      },
      {
        text: "Examples",
        link: "/examples",
        items: [
          {
            text: "Available examples",
            link: "/examples#available-examples",
          },
          { text: "React + Typescript", link: "/examples#react-ts" },
        ],
      },
      {
        text: "Data and models",
        link: "/data-and-models",
        items: [
          {
            text: "Data source",
            link: "/data-and-models#data-source",
          },
          {
            text: "Data processing",
            link: "/data-and-models#data-processing",
          },
          {
            text: "Model architecture",
            link: "/data-and-models#model-architecture",
          },
          {
            text: "Loading models",
            link: "/data-and-models#loading-models",
          },
        ],
      },
      {
        text: "Changelog",
        link: "/changelog",
        items: [
          {
            text: "latest",
            link: "/changelog#latest",
          },
          {
            text: "dev",
            link: "/changelog#dev",
          },
          {
            text: "v0.1.2",
            link: "/changelog#v0-1-2",
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
