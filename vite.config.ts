import path from "node:path"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

/**
 * Identificador único de cada build. Se incrusta en el bundle (`__BUILD_ID__`)
 * y se publica en `version.json`: comparando los dos, la app sabe si hay una
 * versión nueva desplegada (ver useVersionNueva). Es una marca de tiempo y no
 * el sha de git porque `.git` no entra en la imagen de Docker.
 */
const BUILD_ID = `${new Date()
  .toISOString()
  .replace(/[-:]/g, "")
  .slice(0, 15)}-${Math.random().toString(36).slice(2, 6)}`

/** Emite `version.json` junto al bundle, con el mismo id que lleva el código. */
function versionJson(): Plugin {
  return {
    name: "full-box-version-json",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: JSON.stringify({ build: BUILD_ID }),
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), versionJson()],
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
  },
})
