// Ambient declaration for the side-effect CSS import (`import './styles/vscode.css'`).
// Lives inside the dts `include` path so the declaration-rollup (api-extractor)
// resolves it; vite/client's types are out of scope for that isolated pass.
declare module '*.css';
