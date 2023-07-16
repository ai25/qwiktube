/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [
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
              bg: "#282a36",
              fg: "#44475a",
              primary: "#f8f8f2",
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
              bg: "#272822",
              fg: "#49483e",
              primary: "#f8f8f2",
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
              bg: "#f6f8fa",
              fg: "#8b949e",
              primary: "#24292e",
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
              bg: "#36393f",
              fg: "#72767d",
              primary: "#ffffff",
              secondary: "#b9bbbe",
              accent1: "#7289da",
              accent2: "#43b581",
              highlight: "#f04747",
              navFooter: "#202225",
            },
          },
        },
        {
          name: "kawaii",
          extend: {
            colors: {
              bg: "#FFFFFF",
              fg: "#ffffe3",
              primary: "#5A189A",
              secondary: "#9BD1FF",
              accent1: "#D9B5FF",
              accent2: "#A6E6A1",
              highlight: "#ffdef2",
              navFooter: "#FFCC99",
            },
          },
        },
      ],
    }),
  ],
};
