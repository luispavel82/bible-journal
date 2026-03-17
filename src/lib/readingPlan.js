// Plan de lectura bíblica para "La Biblia en un Año"
// Basado en el libro de Fray Sergio Serrano y Dempsey Rosales

const otBooks = [
  { name: 'Génesis', chapters: 50 },
  { name: 'Éxodo', chapters: 40 },
  { name: 'Levítico', chapters: 27 },
  { name: 'Números', chapters: 36 },
  { name: 'Deuteronomio', chapters: 34 },
  { name: 'Josué', chapters: 24 },
  { name: 'Jueces', chapters: 21 },
  { name: 'Rut', chapters: 4 },
  { name: '1 Samuel', chapters: 31 },
  { name: '2 Samuel', chapters: 24 },
  { name: '1 Reyes', chapters: 22 },
  { name: '2 Reyes', chapters: 25 },
  { name: '1 Crónicas', chapters: 29 },
  { name: '2 Crónicas', chapters: 36 },
  { name: 'Esdras', chapters: 10 },
  { name: 'Nehemías', chapters: 13 },
  { name: 'Ester', chapters: 10 },
  { name: 'Job', chapters: 42 },
  { name: 'Isaías', chapters: 66 },
  { name: 'Jeremías', chapters: 52 },
  { name: 'Lamentaciones', chapters: 5 },
  { name: 'Ezequiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 },
  { name: 'Oseas', chapters: 14 },
  { name: 'Joel', chapters: 3 },
  { name: 'Amós', chapters: 9 },
  { name: 'Abdías', chapters: 1 },
  { name: 'Jonás', chapters: 4 },
  { name: 'Miqueas', chapters: 7 },
  { name: 'Nahúm', chapters: 3 },
  { name: 'Habacuc', chapters: 3 },
  { name: 'Sofonías', chapters: 3 },
  { name: 'Hageo', chapters: 2 },
  { name: 'Zacarías', chapters: 14 },
  { name: 'Malaquías', chapters: 4 },
]

const ntBooks = [
  { name: 'Mateo', chapters: 28 },
  { name: 'Marcos', chapters: 16 },
  { name: 'Lucas', chapters: 24 },
  { name: 'Juan', chapters: 21 },
  { name: 'Hechos', chapters: 28 },
  { name: 'Romanos', chapters: 16 },
  { name: '1 Corintios', chapters: 16 },
  { name: '2 Corintios', chapters: 13 },
  { name: 'Gálatas', chapters: 6 },
  { name: 'Efesios', chapters: 6 },
  { name: 'Filipenses', chapters: 4 },
  { name: 'Colosenses', chapters: 4 },
  { name: '1 Tesalonicenses', chapters: 5 },
  { name: '2 Tesalonicenses', chapters: 3 },
  { name: '1 Timoteo', chapters: 6 },
  { name: '2 Timoteo', chapters: 4 },
  { name: 'Tito', chapters: 3 },
  { name: 'Filemón', chapters: 1 },
  { name: 'Hebreos', chapters: 13 },
  { name: 'Santiago', chapters: 5 },
  { name: '1 Pedro', chapters: 5 },
  { name: '2 Pedro', chapters: 3 },
  { name: '1 Juan', chapters: 5 },
  { name: '2 Juan', chapters: 1 },
  { name: '3 Juan', chapters: 1 },
  { name: 'Judas', chapters: 1 },
  { name: 'Apocalipsis', chapters: 22 },
]

// Títulos temáticos para cada día
const titles = [
  "El Principio de Todo", "La Creación del Ser Humano", "La Caída y la Promesa", "Caín y Abel: Las Dos Naturalezas",
  "El Diluvio y la Misericordia", "El Arco Iris del Pacto", "La Torre de Babel", "El Llamado de Abram",
  "La Fe de Abram", "Dios y Abraham", "La Promesa del Hijo", "Sodoma y la Justicia Divina",
  "El Sacrificio de Isaac", "La Providencia de Dios", "Rebeca: Una Esposa para Isaac", "Jacob y Esaú",
  "La Escalera al Cielo", "El Engaño y las Consecuencias", "La Lucha con el Ángel", "La Reconciliación",
  "José el Soñador", "José en Egipto", "La Fidelidad en la Prueba", "De la Prisión al Palacio",
  "El Perdón de José", "Jacob en Egipto", "Las Últimas Palabras de Jacob", "La Muerte de José",
  "La Opresión en Egipto", "El Nacimiento de Moisés", "La Zarza Ardiente", "El Nombre de Dios",
  "Las Plagas de Egipto", "La Pascua del Señor", "El Éxodo de Egipto", "Cruzando el Mar Rojo",
  "El Cántico de Moisés", "El Maná del Cielo", "El Agua de la Roca", "Los Diez Mandamientos",
  "El Pacto en el Sinaí", "El Becerro de Oro", "La Intercesión de Moisés", "El Tabernáculo de Dios",
  "La Gloria del Señor", "Las Ofrendas al Señor", "El Sacerdocio Santo", "La Santidad de Dios",
  "Las Leyes de Pureza", "El Día de la Expiación", "La Santidad en la Vida Diaria", "Las Fiestas del Señor",
  "Bendición y Maldición", "El Censo del Pueblo", "Las Obligaciones del Sacerdocio", "La Nube y el Fuego",
  "Las Trompetas de Plata", "Las Quejas del Pueblo", "Los Doce Espías", "La Incredulidad del Pueblo",
  "Los Cuarenta Años en el Desierto", "La Vara de Aarón", "La Serpiente de Bronce", "Balaam y el Asno",
  "La Profecía de Balaam", "Las Ciudades de Refugio", "El Nuevo Comienzo", "El Shemá: Ama a Dios",
  "Las Advertencias de Moisés", "La Tierra Prometida", "El Legado de Moisés", "La Muerte de Moisés",
  "Josué el Sucesor", "Cruzando el Jordán", "La Caída de Jericó", "La Derrota en Hai",
  "La Renovación del Pacto", "La Conquista Continúa", "Las Ciudades Levíticas", "El Último Discurso de Josué",
  "La Muerte de Josué", "Los Jueces de Israel", "Débora la Profetisa", "Gedeón el Valiente",
  "La Trampa de los Ídolos", "Jefté y su Voto", "Sansón el Nazirita", "La Fuerza y la Debilidad",
  "Rut y Noemí: La Fidelidad", "Booz el Redentor", "El Linaje del Mesías", "Ana y su Oración",
  "El Llamado de Samuel", "El Arca del Pacto", "Samuel el Juez", "El Primer Rey de Israel",
  "Saúl ungido Rey", "La Desobediencia de Saúl", "David el Ungido", "David y Goliat",
  "La Amistad de David y Jonatán", "Saúl persigue a David", "David perdona a Saúl", "La Muerte de Saúl",
  "David Rey de Judá", "El Arca Llevada a Jerusalén", "El Pacto con David", "David y Betsabé",
  "El Profeta Natán", "La Rebelión de Absalón", "El Regreso de David", "Los Últimos Días de David",
  "Salomón el Sabio", "La Sabiduría de Salomón", "La Construcción del Templo", "La Dedicación del Templo",
  "La Gloria del Señor llena el Templo", "La Reina de Sabá", "La Apostasía de Salomón", "El Reino Dividido",
  "Elías el Profeta", "El Dios Verdadero en el Carmelo", "La Pequeña Voz Apacible", "Elías y Eliseo",
  "El Ministerio de Eliseo", "Naamán el Leproso", "El Fuego del Cielo", "La Caída de Israel",
  "La Caída de Judá", "La Reforma de Josías", "El Exilio en Babilonia", "El Cronista Fiel",
  "El Templo de Salomón en Detalle", "La Oración de Salomón", "Los Reyes de Judá", "La Fidelidad Premiada",
  "El Regreso del Exilio", "La Reconstrucción del Templo", "La Oposición a la Obra", "El Templo Terminado",
  "Esdras el Escriba", "La Reforma Espiritual", "Nehemías el Copero", "Los Muros Reconstruidos",
  "La Lectura de la Ley", "El Pacto Renovado", "La Purificación del Pueblo", "Ester la Valiente",
  "El Complot de Amán", "Ester ante el Rey", "La Liberación del Pueblo", "Job el Íntegro",
  "Los Amigos de Job", "Dios habla en el Torbellino", "La Restauración de Job", "El Mesías Prometido",
  "El Siervo Sufriente", "El Consuelo de Dios", "El Nuevo Éxodo", "La Gloria de Sión",
  "Jeremías el Profeta Lloroso", "El Rollo del Juicio", "Las Lamentaciones de Jeremías", "La Esperanza en la Aflicción",
  "Ezequiel el Visionario", "La Visión de los Huesos Secos", "El Nuevo Corazón", "El Nuevo Templo",
  "Daniel en Babilonia", "Los Tres Jóvenes en el Horno", "La Escritura en la Pared", "Daniel en el Foso",
  "Las Visiones de Daniel", "El Amor Fiel de Dios", "El Día del Señor", "La Justicia de Dios",
  "El Profeta Desobediente", "La Misericordia Universal", "La Promesa del Mesías", "El Fin de los Tiempos",
  "El Nacimiento de Jesús", "Los Sabios de Oriente", "El Bautismo de Jesús", "Las Tentaciones de Jesús",
  "El Sermón del Monte", "Las Bienaventuranzas", "La Sal y la Luz del Mundo", "El Padre Nuestro",
  "No os Afanéis", "La Regla de Oro", "Los Milagros de Jesús", "La Autoridad de Cristo",
  "El Llamado de los Discípulos", "La Parábola del Sembrador", "El Trigo y la Cizaña", "La Perla de Gran Precio",
  "Jesús Camina sobre el Agua", "La Confesión de Pedro", "La Transfiguración", "El Hijo Pródigo",
  "El Buen Samaritano", "Marta y María", "Lázaro Resucitado", "La Entrada Triunfal",
  "La Purificación del Templo", "El Discurso del Monte de los Olivos", "La Última Cena", "La Oración en Getsemaní",
  "El Juicio de Jesús", "La Crucifixión", "La Muerte del Salvador", "La Resurrección",
  "Las Apariciones del Resucitado", "La Gran Comisión", "La Ascensión de Jesús", "El Evangelio de Marcos",
  "El Ministerio en Galilea", "Las Parábolas del Reino", "La Multiplicación de los Panes", "La Curación del Ciego",
  "Jesús Siervo Sufriente", "El Evangelio de Lucas", "El Magnificat de María", "El Nacimiento en Belén",
  "Jesús a los Doce Años", "El Ministerio de Juan el Bautista", "El Llamado a los Primeros Discípulos", "La Misión de los Setenta",
  "Zaqueo el Publicano", "Las Parábolas de la Misericordia", "El Evangelio de Juan", "La Palabra Hecha Carne",
  "Las Bodas de Caná", "La Conversación con Nicodemo", "La Mujer Samaritana", "Yo Soy el Pan de Vida",
  "Yo Soy la Luz del Mundo", "Yo Soy el Buen Pastor", "Yo Soy la Resurrección", "Yo Soy la Vid Verdadera",
  "El Espíritu Santo Prometido", "La Oración Sacerdotal", "El Discípulo Amado", "Pentecostés",
  "La Iglesia Primitiva", "Pedro y Juan en el Templo", "La Persecución de la Iglesia", "Esteban el Mártir",
  "Felipe y el Etíope", "La Conversión de Pablo", "Pedro y Cornelio", "La Iglesia de Antioquía",
  "El Primer Viaje Misionero", "El Concilio de Jerusalén", "El Segundo Viaje Misionero", "Pablo en Atenas",
  "Pablo en Corinto", "El Tercer Viaje Misionero", "El Discurso de Éfeso", "Pablo Arrestado",
  "Pablo ante los Gobernadores", "El Naufragio de Pablo", "Pablo en Roma", "La Justicia de Dios",
  "La Fe que Justifica", "La Gracia Abundante", "Muertos al Pecado, Vivos en Cristo", "La Ley y el Espíritu",
  "Nada nos Separa del Amor", "El Misterio de Israel", "La Vida Cristiana", "El Amor como Cumplimiento",
  "La Sabiduría de la Cruz", "Los Dones del Espíritu", "El Himno al Amor", "La Resurrección del Cuerpo",
  "La Colecta para los Santos", "El Ministerio de la Reconciliación", "La Armadura de Dios", "La Paz que Sobrepasa",
  "La Libertad en Cristo", "Sentados en los Lugares Celestiales", "La Mente de Cristo", "Cristo Todo en Todos",
  "La Esperanza de la Venida", "El Hombre de Iniquidad", "Las Instrucciones Pastorales", "La Buena Batalla",
  "La Gracia que Enseña", "El Mejor Sacerdocio", "La Fe, Certeza de lo que se Espera", "Los Héroes de la Fe",
  "La Disciplina como Amor", "La Fe sin Obras está Muerta", "La Lengua Indomable", "Sé Manso como Cordero",
  "El Sufrimiento Redentor", "El Rebano de Dios", "Dios es Amor", "La Oración Eficaz",
  "Las Siete Iglesias", "El Trono Celestial", "Los Sellos del Apocalipsis", "Las Trompetas del Juicio",
  "La Mujer y el Dragón", "La Bestia del Mar", "Los 144,000 con el Cordero", "La Gran Babilonia",
  "Las Siete Copas", "La Caída de Babilonia", "El Milenio", "El Juicio Final",
  "La Nueva Jerusalén", "El Río de la Vida", "Ven, Señor Jesús", "Fiel hasta el Fin",
  "El Amor que Persevera", "La Esperanza del Regreso", "Un Año de Gracia", "La Palabra Vive en Mí",
  "Caminando con Dios", "La Promesa Cumplida", "El Año de la Gracia del Señor", "Gracias por Tu Palabra"
]

// Genera referencia de capítulo: "Libro X:1" o "Libro X-Y"
function buildRef(books, startChIdx, count) {
  let remaining = count
  let idx = startChIdx
  let refs = []
  let tempBooks = [...books]
  let totalChapters = tempBooks.reduce((sum, b) => sum + b.chapters, 0)

  // Normalize index
  idx = idx % totalChapters

  let cumulative = 0
  let bookIdx = 0
  for (let i = 0; i < tempBooks.length; i++) {
    if (cumulative + tempBooks[i].chapters > idx) {
      bookIdx = i
      break
    }
    cumulative += tempBooks[i].chapters
  }

  let chapterInBook = idx - cumulative + 1
  let book = tempBooks[bookIdx]
  let startCh = chapterInBook
  let endCh = Math.min(chapterInBook + count - 1, book.chapters)

  if (startCh === endCh) {
    refs.push(`${book.name} ${startCh}`)
  } else {
    refs.push(`${book.name} ${startCh}-${endCh}`)
  }

  return refs.join(', ')
}

// Genera el plan completo
function generatePlan() {
  const plan = []

  // OT: ~3 capítulos por día
  const otTotal = otBooks.reduce((s, b) => s + b.chapters, 0) // 929
  // NT: ~1 capítulo por día (cicla si es necesario)
  const ntTotal = ntBooks.reduce((s, b) => s + b.chapters, 0) // 260
  // Psalms: ~1 salmo cada 2-3 días (150 salmos)
  // Proverbs: ~1 capítulo cada 12 días (31 capítulos)

  let otChIdx = 0
  let ntChIdx = 0
  let psalmIdx = 0
  let provIdx = 0

  // Expand books to flat chapter list
  const otFlat = []
  for (const b of otBooks) {
    for (let c = 1; c <= b.chapters; c++) {
      otFlat.push({ book: b.name, chapter: c })
    }
  }
  const ntFlat = []
  for (const b of ntBooks) {
    for (let c = 1; c <= b.chapters; c++) {
      ntFlat.push({ book: b.name, chapter: c })
    }
  }

  for (let day = 1; day <= 365; day++) {
    // OT: ~2-3 chapters per day to cover 929 in 365 days ≈ 2.5/day
    const otCount = day % 2 === 0 ? 3 : 2
    const otChapters = []
    for (let i = 0; i < otCount && otChIdx < otFlat.length; i++) {
      otChapters.push(otFlat[otChIdx++])
    }

    // Build OT ref string
    let otRef = ''
    if (otChapters.length > 0) {
      const first = otChapters[0]
      const last = otChapters[otChapters.length - 1]
      if (first.book === last.book) {
        otRef = first.chapter === last.chapter
          ? `${first.book} ${first.chapter}`
          : `${first.book} ${first.chapter}-${last.chapter}`
      } else {
        otRef = `${first.book} ${first.chapter} - ${last.book} ${last.chapter}`
      }
    }

    // NT: 1 chapter per day (cycles after 260 days)
    const ntCh = ntFlat[ntChIdx % ntFlat.length]
    const ntRef = `${ntCh.book} ${ntCh.chapter}`
    ntChIdx++

    // Psalm: every day (cycles through 150)
    const psalmNum = (psalmIdx % 150) + 1
    const psalmRef = `Salmo ${psalmNum}`
    psalmIdx++

    // Proverb: cycles through 31 chapters
    const provNum = (provIdx % 31) + 1
    const provRef = `Proverbios ${provNum}`
    provIdx++

    plan.push({
      day,
      title: titles[day - 1] || `Día ${day}`,
      oldTestament: {
        ref: otRef || 'Final del AT',
        text: otRef || 'Final del AT',
      },
      newTestament: {
        ref: ntRef,
        text: ntRef,
      },
      psalm: {
        ref: psalmRef,
        text: psalmRef,
      },
      proverb: {
        ref: provRef,
        text: provRef,
      },
    })
  }

  return plan
}

export const readingPlan = generatePlan()
