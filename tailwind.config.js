/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("vidstack/tailwind.cjs"),
    require("tailwindcss-themer")({
      defaultTheme: {
        // put the default values of any config you want themed
        // just as if you were to extend tailwind's theme like normal https://tailwindcss.com/docs/theme#extending-the-default-theme
        extend: {
          // colors is used here for demonstration purposes
          colors: {
            primary: "red",
          },
        },
      },
      themes: [
        {
          name: "dracula",
          extend: {
            colors: {
              bg1: "#181820",
              bg2: "#282a36",
              bg3: "#383a4a",
              text1: "#f8f8f2",
              text2: "#d8d8c2",
              primary: "#bd93f9",
              secondary: "#50fa7b",
              accent1: "#ffb86c",
              accent2: "#ff79c6",
              highlight: "#bd93f9",
              navFooter: "#6272a4",
            },
          },
        },
        {
          name: "monokai",
          extend: {
            colors: {
              bg1: "#171712",
              bg2: "#272822",
              bg3: "#373832",
              text1: "#f8f8f2",
              text2: "#d8d8c2",
              primary: "#f92672",
              secondary: "#a6e22e",
              accent1: "#e6db74",
              accent2: "#66d9ef",
              highlight: "#f92672",
              navFooter: "#75715e",
            },
          },
        },
        {
          name: "github",
          extend: {
            colors: {
              bg1: "#e6e8ea",
              bg2: "#f6f8fa",
              bg3: "#e6e8ea",
              text1: "#24292e",
              text2: "#2c2c2e",
              primary: "#0366d6",
              secondary: "#6a737d",
              accent1: "#0366d6",
              accent2: "#22863a",
              highlight: "#d73a49",
              navFooter: "#959da5",
            },
          },
        },
        {
          name: "discord",
          extend: {
            colors: {
              bg1: "#26272f",
              bg2: "#36393f",
              bg3: "#464a4f",
              text1: "#ffffff",
              text2: "#d0d0d0",
              primary: "#7289da",
              secondary: "#b9bbbe",
              accent1: "#f04747",
              accent2: "#43b581",
              highlight: "#7289da",
              navFooter: "#202225",
            },
          },
        },
        {
          name: "kawaii",
          extend: {
            colors: {
              bg1: "#ededed",
              bg2: "#FFFFFF",
              bg3: "#f8f8f8",
              text1: "#5A189A",
              text2: "#4A087A",
              primary: "#5A189A",
              secondary: "#9BD1FF",
              accent1: "#D9B5FF",
              accent2: "#ffdef2",
              highlight: "#FFe06E",
              navFooter: "#FFCC99",
            },
          },
        },
      ],
    }),
  ],
};
