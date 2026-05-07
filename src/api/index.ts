/**
 * @file index.ts — API shim that switches between real and mock implementations.
 *
 * TypeScript always type-checks against studentApi.ts (the real types).
 * At runtime, when VITE_USE_MOCK=true Vite's define replaces the constant so
 * the if-branch resolves to mockApi exports; the else-branch is tree-shaken.
 *
 * All hooks and components should import from "../api/index" rather than
 * directly from studentApi or mockApi.
 */

export * from "./studentApi";
