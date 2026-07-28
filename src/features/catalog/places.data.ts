import type { TouristPlace } from "./types";

// The real catalog: one entry per file in public/images/places/, in the same order.
// `imageUrl` carries the extension verbatim because the folder mixes .jpg and .webp —
// deriving it from the id would silently 404 half the deck. The id itself stays the
// ASCII kebab-case basename of the file (no ñ, no accents): a non-ASCII path has to be
// percent-encoded to survive Tauri's tauri.localhost origin and the NSIS installer, and
// that is a failure that only shows up in the packaged .exe.
// places.data.test.ts asserts every one of these files actually exists on disk, so a
// renamed image fails the test suite instead of the board.
export const CATALOG: readonly TouristPlace[] = [
  {
    id: "banos-del-inca",
    name: "Baños del Inca",
    imageUrl: "./images/places/banos-del-inca.webp",
  },
  {
    id: "canon-del-colca",
    name: "Cañón del Colca",
    imageUrl: "./images/places/canon-del-colca.jpg",
  },
  {
    id: "chan-chan",
    name: "Chan Chan",
    imageUrl: "./images/places/chan-chan.jpg",
  },
  {
    id: "cuarto-de-rescate",
    name: "Cuarto del Rescate",
    imageUrl: "./images/places/cuarto-de-rescate.jpg",
  },
  {
    id: "cumbemayo",
    name: "Cumbemayo",
    imageUrl: "./images/places/cumbemayo.jpg",
  },
  {
    id: "granja-porcon",
    name: "Granja Porcón",
    imageUrl: "./images/places/granja-porcon.webp",
  },
  {
    id: "huaca-del-sol-y-luna",
    name: "Huacas del Sol y la Luna",
    imageUrl: "./images/places/huaca-del-sol-y-luna.jpg",
  },
  {
    id: "huacachina",
    name: "Huacachina",
    imageUrl: "./images/places/huacachina.jpg",
  },
  {
    id: "kuntur-wasi",
    name: "Kuntur Wasi",
    imageUrl: "./images/places/kuntur-wasi.jpg",
  },
  {
    id: "lago-titicaca",
    name: "Lago Titicaca",
    imageUrl: "./images/places/lago-titicaca.jpg",
  },
  {
    id: "laguna-de-humantai",
    name: "Laguna Humantay",
    imageUrl: "./images/places/laguna-de-humantai.jpg",
  },
  {
    id: "laguna-san-nicolas",
    name: "Laguna San Nicolás",
    imageUrl: "./images/places/laguna-san-nicolas.jpg",
  },
  {
    id: "lineas-de-nazca",
    name: "Líneas de Nazca",
    imageUrl: "./images/places/lineas-de-nazca.jpg",
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    imageUrl: "./images/places/machu-picchu.jpg",
  },
  {
    id: "monasterio-santa-catalina",
    name: "Monasterio de Santa Catalina",
    imageUrl: "./images/places/monasterio-santa-catalina.jpg",
  },
  {
    id: "montana-7-colores",
    name: "Montaña de 7 Colores",
    imageUrl: "./images/places/montana-7-colores.jpg",
  },
  {
    id: "parque-nacional-huascaran",
    name: "Parque Nacional Huascarán",
    imageUrl: "./images/places/parque-nacional-huascaran.jpg",
  },
  {
    id: "plaza-mayor-de-lima",
    name: "Plaza Mayor de Lima",
    imageUrl: "./images/places/plaza-mayor-de-lima.jpg",
  },
  {
    id: "sacsayhuaman",
    name: "Sacsayhuamán",
    imageUrl: "./images/places/sacsayhuaman.jpg",
  },
  {
    id: "santa-apolonia",
    name: "Cerro Santa Apolonia",
    imageUrl: "./images/places/santa-apolonia.jpg",
  },
  {
    id: "ventanilla-de-otuzco",
    name: "Ventanillas de Otuzco",
    imageUrl: "./images/places/ventanilla-de-otuzco.jpg",
  },
];
