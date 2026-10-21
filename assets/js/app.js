const charts = {};

    const COLORS = [
      '#432682', '#0ea5e9', '#cc3366', '#573e9e', '#ffbc7d',
      '#059669', '#d97706', '#2563eb', '#9333ea', '#0d9488'
    ];

    // Lista de columnas que corresponden a preguntas condicionadas (dependen de una pregunta previa)
    // Nota: La pregunta 2 (Col 'N') es padre/directa, por lo que no lleva 'Derivada:'
        // Reglas de preguntas condicionadas (derivadas de una pregunta o subconjunto previo)
    const CONDITIONAL_RULES = {
      'O': { filter: r => r.N === 'Sí' || r.N === 'Sí me derivaron a Lima', badge: 'Total Derivadas' },
      'P': { filter: r => r.N === 'Sí' || r.N === 'Sí me derivaron a Lima', badge: 'Total Derivadas' },
      'Z': { filter: r => r.Z !== 'No corresponde', badge: 'Total Derivadas' },
      'AB': { filter: r => r.AB !== 'No corresponde', badge: 'Total Derivadas' },
      'AC': { filter: r => r.AC !== 'No respondió' && r.AC !== 'No corresponde', badge: 'Total Derivadas' },
      'AE': { filter: r => r.AE !== 'No corresponde' && r.AE !== 'No respondió', badge: 'Total Derivadas' },
      'AF': { filter: r => r.AF !== 'No corresponde', badge: 'Total Derivadas' },
      'AK': { filter: r => r.AK !== 'No corresponde', badge: 'Total Derivadas' },
      'AM': { filter: r => r.AM !== 'No corresponde', badge: 'Total Derivadas' }
    };

    const CONDITIONAL_QUESTION_COLS = new Set(['O', 'P', 'V', 'W', 'X', 'Y', 'Z', 'AB', 'AC', 'AE', 'AF', 'AG', 'AI', 'AK', 'AM']);

    // Catálogo de orden canónico oficial por columna (para no ordenar por cantidad de datos)
    const QUESTION_CANONICAL_ORDER = {
      // Perfil
      'I': ['Sí', 'No'],
      'J': ['Minsa', 'EsSalud', 'FFAA', 'Seguro Privado', 'Particular'],
      'K': ['Menos de 30 años', '30–39 años', '40–49 años', '50–59 años', '60–69 años', '70 años a más', 'No recuerdo'],
      'L': ['Sí', 'No'],

      // Pregunta 2: Derivada a Lima
      'N': ['Sí', 'No', 'No corresponde (Reside en Lima)', 'No corresponde'],

      // Pregunta 3: Etapa de derivación a Lima
      'O': [
        'Confirmación del diagnóstico / biopsia',
        'Estudios para determinar el estadio',
        'Consulta con especialista',
        'Cirugía',
        'Quimioterapia',
        'Radioterapia',
        'Otro tratamiento'
      ],

      // Pregunta 4: Tiempo de espera atención en Lima
      'P': [
        'Hasta 7 días',
        'Hasta 15 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses'
      ],

      // Pregunta 5: Detección inicial
      'Q': [
        'Encontró un bulto o nódulo',
        'Notó un cambio en la mama, piel o pezón',
        'Tuvo secreción por el pezón',
        'Tuvo dolor u otra molestia',
        'Una mamografía detectó una alteración',
        'Una ecografía detectó una alteración',
        'Otro examen detectó una alteración',
        'Fue detectado durante un control de rutina',
        'Otro',
        'No recuerda'
      ],

      // Pregunta 6: Tiempo hasta buscar atención médica
      'R': [
        'El mismo día',
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        'No recuerda'
      ],

      // Pregunta 7: Tiempo hasta la primera consulta médica
      'S': [
        'El mismo día',
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        'No recuerda'
      ],

      // Pregunta 8: Tipo de establecimiento
      'T': ['Público', 'Privado', 'No recuerdo'],

      // Pregunta 9: Solicitud de exámenes
      'U': ['Sí', 'No', 'No recuerdo'],

      // Pregunta 10: Exámenes solicitados
      'V': [
        'Mamografía',
        'Ecografía mamaria',
        'Mamografía y ecografía',
        'Resonancia magnética',
        'Otro',
        'No recuerdo'
      ],

      // Pregunta 11: Tiempo hasta realizar examen
      'W': [
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        ],

      // Pregunta 12: Tiempo hasta resultado de examen
      'X': [
        'El mismo día',
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        ],

      // Pregunta 13: Dificultad exámenes
      'Y': ['Sí', 'No', 'No recuerdo'],

      // Pregunta 14: Principal dificultad
      'Z': [
        'No había citas disponibles',
        'La cita estaba disponible después de mucho tiempo',
        'No había equipos disponibles',
        'No había personal especializado',
        'Problemas con el seguro o autorización',
        'Tuve que pagar el examen',
        'El establecimiento estaba lejos',
        'Otra',
        ],

      // Pregunta 15: Derivaron a otro establecimiento
      'AA': ['Sí', 'No', 'No recuerdo'],

      // Pregunta 16: Tiempo atención derivación
      'AB': [
        'Hasta 7 días',
        'Hasta 15 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        ],

      // Pregunta 17: Cambio de sistema
      'AC': [
        'Público → Privado',
        'Privado → Público',
        'No',
        'No recuerdo'
      ],

      // Pregunta 18: Indicaron biopsia
      'AD': ['Sí', 'No', 'No recuerdo'],

      // Pregunta 19: Tiempo hasta biopsia
      'AE': [
        'Hasta 7 días',
        'Hasta 15 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        ],

      // Pregunta 20: Tiempo resultado biopsia
      'AF': [
        'Hasta 7 días',
        'Hasta 15 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        ],

      // Pregunta 21: Establecimiento biopsia
      'AG': ['Público', 'Privado', 'En ambos', 'No recuerdo'],

      // Pregunta 22: Informaron subtipo
      'AH': ['Sí', 'No', 'No recuerdo'],

      // Pregunta 23: Subtipo informado
      'AI': [
        'Luminal A/B u hormonal',
        'HER2 positivo',
        'Triple negativo',
        'No me lo informaron'
      ],

      // Pregunta 24: Estadio detectado
      'AJ': [
        'Estadio I',
        'Estadio II',
        'Estadio III',
        'Estadio IV',
        'No me informaron'
      ],

      // Pregunta 25: Tiempo estudios estadio
      'AK': [
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        'No recuerdo',
        ],

      // Pregunta 26: Estadio diferente al inicio
      'AL': [
        'Sí',
        'No',
        'No recuerdo',
        'Todavía no he iniciado tratamiento'
      ],

      // Pregunta 27: Estadio al inicio tratamiento
      'AM': [
        'Estadio I',
        'Estadio II',
        'Estadio III',
        'Estadio IV',
        'No me informaron',
        ],

      // Pregunta 28: Tratamiento inicial
      'AN': [
        'Cirugía',
        'Quimioterapia',
        'Radioterapia',
        'Terapia hormonal',
        'Terapia dirigida',
        'Inmunoterapia',
        'Combinación de tratamientos',
        'Otro',
        'No recuerdo'
      ],

      // Pregunta 29: Tiempo confirmación a indicación tratamiento
      'AO': [
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        'No recuerdo'
      ],

      // Pregunta 30: Tiempo indicación a inicio tratamiento
      'AP': [
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        'Todavía no lo he iniciado',
        'No recuerdo'
      ],

      // Pregunta 31: Lugar inicio tratamiento
      'AQ': [
        'Público',
        'Privado',
        'En ambos',
        'Todavía no lo he iniciado',
        'No recuerdo'
      ],

      // Pregunta 32: Etapa con mayor espera
      'AR': [
        'Primera consulta',
        'Exámenes',
        'Biopsia',
        'Resultado de la biopsia',
        'Estudios para determinar el estadio',
        'Indicación del tratamiento',
        'Inicio del tratamiento',
        'No tuve una espera importante',
        'No recuerdo'
      ],

      // Pregunta 33: Principal dificultad
      'AS': [
        'Conseguir una cita',
        'Conseguir una derivación',
        'Realizar los exámenes',
        'Acceder a la biopsia',
        'Esperar los resultados',
        'Obtener autorizaciones',
        'Acceder al tratamiento o medicamentos',
        'Costo',
        'Distancia o traslado',
        'No tuve dificultades',
        'Otra'
      ],

      // Pregunta 34: Acudió a sector privado por rapidez
      'AT': ['Sí', 'No', 'No recuerdo'],

      // Pregunta 35: Retraso en tratamiento por demoras
      'AU': ['Sí', 'No', 'No estoy segura', 'Todavía no inicio tratamiento'],

      // Pregunta 36: Tiempo total recorrido
      'AV': [
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        'Todavía no lo he iniciado',
        'No recuerdo'
      ],

      // Pregunta 37: Información clara siguiente paso
      'AW': ['Siempre', 'Casi siempre', 'Algunas veces', 'Pocas veces', 'Nunca', 'No recuerdo'],

      // Pregunta 38: Tratamiento innovador no cubierto
      'AX': ['Siempre', 'Casi siempre', 'Algunas veces', 'Nunca']
    };

    /**
     * Normaliza respuestas de data histórica para que no se dupliquen o mezclen
     */
    function normalizeAnswer(col, rawAns) {
      if (!rawAns || rawAns === 'Sin respuesta' || rawAns === 'No respondió' || String(rawAns).trim() === '') {
        if (col === 'R' || col === 'Q' || col === 'AT') return 'No recuerdo';
        if (col === 'AJ') return 'No me informaron';
        if (col === 'AS') return 'Otra';
        return 'No respondió';
      }

      let ans = String(rawAns).trim();

      // Limpieza de caracteres mal codificados UTF-8
      ans = ans.replace(/SÃ­/g, 'Sí')
               .replace(/â€“/g, '–')
               .replace(/â†’/g, '→')
               .replace(/Â¿/g, '¿')
               .replace(/Ã¡/g, 'á')
               .replace(/Ã©/g, 'é')
               .replace(/Ã­/g, 'í')
               .replace(/Ã³/g, 'ó')
               .replace(/Ãº/g, 'ú')
               .replace(/Ã±/g, 'ñ');

      // Normalizaciones por columna
      
      // Unificación Opción A: tiempos prolongados agrupados en 'Más de 6 meses'
      if (ans === 'Más de 9 meses' || ans === 'Más de 1 año') {
        return 'Más de 6 meses';
      }

      switch (col) {
        case 'N': // Derivada a Lima
          if (ans === 'Sí me derivaron a Lima') return 'Sí';
          if (ans === 'No me derivaron a Lima') return 'No';
          if (ans === 'No corresponde (reside en Lima)') return 'No corresponde (Reside en Lima)';
          break;

        case 'P': // Q4 Tiempo espera Lima
          if (ans === 'Menos de 7 días' || ans === 'Menos de 1 semana') return 'Hasta 7 días';
          if (ans === 'Hasta 15 días' || ans === '1–2 semanas') return 'Hasta 15 días';
          if (ans === 'Hasta 30 días' || ans === '3–4 semanas' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 90 días' || ans === '2-3 meses' || ans === '2–3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '4 a 6 meses' || ans === '4–6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'Q': // Q5 Detección inicial (respuestas cruzadas de exámenes)
          if (ans === 'Mamografía y ecografía' || ans === 'Mamografía' || ans === 'Ecografía mamaria' || ans === 'Resonancia magnética') {
            return 'Una mamografía detectó una alteración';
          }
          break;

        case 'R': // Q6 Tiempo búsqueda atención
          if (ans === 'Menos de 1 semana' || ans === '1–7 días' || ans === 'Hasta 15 días' || ans === 'Hasta 7 días') return 'Hasta 7 días';
          if (ans === 'Hasta 30 días' || ans === '8–30 días' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 90 días' || ans === '1–3 meses' || ans === '1-3 meses' || ans === '2-3 meses' || ans === '2–3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '3-6 meses' || ans === '4 a 6 meses' || ans === '4–6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'S': // Q7 Tiempo primera consulta
          if (ans === 'Menos de 7 días' || ans === '1–7 días' || ans === 'Hasta 7 días' || ans === 'Hasta 15 días') return 'Hasta 7 días';
          if (ans === '8–30 días' || ans === 'Hasta 30 días' || ans === 'Hasta 60 días' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 90 días' || ans === '1–3 meses' || ans === '2–3 meses' || ans === '2-3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '4–6 meses' || ans === '4 a 6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'V': // Q10 Exámenes
          if (ans === 'Notó un cambio en la mama, piel o pezón') return 'Otro';
          break;

        case 'W': // Q11 Tiempo realizar examen
          if (ans === 'Menos de 1 semana' || ans === 'Hasta 7 días' || ans === '1–7 días') return 'Hasta 7 días';
          if (ans === 'Hasta 15 días' || ans === 'Hasta 30 días' || ans === 'Hasta 60 días' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 90 días' || ans === '1–3 meses' || ans === '2–3 meses' || ans === '2-3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '4–6 meses' || ans === '4 a 6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'X': // Q12 Tiempo resultado examen
          if (ans === 'Hasta 7 días' || ans === '1–7 días' || ans === 'Menos de 1 semana') return 'Hasta 7 días';
          if (ans === 'Hasta 15 días' || ans === 'Hasta 30 días' || ans === 'Hasta 60 días' || ans === '8–30 días' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 90 días' || ans === '1–3 meses' || ans === '2–3 meses' || ans === '2-3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '4–6 meses' || ans === '4 a 6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'AB': // Q16 Tiempo tras derivación
          if (ans === 'Menos de 1 semana' || ans === '1–7 días' || ans === 'Hasta 7 días') return 'Hasta 7 días';
          if (ans === 'Hasta 15 días' || ans === '1–2 semanas') return 'Hasta 15 días';
          if (ans === 'Hasta 30 días' || ans === '3–4 semanas' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 90 días' || ans === '1–3 meses' || ans === '2–3 meses' || ans === '2-3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '4–6 meses' || ans === '4 a 6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'AE': // Q19 Tiempo biopsia
          if (ans === 'Sí') return 'No respondió';
          if (ans === 'Menos de 1 semana' || ans === '1–7 días' || ans === 'Hasta 7 días') return 'Hasta 7 días';
          if (ans === 'Hasta 15 días' || ans === '1–2 semanas') return 'Hasta 15 días';
          if (ans === 'Hasta 30 días' || ans === 'Hasta 60 días' || ans === '3–4 semanas' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 90 días' || ans === '1–3 meses' || ans === '2–3 meses' || ans === '2-3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '4–6 meses' || ans === '4 a 6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'AF': // Q20 Tiempo resultado biopsia
          if (ans === 'Menos de 7 días' || ans === 'Menos de 1 semana' || ans === '1–7 días' || ans === 'Hasta 7 días') return 'Hasta 7 días';
          if (ans === 'Hasta 15 días' || ans === '1–2 semanas') return 'Hasta 15 días';
          if (ans === 'Hasta 30 días' || ans === 'Hasta 60 días' || ans === '3–4 semanas' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 90 días' || ans === '1–3 meses' || ans === '2–3 meses' || ans === '2-3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '4–6 meses' || ans === '4 a 6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'AG': // Q21 Establecimiento biopsia
          if (ans === 'Más de 1 año') return 'No recuerdo';
          break;

        case 'AI': // Q23 Subtipo informado
          if (ans === 'No me informaron') return 'No me lo informaron';
          break;

        case 'AK': // Q25 Tiempo estudios estadio
          if (ans === 'Estadio I' || ans === 'Estadio II') return 'No recuerdo';
          if (ans === 'No me informaron') return 'No recuerdo';
          if (ans === 'Menos de 1 semana' || ans === '1–7 días' || ans === 'Hasta 7 días') return 'Hasta 7 días';
          if (ans === 'Hasta 15 días' || ans === 'Hasta 30 días' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 90 días' || ans === '1–3 meses' || ans === '2–3 meses' || ans === '2-3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '4–6 meses' || ans === '4 a 6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'AO': // Q29 Tiempo confirmación a indicación
          if (ans === 'Menos de 1 semana' || ans === '1–7 días' || ans === 'Hasta 7 días') return 'Hasta 7 días';
          if (ans === 'Hasta 15 días' || ans === 'Hasta 30 días' || ans === 'Más de 30 días' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 60 días' || ans === 'Más de 60 días' || ans === 'Hasta 90 días' || ans === '1–3 meses' || ans === '2–3 meses' || ans === '2-3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '4–6 meses' || ans === '4 a 6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'AP': // Q30 Tiempo indicación a inicio
          if (ans === 'Menos de 1 semana' || ans === '1–7 días' || ans === 'Hasta 7 días') return 'Hasta 7 días';
          if (ans === 'Hasta 15 días' || ans === 'Hasta 30 días' || ans === 'Más de 30 días' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Más de 60 días' || ans === 'Hasta 90 días' || ans === 'Más de 90 días' || ans === '1–3 meses' || ans === '2–3 meses' || ans === '2-3 meses' || ans === 'Hasta 3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '4–6 meses' || ans === '4 a 6 meses') return 'Hasta 6 meses';
          if (ans === 'Más de 6 meses') return 'Más de 6 meses';
          break;

        case 'AR': // Q32 Etapa con mayor espera
          if (ans === 'Entre la sospecha y la confirmación del diagnóstico') return 'Exámenes';
          if (ans === 'Realización de la Biopsia') return 'Biopsia';
          break;

        case 'AL': // Q26 Estadio diferente al inicio
          if (ans === 'No me informaron') return 'No recuerdo';
          if (ans === 'Todavía no inicio tratamiento') return 'Todavía no he iniciado tratamiento';
          break;

        case 'AV': // Q36 Tiempo total recorrido
          if (ans === 'Menos de 1 semana' || ans === '1–7 días' || ans === 'Hasta 7 días') return 'Hasta 7 días';
          if (ans === 'Menos de 1 mes' || ans === 'Hasta 30 días' || ans === '1–4 semanas') return 'Hasta 30 días';
          if (ans === 'Hasta 3 meses' || ans === '1–3 meses' || ans === '1-3 meses' || ans === '2-3 meses' || ans === '2–3 meses') return 'Hasta 3 meses';
          if (ans === 'Hasta 6 meses' || ans === '3–6 meses' || ans === '3-6 meses' || ans === '4 a 6 meses' || ans === '4–6 meses') return 'Hasta 6 meses';
          if (ans === 'Hasta 9 meses' || ans === 'Hasta 1 año' || ans === '6–12 meses' || ans === 'Más de 6 meses') return 'Más de 6 meses';
          if (ans === 'Todavía no inicio tratamiento') return 'Todavía no lo he iniciado';
          break;

        case 'AW': // Q37 Información clara
          if (ans === 'Si') return 'Siempre';
          if (ans === 'No') return 'Nunca';
          break;

        case 'AX': // Q38 Tratamiento innovador
          if (ans === 'Sí') return 'Siempre';
          break;
      }

      return ans;
    }

    function getFilteredRecords() {
      const sSector = document.getElementById('f-sector') ? document.getElementById('f-sector').value : 'ALL';
      const sSystem = document.getElementById('f-system') ? document.getElementById('f-system').value : 'ALL';
      const sRegion = document.getElementById('f-region') ? document.getElementById('f-region').value : 'ALL';

      return DATA.records.filter(r => {
        // Sector: Privado (Seguro Privado, Particular) vs Público (Minsa, EsSalud, FFAA, etc.)
        if (sSector === 'PRIVATE') {
          if (r.J !== 'Seguro Privado' && r.J !== 'Particular') return false;
        } else if (sSector === 'PUBLIC') {
          if (r.J === 'Seguro Privado' || r.J === 'Particular') return false;
        }

        if (sSystem !== 'ALL' && r.J !== sSystem) return false;
        if (sRegion === 'LIMA' && r.H !== 'Lima') return false;
        if (sRegion === 'PROV' && r.H === 'Lima') return false;
        return true;
      });
    }

    function updateActiveFilterChips(records) {
      const sSector = document.getElementById('f-sector');
      const sSystem = document.getElementById('f-system');
      const sRegion = document.getElementById('f-region');
      const sSearch = document.getElementById('f-search');
      const sShowNA = document.getElementById('f-show-na');

      const countText = document.getElementById('f-count-text');
      const pct = DATA.totalCount ? ((records.length / DATA.totalCount) * 100).toFixed(1) : '0';
      countText.textContent = `${records.length} de ${DATA.totalCount} personas (${pct}%)`;

      const chipsContainer = document.getElementById('active-chips');
      const row = document.getElementById('active-filters-row');
      chipsContainer.innerHTML = '';

      const activeList = [];

      if (sSector && sSector.value !== 'ALL') {
        const sectorTxt = sSector.options[sSector.selectedIndex].text.split('(')[0].trim();
        activeList.push({
          label: `Sector: ${sectorTxt}`,
          clear: () => { sSector.value = 'ALL'; renderDashboard(); }
        });
      }
      if (sSystem && sSystem.value !== 'ALL') {
        activeList.push({
          label: `Sistema: ${sSystem.value}`,
          clear: () => { sSystem.value = 'ALL'; renderDashboard(); }
        });
      }
      if (sRegion && sRegion.value !== 'ALL') {
        const txt = sRegion.options[sRegion.selectedIndex].text.split('(')[0].trim();
        activeList.push({
          label: `Región: ${txt}`,
          clear: () => { sRegion.value = 'ALL'; renderDashboard(); }
        });
      }
      if (sSearch.value.trim() !== '') {
        activeList.push({
          label: `Búsqueda: "${sSearch.value.trim()}"`,
          clear: () => { sSearch.value = ''; renderDashboard(); }
        });
      }
      if (sShowNA.checked) {
        activeList.push({
          label: 'Con "No respondió" en gráficas',
          clear: () => { sShowNA.checked = false; renderDashboard(); }
        });
      }

      if (activeList.length === 0) {
        row.style.display = 'none';
      } else {
        row.style.display = 'flex';
        activeList.forEach(item => {
          const chip = document.createElement('span');
          chip.className = 'filter-chip';
          chip.textContent = item.label;

          const btn = document.createElement('span');
          btn.className = 'filter-chip-remove';
          btn.innerHTML = '&times;';
          btn.title = 'Quitar este filtro';
          btn.addEventListener('click', item.clear);

          chip.appendChild(btn);
          chipsContainer.appendChild(chip);
        });
      }
    }

    function updateKPIs(records) {
      const total = records.length;
      const bultoC = records.filter(r => r.Q === 'Encontró un bulto o nódulo').length;
      const privC = records.filter(r => r.AT === 'Sí').length;
      const retC = records.filter(r => r.AU === 'Sí').length;

      const elTotal = document.getElementById('kpi-total');
      if (elTotal) elTotal.textContent = total + ' personas';

      const elTotalSub = document.getElementById('kpi-total-sub');
      if (elTotalSub) {
        elTotalSub.textContent = total === DATA.totalCount ? '100% de la muestra total' : ((total / DATA.totalCount * 100).toFixed(1) + '% del total de ' + DATA.totalCount);
      }

      const elBulto = document.getElementById('kpi-bulto');
      if (elBulto) elBulto.textContent = total ? (bultoC / total * 100).toFixed(1) + '%' : '0%';

      const elBultoSub = document.getElementById('kpi-bulto-sub');
      if (elBultoSub) elBultoSub.textContent = `${bultoC} de ${total} encuestadas`;

      const elPrivado = document.getElementById('kpi-privado');
      if (elPrivado) elPrivado.textContent = total ? (privC / total * 100).toFixed(1) + '%' : '0%';

      const elPrivadoSub = document.getElementById('kpi-privado-sub');
      if (elPrivadoSub) elPrivadoSub.textContent = `${privC} de ${total} encuestadas`;

      const elRetraso = document.getElementById('kpi-retraso');
      if (elRetraso) elRetraso.textContent = total ? (retC / total * 100).toFixed(1) + '%' : '0%';

      const elRetrasoSub = document.getElementById('kpi-retraso-sub');
      if (elRetrasoSub) elRetrasoSub.textContent = `${retC} de ${total} encuestadas`;
    }

    function renderDashboard() {
      const records = getFilteredRecords();
      const search = document.getElementById('f-search').value.trim().toLowerCase();
      const showNAInChart = document.getElementById('f-show-na').checked;

      updateKPIs(records);
      updateActiveFilterChips(records);

      Object.values(charts).forEach(c => c.destroy());
      for (const k in charts) delete charts[k];

      const root = document.getElementById('questions-root');
      const sideNav = document.getElementById('sidebar-nav');
      root.innerHTML = '';
      sideNav.innerHTML = '';

      const blocks = [];
      DATA.questions.forEach(q => {
        if (!blocks.includes(q.block)) blocks.push(q.block);
      });

      blocks.forEach((blockName, bIdx) => {
        const blockQs = DATA.questions.filter(q => {
          if (q.col === 'L') return false; // Ocultar Perfil 5 (Consentimiento informado)
          if (q.block !== blockName) return false;
          if (!search) return true;
          return (
            q.title.toLowerCase().includes(search) ||
            q.subtitle.toLowerCase().includes(search) ||
            q.code.toLowerCase().includes(search) ||
            q.analysis.toLowerCase().includes(search)
          );
        });

        if (blockQs.length === 0) return;

        // Add block to sidebar
        const sbTitle = document.createElement('div');
        sbTitle.className = 'nav-block-title';
        sbTitle.textContent = blockName;
        sideNav.appendChild(sbTitle);

        // Add section divider in main
        const secDiv = document.createElement('div');
        secDiv.className = 'section-divider';
        secDiv.innerHTML = `<h2>${blockName}</h2><span>${blockQs.length} preguntas</span>`;
        root.appendChild(secDiv);

        blockQs.forEach(q => {
          // Sidebar link
          const link = document.createElement('a');
          link.className = 'nav-q-link';
          link.href = '#card-' + q.col;
          link.textContent = q.title;
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = 'card-' + q.col;
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              const headerOffset = window.innerWidth <= 768 ? 85 : 110;
              const targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });

              targetEl.classList.add('q-card-highlight');
              setTimeout(() => {
                targetEl.classList.remove('q-card-highlight');
              }, 1200);

              document.querySelectorAll('.nav-q-link').forEach(l => l.classList.remove('is-active'));
              link.classList.add('is-active');

              const sidebar = document.getElementById('sidebar-aside');
              if (sidebar && window.innerWidth <= 1024) {
                sidebar.classList.remove('is-open');
                const btn = document.getElementById('sidebar-toggle-btn');
                if (btn) btn.setAttribute('aria-expanded', 'false');
              }
            }
          });
          sideNav.appendChild(link);

          // Tally responses con normalización de respuestas
          const counts = {};
          let validCount = 0;
          let naCount = 0;

          // Para preguntas condicionadas (derivadas), evaluar sobre su base aplicable
          const condRule = CONDITIONAL_RULES[q.col] || null;
          const isConditional = Boolean(condRule);
          const evalRecords = isConditional
            ? records.filter(condRule.filter)
            : records;

          evalRecords.forEach(r => {
            // En Pregunta 1 (M: Lugar de diagnóstico), replicar exactamente Región de Residencia (H)
            let ans = (q.col === 'M') ? r.H : r[q.col];
            ans = normalizeAnswer(q.col, ans);

            // En preguntas condicionadas, no añadir el item 'No corresponde' ni 'No respondió'
            if (isConditional && (ans === 'No corresponde' || ans === 'No respondió')) {
              naCount++;
              return;
            }

            if (ans === 'No respondió' || ans === 'No corresponde') {
              naCount++;
            } else {
              validCount++;
            }

            if (!counts[ans]) {
              counts[ans] = { total: 0 };
            }
            counts[ans].total++;
          });

          // Ordenamiento: si la pregunta tiene orden canónico, respetar ese orden
          const canonicalOrder = QUESTION_CANONICAL_ORDER[q.col] || null;

          // Asegurar que TODAS las opciones oficiales siempre existan correlativamente (con 0 si no fueron seleccionadas)
          if (canonicalOrder) {
            canonicalOrder.forEach(opt => {
              if (opt !== 'No corresponde' && opt !== 'No respondió' && !counts[opt]) {
                counts[opt] = { total: 0 };
              }
            });
          }

          const entries = Object.entries(counts).sort((a, b) => {
            const labelA = a[0];
            const labelB = b[0];

            // Siempre dejar 'No corresponde', 'No respondió' y 'No recuerdo' al final
            if (labelA === 'No corresponde') return 1;
            if (labelB === 'No corresponde') return -1;
            if (labelA === 'No respondió') return 1;
            if (labelB === 'No respondió') return -1;
            if (labelA === 'No recuerdo' && labelB !== 'No respondió' && labelB !== 'No corresponde') return 1;
            if (labelB === 'No recuerdo' && labelA !== 'No respondió' && labelA !== 'No corresponde') return -1;

            if (canonicalOrder) {
              const idxA = canonicalOrder.indexOf(labelA);
              const idxB = canonicalOrder.indexOf(labelB);

              // Si ambas están en el catálogo oficial
              if (idxA !== -1 && idxB !== -1) {
                return idxA - idxB;
              }
              // Si solo una está en el catálogo, priorizar la catalogada
              if (idxA !== -1) return -1;
              if (idxB !== -1) return 1;
            }

            // Fallback: ordenar por cantidad de mayor a menor
            return b[1].total - a[1].total;
          });

          const chartEntries = showNAInChart
            ? entries
            : entries.filter(e => e[0] !== 'No respondió' && e[0] !== 'Sin respuesta' && e[0] !== 'No corresponde');

          const isMobile = window.innerWidth <= 768;
          const isDoughnut = q.chartType === 'doughnut' && chartEntries.length <= 5;
          const chartHeight = isDoughnut 
            ? (isMobile ? 260 : 290) 
            : Math.max(isMobile ? 240 : 270, chartEntries.length * (isMobile ? 34 : 38) + 60);

          const cardUniverseTotal = isConditional ? validCount : evalRecords.length;
          const badgeLabel = isConditional ? condRule.badge : 'Total Encuestadas';

          const tableRows = entries.map(([ans, st]) => {
            const isNA = ans === 'No respondió' || ans === 'Sin respuesta' || ans === 'No corresponde';
            const pctTotal = cardUniverseTotal ? ((st.total / cardUniverseTotal) * 100).toFixed(1) : '0.0';
            const pctValid = (!isNA && validCount) ? ((st.total / validCount) * 100).toFixed(1) + '%' : '—';
            const wBar = cardUniverseTotal ? (st.total / cardUniverseTotal * 100).toFixed(1) : 0;

            return `
              <tr class="${isNA ? 'na-row' : ''}">
                <td class="col-main" style="font-weight:${isNA ? '500' : '600'};">${ans}</td>
                <td class="num col-count" style="font-weight:700;">${st.total}</td>
                <td class="num col-pct"><span class="pct-badge">${pctTotal}%</span></td>
                <td class="num col-extra" style="color:var(--text-muted); font-size:0.78rem;">${pctValid}</td>
                <td class="bar-cell col-extra">
                  <div class="mini-bar-bg" title="${st.total} personas (${pctTotal}%)">
                    <div class="mini-bar-fill" style="width:${wBar}%"></div>
                  </div>
                </td>
              </tr>
            `;
          }).join('');

          const card = document.createElement('article');
          card.className = 'q-card';
          card.id = 'card-' + q.col;
          card.innerHTML = `
            <div class="q-header">
              <div>
                <div class="q-badges">
                  <span class="tag-primary">${q.code}</span>
                  <span class="tag-neutral">${badgeLabel}: ${cardUniverseTotal} personas</span>
                </div>
                <div class="q-title">${q.title}</div>
                <div class="q-sub">${q.subtitle}</div>
              </div>
            </div>
            <div class="q-content">
              <div class="chart-container" style="height:${chartHeight}px;">
                <canvas id="chart-${q.col}"></canvas>
              </div>
              <div class="ans-table-wrap">
                <table class="ans-table">
                  <thead>
                    <tr>
                      <th class="col-main">Opción de Respuesta</th>
                      <th class="num col-count">Personas</th>
                      <th class="num col-pct">${isConditional ? '% Derivado' : '% Universo'}</th>
                      <th class="num col-extra">% Válido</th>
                      <th class="col-extra">Distribución</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRows}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="q-analysis">
              <div class="q-analysis-title">📌 Análisis de Resultados — ${q.code}</div>
              <div>${q.analysis}</div>
            </div>
          `;

          root.appendChild(card);

          // Build Chart
          const labels = chartEntries.map(e => e[0]);
          const dTotal = chartEntries.map(e => e[1].total);
          const ctx = document.getElementById('chart-' + q.col).getContext('2d');

          if (isDoughnut) {
            charts[q.col] = new Chart(ctx, {
              type: 'doughnut',
              data: {
                labels,
                datasets: [{
                  data: dTotal,
                  backgroundColor: labels.map((l, idx) => (l === 'No respondió' || l === 'Sin respuesta') ? '#cbd5e1' : COLORS[idx % COLORS.length]),
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { 
                      font: { family: 'Inter', size: isMobile ? 10 : 12 }, 
                      padding: isMobile ? 8 : 14,
                      boxWidth: isMobile ? 12 : 24
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const v = context.raw;
                        const base = isConditional ? cardUniverseTotal : (showNAInChart ? cardUniverseTotal : validCount);
                        const pct = base ? ((v / base) * 100).toFixed(1) : 0;
                        return ` ${context.label}: ${v} personas (${pct}%)`;
                      }
                    }
                  }
                }
              }
            });
          } else {
            charts[q.col] = new Chart(ctx, {
              type: 'bar',
              data: {
                labels,
                datasets: [
                  {
                    label: 'Personas',
                    data: dTotal,
                    backgroundColor: labels.map(l => (l === 'No respondió' || l === 'Sin respuesta') ? '#cbd5e1' : '#432682'),
                    borderRadius: 4,
                    barPercentage: 0.75
                  }
                ]
              },
              options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { family: 'Inter', size: isMobile ? 9 : 11 } },
                    title: { 
                      display: window.innerWidth > 480, 
                      text: 'Cantidad de Personas', 
                      font: { family: 'Inter', size: isMobile ? 9 : 11, weight: '600' } 
                    }
                  },
                  y: {
                    grid: { display: false },
                    ticks: {
                      font: { family: 'Inter', size: isMobile ? 10 : 11, weight: '600' },
                      color: '#1e293b',
                      callback: function(value) {
                        const lbl = this.getLabelForValue(value);
                        const maxLen = window.innerWidth <= 480 ? 18 : (isMobile ? 24 : 38);
                        return lbl.length > maxLen ? lbl.substring(0, maxLen) + '…' : lbl;
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const tot = context.raw;
                        const base = isConditional ? cardUniverseTotal : (showNAInChart ? cardUniverseTotal : validCount);
                        const pct = base ? ((tot / base) * 100).toFixed(1) : 0;
                        return ` ${tot} personas (${pct}%)`;
                      }
                    }
                  }
                }
              }
            });
          }
        });
      });

      setupScrollSpy();
    }

    let scrollSpyObserver = null;
    function setupScrollSpy() {
      if (scrollSpyObserver) {
        scrollSpyObserver.disconnect();
      }
      const cards = document.querySelectorAll('.q-card');
      const links = document.querySelectorAll('.nav-q-link');
      if (!cards.length || !links.length) return;

      scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach(l => {
              if (l.getAttribute('href') === '#' + id) {
                l.classList.add('is-active');
              } else {
                l.classList.remove('is-active');
              }
            });
          }
        });
      }, {
        rootMargin: '-15% 0px -75% 0px'
      });

      cards.forEach(card => scrollSpyObserver.observe(card));
    }

    function setupBackToTop() {
      const btn = document.getElementById('obs-btn-back-top');
      if (!btn) return;

      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          btn.classList.add('is-visible');
        } else {
          btn.classList.remove('is-visible');
        }
      }, { passive: true });

      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    function resetAllFilters() {
      const sSector = document.getElementById('f-sector');
      const sSystem = document.getElementById('f-system');
      const sRegion = document.getElementById('f-region');
      const sSearch = document.getElementById('f-search');
      const sShowNA = document.getElementById('f-show-na');
      if (sSector) sSector.value = 'ALL';
      if (sSystem) sSystem.value = 'ALL';
      if (sRegion) sRegion.value = 'ALL';
      if (sSearch) sSearch.value = '';
      if (sShowNA) sShowNA.checked = false;
      renderDashboard();
    }

    function initObservatorioMetrics() {
      if (!document.getElementById('questions-root')) return;

      ['f-sector', 'f-system', 'f-region', 'f-show-na'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', renderDashboard);
      });
      const searchEl = document.getElementById('f-search');
      if (searchEl) searchEl.addEventListener('input', renderDashboard);

      const btnReset = document.getElementById('btn-reset');
      if (btnReset) btnReset.addEventListener('click', resetAllFilters);

      const btnClearChips = document.getElementById('btn-clear-chips');
      if (btnClearChips) btnClearChips.addEventListener('click', resetAllFilters);

      const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
      const sidebarAside = document.getElementById('sidebar-aside');
      if (sidebarToggleBtn && sidebarAside) {
        sidebarToggleBtn.addEventListener('click', () => {
          const isOpen = sidebarAside.classList.toggle('is-open');
          sidebarToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }

      setupBackToTop();
      renderDashboard();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initObservatorioMetrics);
    } else {
      initObservatorioMetrics();
    }


