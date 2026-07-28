import type { TouristPlace } from "./types";

// The real catalog: one entry per file in public/images/places/, in the same order.
// `imageUrl` carries the extension verbatim because the folder mixes .jpg and .webp —
// deriving it from the id would silently 404 half the deck. The id itself stays the
// ASCII kebab-case basename of the file (no ñ, no accents): a non-ASCII path has to be
// percent-encoded to survive Tauri's tauri.localhost origin and the NSIS installer, and
// that is a failure that only shows up in the packaged .exe.
// places.data.test.ts asserts every one of these files actually exists on disk, so a
// renamed image fails the test suite instead of the board. It also asserts every
// `location`/`description` is present — the PlaceDetailModal (opened from the post-game
// gallery) has nothing sensible to show for a place missing either.
export const CATALOG: readonly TouristPlace[] = [
  {
    id: "banos-del-inca",
    name: "Baños del Inca",
    imageUrl: "./images/places/banos-del-inca.webp",
    location: "Cajamarca, Perú",
    description: [
      "Complejo de aguas termales usado desde tiempos preincaicos, famoso porque aquí se alojó el inca Atahualpa cuando fue capturado por Francisco Pizarro en 1532, en el episodio que marcó el inicio de la conquista española.",
      "Sus aguas alcanzan hasta 70°C y son ricas en minerales con propiedades relajantes y medicinales. Hoy el complejo combina pozas públicas y privadas dentro de un entorno turístico y termal muy visitado.",
    ],
  },
  {
    id: "canon-del-colca",
    name: "Cañón del Colca",
    imageUrl: "./images/places/canon-del-colca.jpg",
    location: "Arequipa, Perú",
    description: [
      "Uno de los cañones más profundos del mundo, con más del doble de profundidad que el Gran Cañón de Colorado. Formado por los volcanes Ampato y Hualca Hualca, atraviesa pueblos coloniales de origen preincaico.",
      "Es el hogar del cóndor andino, que se observa volando cerca del mirador Cruz del Cóndor gracias a las corrientes térmicas del cañón. La zona conserva andenes agrícolas usados desde hace más de mil años.",
    ],
  },
  {
    id: "chan-chan",
    name: "Chan Chan",
    imageUrl: "./images/places/chan-chan.jpg",
    location: "La Libertad, Perú",
    description: [
      "Antigua capital del reino Chimú y la ciudadela de barro más grande de América precolombina, construida entre los siglos IX y XV. Ocupó cerca de 20 km² cerca de la actual ciudad de Trujillo.",
      "Sus muros conservan relieves geométricos y figuras de peces y aves talladas en barro. Fue declarada Patrimonio Cultural de la Humanidad por la UNESCO en 1986 por su valor arquitectónico y urbanístico único.",
    ],
  },
  {
    id: "cuarto-de-rescate",
    name: "Cuarto del Rescate",
    imageUrl: "./images/places/cuarto-de-rescate.jpg",
    location: "Cajamarca, Perú",
    description: [
      "Único edificio inca que se conserva en pie en la ciudad de Cajamarca. Según la tradición, aquí Atahualpa ofreció llenar la habitación de oro y plata a cambio de su libertad tras ser capturado.",
      "A pesar del rescate entregado, Atahualpa fue ejecutado en 1533, un hecho que simboliza el fin del Imperio Inca. El recinto de piedra labrada se mantiene como testimonio de ese episodio histórico.",
    ],
  },
  {
    id: "cumbemayo",
    name: "Cumbemayo",
    imageUrl: "./images/places/cumbemayo.jpg",
    location: "Cajamarca, Perú",
    description: [
      "Complejo arqueológico preincaico famoso por su canal de piedra tallado hace más de 1500 años, considerado una de las obras de ingeniería hidráulica más antiguas de América, usado para trasladar agua entre cuencas.",
      "El paisaje incluye formaciones rocosas naturales conocidas como el Bosque de Piedras y petroglifos grabados por antiguas culturas. Se ubica a más de 3500 metros de altitud, cerca de la ciudad de Cajamarca.",
    ],
  },
  {
    id: "granja-porcon",
    name: "Granja Porcón",
    imageUrl: "./images/places/granja-porcon.webp",
    location: "Cajamarca, Perú",
    description: [
      "Comunidad campesina organizada como cooperativa agropecuaria y forestal, pionera en turismo rural comunitario en el Perú. Combina bosques de pino sembrados por sus pobladores con actividad ganadera y agrícola sostenible.",
      "Ofrece a los visitantes recorridos por establos, viveros y criaderos de truchas, además de paisajes andinos con venados y vicuñas semi domesticadas. Es un modelo reconocido de desarrollo comunitario en la sierra peruana.",
    ],
  },
  {
    id: "huaca-del-sol-y-luna",
    name: "Huacas del Sol y la Luna",
    imageUrl: "./images/places/huaca-del-sol-y-luna.jpg",
    location: "La Libertad, Perú",
    description: [
      "Antiguo centro ceremonial y administrativo de la cultura Moche, construido entre los siglos I y VIII d.C. cerca de Trujillo. La Huaca del Sol fue la pirámide de adobe más grande de la América prehispánica.",
      "La Huaca de la Luna conserva murales polícromos con la imagen del dios Ai Apaec, descubiertos en excelente estado. El sitio revela rituales y la vida cotidiana de una de las culturas más avanzadas del antiguo Perú.",
    ],
  },
  {
    id: "huacachina",
    name: "Huacachina",
    imageUrl: "./images/places/huacachina.jpg",
    location: "Ica, Perú",
    description: [
      "Pequeño oasis natural rodeado de dunas de arena en pleno desierto de Ica, formado alrededor de una laguna de aguas verdosas a la que tradicionalmente se le atribuyen propiedades curativas.",
      "Hoy es uno de los destinos de aventura más visitados del Perú, famoso por el sandboarding y los paseos en buggies sobre las dunas gigantes que rodean el poblado, especialmente al atardecer.",
    ],
  },
  {
    id: "kuntur-wasi",
    name: "Kuntur Wasi",
    imageUrl: "./images/places/kuntur-wasi.jpg",
    location: "Cajamarca, Perú",
    description: [
      "Complejo ceremonial preincaico construido hace más de 2900 años, uno de los centros religiosos más antiguos del norte peruano, asociado a la tradición Chavín en su fase temprana de desarrollo.",
      "En sus tumbas se hallaron piezas de oro entre las más antiguas de América, hoy exhibidas en el museo del sitio. Su nombre significa Casa del Cóndor en quechua, por las esculturas líticas encontradas.",
    ],
  },
  {
    id: "lago-titicaca",
    name: "Lago Titicaca",
    imageUrl: "./images/places/lago-titicaca.jpg",
    location: "Puno, Perú",
    description: [
      "El lago navegable más alto del mundo, compartido entre Perú y Bolivia, considerado por la mitología inca como el lugar de origen de Manco Cápac y Mama Ocllo, fundadores del imperio.",
      "Sus islas flotantes de totora, construidas por la etnia uros, son uno de los atractivos más singulares del Perú. La isla Taquile también conserva tradiciones textiles y agrícolas ancestrales.",
    ],
  },
  {
    id: "laguna-de-humantai",
    name: "Laguna Humantay",
    imageUrl: "./images/places/laguna-de-humantai.jpg",
    location: "Cusco, Perú",
    description: [
      "Laguna glaciar de color turquesa ubicada a más de 4200 metros de altitud, a los pies del nevado Humantay, dentro de la cordillera de Vilcabamba, cerca del pueblo de Mollepata, en la provincia de Anta.",
      "Se ha vuelto uno de los treks de un día más populares del Cusco por su color intenso y su entorno de picos nevados. Para las comunidades locales, el nevado es un apu protector.",
    ],
  },
  {
    id: "laguna-san-nicolas",
    name: "Laguna San Nicolás",
    imageUrl: "./images/places/laguna-san-nicolas.jpg",
    location: "Cajamarca, Perú",
    description: [
      "Laguna altoandina ubicada en el distrito de Namora, provincia de Cajamarca, a unos 30 km de la ciudad, rodeada de un paisaje de pajonales y cerros que forma parte de las cabeceras de cuenca que abastecen de agua a comunidades cajamarquinas.",
      "Es un destino de turismo rural en ascenso, apreciado por su tranquilidad, la observación de aves altoandinas y su valor como fuente hídrica para la agricultura y ganadería de la región.",
    ],
  },
  {
    id: "lineas-de-nazca",
    name: "Líneas de Nazca",
    imageUrl: "./images/places/lineas-de-nazca.jpg",
    location: "Ica, Perú",
    description: [
      "Gigantescos geoglifos trazados en el desierto por la cultura Nazca hace unos 1500 a 2000 años, que representan figuras de animales, plantas y formas geométricas visibles en su totalidad solo desde el aire.",
      "Su propósito exacto sigue siendo motivo de estudio: se les atribuyen funciones astronómicas, rituales y de culto al agua. Fueron declaradas Patrimonio de la Humanidad por la UNESCO en 1994.",
    ],
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    imageUrl: "./images/places/machu-picchu.jpg",
    location: "Cusco, Perú",
    description: [
      "Ciudadela inca del siglo XV construida en la cima de una montaña a 2430 metros de altitud, considerada la obra maestra de la arquitectura e ingeniería incaica y una de las Nuevas Siete Maravillas del Mundo.",
      "Permaneció desconocida para el mundo occidental hasta que el explorador Hiram Bingham la dio a conocer en 1911. Sus templos, terrazas agrícolas y observatorios astronómicos siguen revelando secretos sobre la civilización inca.",
    ],
  },
  {
    id: "monasterio-santa-catalina",
    name: "Monasterio de Santa Catalina",
    imageUrl: "./images/places/monasterio-santa-catalina.jpg",
    location: "Arequipa, Perú",
    description: [
      "Ciudadela religiosa fundada en 1579, construida en sillar volcánico y pintada con los característicos tonos añil, ocre y rojo español. Funcionó como convento de clausura para monjas dominicas durante más de 400 años.",
      "Sus calles empedradas, plazas y patios recrean una pequeña ciudad colonial española dentro de Arequipa. Abrió sus puertas al público recién en 1970 y hoy es uno de los monumentos religiosos más visitados del Perú.",
    ],
  },
  {
    id: "montana-7-colores",
    name: "Montaña de 7 Colores",
    imageUrl: "./images/places/montana-7-colores.jpg",
    location: "Cusco, Perú",
    description: [
      "Montaña natural ubicada a más de 5000 metros de altitud, cuyas franjas de colores se deben a la composición mineral de distintos sedimentos geológicos acumulados durante millones de años.",
      "Permaneció cubierta de nieve y fue poco conocida hasta que el retroceso glaciar dejó sus colores al descubierto hace poco más de una década, convirtiéndola rápidamente en uno de los treks más buscados del Cusco.",
    ],
  },
  {
    id: "parque-nacional-huascaran",
    name: "Parque Nacional Huascarán",
    imageUrl: "./images/places/parque-nacional-huascaran.jpg",
    location: "Áncash, Perú",
    description: [
      "Área protegida que resguarda la Cordillera Blanca, la cadena montañosa tropical más alta del mundo, coronada por el nevado Huascarán, el pico más elevado del Perú con 6768 metros de altitud.",
      "Alberga más de 600 glaciares, lagunas de origen glaciar de colores turquesa y una notable biodiversidad altoandina, incluida la puya Raimondi. Fue declarado Patrimonio Natural de la Humanidad por la UNESCO en 1985.",
    ],
  },
  {
    id: "plaza-mayor-de-lima",
    name: "Plaza Mayor de Lima",
    imageUrl: "./images/places/plaza-mayor-de-lima.jpg",
    location: "Lima, Perú",
    description: [
      "Núcleo fundacional de la ciudad de Lima, trazado en 1535 por Francisco Pizarro. Está rodeada por el Palacio de Gobierno, la Catedral de Lima, el Palacio Arzobispal y el Palacio Municipal.",
      "Ha sido escenario de los principales acontecimientos históricos del país, desde la época virreinal hasta la proclamación de la independencia. Forma parte del centro histórico de Lima, declarado Patrimonio de la Humanidad en 1988.",
    ],
  },
  {
    id: "sacsayhuaman",
    name: "Sacsayhuamán",
    imageUrl: "./images/places/sacsayhuaman.jpg",
    location: "Cusco, Perú",
    description: [
      "Complejo arqueológico inca ubicado en las alturas de la ciudad del Cusco, célebre por sus murallas de piedra caliza de hasta 200 toneladas, ensambladas con tal precisión que no requieren argamasa.",
      "Se cree que cumplió funciones ceremoniales, militares y astronómicas dentro del sistema inca. Cada mes de junio es el escenario principal de la recreación del Inti Raymi, la fiesta del sol.",
    ],
  },
  {
    id: "santa-apolonia",
    name: "Cerro Santa Apolonia",
    imageUrl: "./images/places/santa-apolonia.jpg",
    location: "Cajamarca, Perú",
    description: [
      "Mirador natural que domina la ciudad de Cajamarca, con una gran cruz en su cima y una Silla del Inca tallada en roca, donde la tradición local dice que los gobernantes incas pasaban revista a sus ejércitos.",
      "Se accede por una escalinata con las estaciones del Vía Crucis, y desde su cima se aprecia una vista panorámica completa del valle de Cajamarca y de la ciudad colonial que lo rodea.",
    ],
  },
  {
    id: "ventanilla-de-otuzco",
    name: "Ventanillas de Otuzco",
    imageUrl: "./images/places/ventanilla-de-otuzco.jpg",
    location: "Cajamarca, Perú",
    description: [
      "Necrópolis preincaica tallada directamente en un cerro de toba volcánica, formada por cientos de nichos funerarios excavados en la roca que datan de aproximadamente 1000 años de antigüedad.",
      "Perteneció a culturas preincaicas de la región Cajamarca y sirvió como cementerio colectivo. Su nombre proviene del parecido de los nichos alineados en la ladera con pequeñas ventanas asomadas al valle.",
    ],
  },
];
