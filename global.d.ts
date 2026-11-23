// Ambient declarations for plain stylesheet imports.
// Next.js ships types for `*.module.css` only, so side-effect imports such as
// `import "./globals.css"` need an explicit declaration when the editor or
// compiler enables `noUncheckedSideEffectImports`.
declare module "*.css";
