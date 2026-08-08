// Prettier configuration.
// Docs: https://prettier.io/docs/en/configuration.html
/** @type {import("prettier").Config} */
const config = {
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: "all",
  printWidth: 80,
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
