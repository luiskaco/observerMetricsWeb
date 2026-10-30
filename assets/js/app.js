const charts = {};

    const COLORS = [
      '#432682', '#0ea5e9', '#cc3366', '#573e9e', '#ffbc7d',
      '#059669', '#d97706', '#2563eb', '#9333ea', '#0d9488'
    ];

    // Lista de columnas que corresponden a preguntas condicionadas (dependen de una pregunta previa)
    // Nota: La pregunta 2 (Col 'N') es padre/directa, por lo que no lleva 'Derivada:'
        // Reglas de preguntas condicionadas (derivadas de una pregunta o subconjunto previo)
    const CONDITIONAL_RULES = {
      'O': { filter: r => r.N === 'Sí' || r.N === 'Sí me derivaron a Lima', badge: 'Total Derivados' },
      'P': { filter: r => r.N === 'Sí' || r.N === 'Sí me derivaron a Lima', badge: 'Total Derivados' },
      'Z': { filter: r => r.Z !== 'No corresponde', badge: 'Total Derivados' },
      'AB': { filter: r => r.AB !== 'No corresponde', badge: 'Total Derivados' },
      'AC': { filter: r => r.AC !== 'No respondió' && r.AC !== 'No corresponde', badge: 'Total Derivados' },
      'AE': { filter: r => r.AE !== 'No corresponde' && r.AE !== 'No respondió', badge: 'Total Derivados' },
      'AF': { filter: r => r.AF !== 'No corresponde', badge: 'Total Derivados' },
      'AK': { filter: r => r.AK !== 'No corresponde', badge: 'Total Derivados' },
      'AM': { filter: r => r.AM !== 'No corresponde', badge: 'Total Derivados' }
    };

    const CONDITIONAL_QUESTION_COLS = new Set(['O', 'P', 'V', 'W', 'X', 'Y', 'Z', 'AB', 'AC', 'AE', 'AF', 'AG', 'AI', 'AK', 'AM']);

    const pubList = ['Minsa', 'EsSalud', 'FFAA'];
    const privList = ['Seguro Privado', 'Particular'];

    const SECTOR_ANALYSIS = {
  // --- PERFILES DEMOGRÁFICOS ---
  "H": {
    "pub": "En el sector público (N = 485), Lima concentra 216 pacientes (44.5%), mientras que las regiones del interior suman el 55.5% (269 pacientes), destacando Arequipa (87, 17.9%), Piura (70, 14.4%), Junín (41, 8.5%), Lambayeque (38, 7.8%) y La Libertad (33, 6.8%). Refleja la amplia cobertura nacional y descentralizada de las redes de EsSalud y MINSA.",
    "priv": "En el sector privado (N = 127), Lima concentra a la gran mayoría con 76 pacientes (59.8%), seguida de La Libertad (24, 18.9%) y Junín (12, 9.4%), con menor presencia en Arequipa (6, 4.7%) y Piura (6, 4.7%). La oferta oncológica privada y de clínicas de seguros se concentra marcadamente en la capital y el norte del país."
  },
  "I": {
    "pub": "El 81.6% (396 personas) son pacientes actuales directas atendidas en hospitales públicos, mientras que el 18.4% (89 personas) corresponde a familiares o cuidadores que respondieron en su representación.",
    "priv": "El 78.0% (99 personas) son pacientes directas atendidas en clínicas privadas o EPS, y el 22.0% (28 personas) corresponde a familiares y cuidadores a cargo del soporte logístico y cobertura."
  },
  "J": {
    "pub": "Dentro del sector público, EsSalud representa a 282 encuestadas (58.1%), el MINSA / SIS a 182 encuestadas (37.5%) y la Sanidad de las Fuerzas Armadas y Policía Nacional (FF.AA. / PNP) a 21 pacientes (4.3%).",
    "priv": "Dentro del sector privado, el Seguro Privado (pólizas de salud y planes EPS) abarca a 110 personas (86.6%), mientras que 17 personas (13.4%) se atienden bajo la modalidad de Atención Particular mediante pago directo de bolsillo."
  },
  "K": {
    "pub": "En el sector público, el diagnóstico se concentra en los rangos de 50–59 años con 171 pacientes (35.3%) y 40–49 años con 161 pacientes (33.2%), seguidos por 60–69 años (75, 15.5%). Las pacientes jóvenes menores de 40 años representan el 13.0% (63 mujeres).",
    "priv": "En el sector privado, predomina un perfil más joven: el 44.1% (56 mujeres) tenía entre 40–49 años al momento del diagnóstico, seguido por 30–39 años con 24 pacientes (18.9%) y 50–59 años con 20 pacientes (15.7%). Las mujeres diagnosticadas antes de los 40 años alcanzan el 22.0% (28 casos)."
  },
  "L": {
    "pub": "414 personas (85.4% del sector público) otorgaron su consentimiento informado afirmativo para el procesamiento estadístico y epidemiológico de sus datos.",
    "priv": "108 personas (85.0% del sector privado) otorgaron su consentimiento informado afirmativo para el estudio del Observatorio."
  },

  // --- 1. LUGAR DE DIAGNÓSTICO Y DERIVACIÓN A LIMA ---
  "M": {
    "pub": "El 44.5% (216 personas) fue diagnosticada en Lima. En regiones públicas destacan Arequipa (87, 17.9%), Piura (70, 14.4%), Junín (41, 8.5%), Lambayeque (38, 7.8%) y La Libertad (33, 6.8%), donde la confirmación diagnóstica se logró en hospitales locales de EsSalud y MINSA.",
    "priv": "El 59.8% (76 personas) se diagnosticó en establecimientos privados de Lima, seguida de centros clínicos en La Libertad (24, 18.9%), Junín (12, 9.4%) y Arequipa (6, 4.7%)."
  },
  "N": {
    "pub": "Entre las 275 pacientes públicas de regiones, 102 personas (37.1% de quienes viven en regiones; 21.0% del total público) requirieron ser derivadas o trasladadas a Lima para acceder a confirmación o tratamiento especializado; 173 resolvieron su atención en su región y 210 ya residían en Lima.",
    "priv": "Entre las 50 pacientes privadas de regiones, 23 requirieron traslado a Lima (46.0% de quienes residen en provincias; 18.1% del total privado), principalmente por falta de infraestructura de radioterapia o cirugías de alta complejidad en su localidad."
  },
  "O": {
    "pub": "Entre las pacientes del sector público que requirieron traslado a Lima con etapa registrada (94 personas), la principal causa fue Confirmación del diagnóstico / biopsia con 39 casos (41.5%), seguida de Quimioterapia con 16 casos (17.0%), Consulta con especialista con 15 casos (16.0%), Radioterapia con 10 casos (10.6%) y Cirugía con 10 casos (10.6%).",
    "priv": "En el sector privado, entre quienes requirieron derivación a Lima (23 personas), las etapas de traslado fueron: Confirmación del diagnóstico / biopsia con 10 casos (43.5%), Radioterapia con 6 casos (26.1%), Consulta con especialista con 5 casos (21.7%) y Quimioterapia con 2 casos (8.7%)."
  },
  "P": {
    "pub": "Al ser derivadas a Lima, el tiempo de espera hasta recibir atención efectiva en el sector público fue crítico: Hasta 30 días en 29 pacientes (30.9%), Hasta 3 meses en 24 (25.5%), Hasta 7 días en 15 (16.0%), Más de 6 meses en 10 (10.6%) y Hasta 6 meses en 10 (10.6%). Más del 46% tardó más de un mes en iniciar su atención en la capital.",
    "priv": "En el sector privado, el 61.9% de las pacientes derivadas a Lima accedió en plazos breves: Hasta 30 días (13 pacientes, 61.9%) y Hasta 7 días (3 pacientes, 14.3%). Solo 3 pacientes esperaron hasta 3 meses."
  },

  // --- 2. DETECCIÓN INICIAL Y PRIMERA CONSULTA ---
  "Q": {
    "pub": "En el sector público, la primera señal de alarma fue predominantemente un hallazgo físico por bulto o nódulo palpable con 227 casos (46.8%), mientras que la mamografía preventiva solo detectó el 27.4% (133 casos) y los controles de rutina el 6.4% (31 casos), evidenciando un diagnóstico tardío por falta de tamizaje temprano.",
    "priv": "En el sector privado, la mamografía preventiva fue la principal vía de detección con 45 casos (35.4%), superando ligeramente al bulto palpable (44 casos, 34.6%) y los chequeos de rutina (18 casos, 14.2%). El tamizaje regular permite capturar lesiones no palpables de forma precoz."
  },
  "R": {
    "pub": "Ante la sospecha inicial, 171 pacientes públicas (35.3%) acudieron a buscar atención en menos de 7 días y 42 (8.7%) el mismo día. No obstante, 112 pacientes (23.1%) tardaron hasta un mes y 97 (20.0%) demoraron hasta 3 meses en acudir.",
    "priv": "En el sector privado, 48 pacientes (37.8%) acudieron dentro de los primeros 7 días y 23 (18.1%) el mismo día. Un 24.4% (31 pacientes) esperó hasta un mes y 15 (11.8%) tardó hasta 3 meses."
  },
  "S": {
    "pub": "Para conseguir la primera consulta médica en el sistema público: 221 pacientes (45.6%) esperaron hasta 30 días, 112 (23.1%) hasta 7 días, 65 (13.4%) el mismo día y 48 (9.9%) tuvieron que esperar hasta 3 meses debido al cuello de botella en consultorios externos.",
    "priv": "En el sector privado, el acceso a la primera cita fue sustancialmente más ágil: el 62.2% consiguió cita en su primera semana (64 pacientes en hasta 7 días y 15 el mismo día). 43 pacientes (33.9%) esperaron hasta 30 días."
  },
  "T": {
    "pub": "El 76.5% (371 pacientes) realizó su primera consulta médica en un establecimiento público (EsSalud: 228, MINSA/SIS: 126, FF.AA.: 17). Sin embargo, 109 pacientes (22.5%) tuvieron que realizarla en el sector privado pagando de su propio bolsillo para ser atendidas con mayor celeridad.",
    "priv": "En el sector privado, el 98.4% (125 pacientes) realizó su primera consulta en una clínica privada o consultorio particular (108 de seguro privado y 17 de atención particular); únicamente 2 pacientes acudieron inicialmente a un centro público."
  },

  // --- 3. EXÁMENES DE IMÁGENES Y DIAGNÓSTICO ---
  "U": {
    "pub": "En la primera consulta médica, al 95.5% (463 pacientes públicas) se le solicitó de inmediato exámenes complementarios de mama (mamografía, ecografía o resonancia).",
    "priv": "En el sector privado, al 98.4% (125 pacientes) se le prescribieron exámenes de mama durante su primera consulta médica."
  },
  "V": {
    "pub": "El estudio más prescrito en el público fue la combinación de mamografía y ecografía en 290 pacientes (59.8%), seguida por ecografía mamaria exclusiva (73, 15.1%), mamografía sola (69, 14.2%) y resonancia magnética (15, 3.1%).",
    "priv": "En el privado, la combinación de mamografía y ecografía alcanzó el 63.8% (81 casos), mientras que la resonancia magnética tuvo una tasa mayor de uso (14 casos, 11.0%) y la ecografía sola representó el 11.8% (15 casos)."
  },
  "W": {
    "pub": "Para realizarse los exámenes solicitados en el sector público, el 46.0% (223 pacientes) esperó hasta 30 días y el 20.4% (99 pacientes) esperó hasta 3 meses. Solo el 24.3% (118 pacientes) logró realizárselos en 7 días.",
    "priv": "En el sector privado, el 85.0% de las pacientes se realizó los exámenes dentro del primer mes: 55 pacientes (43.3%) en menos de 7 días y 53 (41.7%) en hasta 30 días. Solo 16 esperaron hasta 3 meses."
  },
  "X": {
    "pub": "El tiempo hasta recibir los resultados del examen en el sector público tardó hasta 30 días en 260 pacientes (53.6%) y hasta 3 meses en 68 pacientes (14.0%). Solo el 17.1% (83) obtuvo el informe en menos de 7 días.",
    "priv": "En el sector privado, la entrega de resultados fue significativamente más rápida: el 54.3% (69 pacientes) los recibió en menos de 7 días y el 9.4% (12 pacientes) el mismo día. El 32.3% (41) los tuvo en hasta 30 días."
  },
  "Y": {
    "pub": "El 67.0% (325 pacientes públicas) reportó haber enfrentado serias dificultades o barreras para poder realizarse los exámenes de mama indicados.",
    "priv": "Por el contrario, en el sector privado el 67.7% (86 pacientes) afirmó no haber tenido dificultades para realizar sus estudios de imagen; el 30.7% (39) reportó algún inconveniente administrativo o de cobertura."
  },
  "Z": {
    "pub": "Entre quienes enfrentaron trabas en el público, la principal dificultad fue 'No había citas disponibles' con 146 menciones (30.1%), seguida por 'Tuve que pagar el examen en privado por demora pública' (60, 12.4%) y 'Equipos descompuestos o inoperativos' (49, 10.1%).",
    "priv": "En el sector privado, las dificultades identificadas correspondieron a trámites con el seguro o autorizaciones de cobertura de la póliza (14, 11.0%) y tener que asumir pagos no cubiertos o copagos elevados (13, 10.2%)."
  },

  // --- 4. DERIVACIÓN Y CONTINUIDAD DE LA ATENCIÓN ---
  "AA": {
    "pub": "El 67.2% (326 pacientes públicas) debió ser derivada a otro establecimiento o especialista tras sus exámenes iniciales para continuar con la confirmación diagnóstica, reflejando fragmentación en el primer y segundo nivel asistencial.",
    "priv": "En el sector privado, la mayoría de pacientes (69, 54.3%) resolvió su atención con el mismo especialista o clínica sin necesidad de derivación externa; un 45.7% (58 pacientes) fue derivada a mastólogos u oncólogos de referencia."
  },
  "AB": {
    "pub": "Tras la derivación médica en el público, el tiempo de espera para ser evaluada por el nuevo especialista fue: Hasta 15 días en 149 pacientes (30.7%), Hasta 7 días en 89 (18.4%), Hasta 30 días en 65 (13.4%) y Hasta 3 meses en 31 (6.4%).",
    "priv": "En el sector privado, la atención tras la derivación se concretó de manera oportuna: el 26.8% (34 pacientes) fue atendida en menos de 7 días y el 18.1% (23 pacientes) en hasta 15 días."
  },
  "AC": {
    "pub": "Entre las pacientes del sector público que registraron su trayecto de derivación (357 con respuesta), el 60.5% (216 personas) se mantuvo dentro del sistema público sin cambiar de sector. Sin embargo, un 23.5% (84 personas: 48 en EsSalud, 30 en MINSA y 6 en FF.AA.) inició sus exámenes en clínicas privadas y migró hacia el sector público para poder costear su tratamiento oncológico, mientras que un 10.9% (39 personas) migró de Público a Privado por las demoras del Estado.",
    "priv": "En el sector privado (127 pacientes), el 83.5% (106 personas) se mantuvo íntegramente en el sistema privado de clínicas y EPS. Un 12.6% (16 personas) migró al sector privado tras haber iniciado en hospitales públicos para evitar las demoras burocráticas, y solo 2 personas (1.6%) migraron de Privado a Público durante esta fase de derivación diagnóstica."
  },

  // --- 5. BIOPSIA Y DIAGNÓSTICO PATOLÓGICO ---
  "AD": {
    "pub": "Al 96.5% (468 pacientes públicas) se le indicó formalmente una biopsia de mama tras los hallazgos sospechosos de imagen.",
    "priv": "Al 98.4% (125 pacientes privadas) se le indicó una biopsia mamaria para confirmación histopatológica."
  },
  "AE": {
    "pub": "El tiempo de espera para realizarse la biopsia en el público fue: Hasta 15 días en 184 pacientes (37.9%), Hasta 7 días en 111 (22.9%), Hasta 30 días en 105 (21.6%) y de 1 a más de 6 meses en 52 pacientes (10.7%).",
    "priv": "En el sector privado, el 85.0% de las pacientes logró realizarse la biopsia en menos de dos semanas: Hasta 15 días en 62 pacientes (48.8%) y Hasta 7 días en 46 pacientes (36.2%). Solo 13 pacientes esperaron hasta 30 días."
  },
  "AF": {
    "pub": "La entrega del informe anatomopatológico de la biopsia en el sector público tardó: Hasta 15 días en 192 casos (39.6%), Hasta 30 días en 146 casos (30.1%), y más de un mes en 48 pacientes (9.9%).",
    "priv": "En el sector privado, el 86.6% de los resultados de patología se entregó en 15 días o menos: 77 pacientes (60.6%) en hasta 15 días y 33 pacientes (26.0%) en menos de una semana. Solo el 9.4% tardó hasta un mes."
  },
  "AG": {
    "pub": "El 69.1% (335 pacientes) se realizó la biopsia en hospitales del Estado (EsSalud, MINSA, INEN/IREN). Sin embargo, 120 pacientes públicas (24.7%) pagaron su biopsia de forma particular en clínicas privadas para no demorar el inicio del tratamiento.",
    "priv": "En el sector privado, el 96.1% (122 pacientes) se realizó la biopsia en clínicas o laboratorios privados de su cobertura; solo 3 pacientes acudieron a centros públicos."
  },
  "AH": {
    "pub": "Al 63.1% (306 pacientes) se le informó con claridad el subtipo tumoral de su cáncer de mama; no obstante, a casi un tercio (159 pacientes, 32.8%) nunca se le explicó su subtipo genético o biológico.",
    "priv": "En el privado, al 67.7% (86 pacientes) se le explicó su subtipo molecular con precisión; un 29.1% (37 pacientes) refirió no haber recibido esta información por parte del equipo médico."
  },
  "AI": {
    "pub": "Entre las opciones informadas en el sector público: Luminal A/B u hormonal (135 pacientes, 27.8%), HER2 positivo (114 pacientes, 23.5%), y Triple Negativo (44 pacientes, 9.1%). Un 40.4% (196 pacientes) no recibió o no conoce esta clasificación biológica.",
    "priv": "En el sector privado, destaca una mayor proporción de pacientes que conoce su perfil: Luminal A/B (44 pacientes, 34.6%), HER2 positivo (27 pacientes, 21.3%) y Triple Negativo (13 pacientes, 10.2%). Un 33.9% indicó no recordarlo o no haber sido informada."
  },

  // --- 6. ESTADIAJE CLÍNICO ---
  "AJ": {
    "pub": "En el sector público predominan los diagnósticos intermedios y avanzados: Estadio II con 203 pacientes (41.9%) y Estadio III con 139 pacientes (28.7%). El Estadio I solo abarcó al 10.1% (49 pacientes), reflejando que más del 70% llega con tumores localmente avanzados.",
    "priv": "En el sector privado destaca una mayor proporción de diagnósticos en etapas tempranas: Estadio I (44 pacientes, 34.6%), Estadio II (44 pacientes, 34.6%), Estadio III (14 pacientes, 11.0%) y Estadio 0 in situ (9 pacientes, 7.1%). Las etapas precoces (0 y I) alcanzan el 41.7% (frente a solo 12.0% en el público).",
  },
  "AK": {
    "pub": "Para completar los exámenes de estadiaje (tomografías, gammagrafías, ecografías abdominales): el 45.2% (219 pacientes) tardó hasta 30 días, el 20.6% (100 pacientes) hasta 3 meses, y 36 pacientes esperaron más de 3 meses.",
    "priv": "En el sector privado, el 81.9% de los estudios de estadio concluyó dentro del primer mes: 78 pacientes (61.4%) en hasta 30 días y 26 (20.5%) en menos de una semana."
  },
  "AL": {
    "pub": "El 17.7% (86 pacientes públicas) reportó formalmente que su enfermedad avanzó o progresó a un estadio clínico superior durante los meses de espera previa al inicio del tratamiento oncológico.",
    "priv": "En el sector privado, el 15.7% (20 pacientes) refirió avance del estadio clínico durante el proceso diagnóstico previo al tratamiento."
  },
  "AM": {
    "pub": "Entre quienes reportaron un estadio informado al inicio del tratamiento médico en el sector público, destacan 44 casos en Estadio III (9.1%), 28 en Estadio IV con metástasis (5.8%) y 14 en Estadio II.",
    "priv": "En el sector privado, entre las pacientes que refirieron un estadio redefinido al inicio, se registraron 9 casos en Estadio III y 7 casos en Estadio IV metastásico."
  },

  // --- 7. TRATAMIENTO ONCOLÓGICO ---
  "AN": {
    "pub": "En el sector público, la Quimioterapia fue el primer tratamiento indicado de manera mayoritaria con 281 pacientes (57.9%), seguida de la Cirugía con 140 pacientes (28.9%) y Combinación terapéutica con 52 pacientes (10.7%). La alta tasa de quimioterapia neoadyuvante refleja la necesidad de reducir tumores avanzados previos a operar.",
    "priv": "En el sector privado, la Cirugía fue la indicación inicial más frecuente con 61 pacientes (48.0%), superando a la Quimioterapia (34 pacientes, 26.8%) y Tratamiento combinado (30 pacientes, 23.6%), lo que guarda estricta correlación con la alta detección en etapas tempranas Estadio I y II.",
  },
  "AO": {
    "pub": "Desde la confirmación diagnóstica hasta recibir la indicación formal del oncólogo: 236 pacientes públicas (48.7%) esperaron hasta 30 días, 111 (22.9%) hasta 3 meses, 83 (17.1%) hasta 7 días y 34 (7.0%) esperaron más de 3 meses.",
    "priv": "En el sector privado, el 83.5% recibió indicación terapéutica en menos de un mes: 79 pacientes (62.2%) en hasta 30 días y 27 (21.3%) en menos de 7 días. Solo 18 pacientes esperaron hasta 3 meses."
  },
  "AP": {
    "pub": "Desde la indicación médica hasta el inicio efectivo de la terapia (primera sesión de quimio o fecha de cirugía): 193 pacientes públicas (39.8%) esperaron hasta 30 días, 167 (34.4%) tardaron hasta 3 meses, y 35 pacientes (7.2%) esperaron de 3 a más de 6 meses.",
    "priv": "En el sector privado, el 88.2% inició su tratamiento en menos de un mes: 59 pacientes (46.5%) en hasta 30 días y 53 pacientes (41.7%) en menos de 7 días. Solo 13 pacientes esperaron hasta 3 meses."
  },
  "AQ": {
    "pub": "El 95.1% (461 pacientes públicas) inició efectivamente su tratamiento en hospitales públicos (EsSalud: 270, MINSA/INEN: 172, FF.AA.: 19); 18 pacientes (3.7%) debieron iniciarlo en clínicas privadas.",
    "priv": "El 96.9% (123 pacientes privadas) inició su tratamiento en centros oncológicos privados o clínicas con cobertura de su seguro; únicamente 3 pacientes acudieron a centros públicos."
  },

  // --- 8. PERCEPCIÓN DE BARRERAS Y EXPERIENCIA DEL PACIENTE ---
  "AR": {
    "pub": "Las etapas con mayor tiempo de espera percibido en el sector público fueron: Exámenes de diagnóstico (161 menciones, 33.2%), Inicio efectivo del tratamiento (109 menciones, 22.5%) y Estudios para determinar estadio (59 menciones, 12.2%).",
    "priv": "En el sector privado, la respuesta predominante fue 'No tuve una espera importante' con 42 pacientes (33.1%), seguida por Inicio del tratamiento (24 menciones, 18.9%) y Exámenes diagnósticos (23 menciones, 18.1%)."
  },
  "AS": {
    "pub": "Las principales barreras reportadas a lo largo de la ruta en el público fueron: Conseguir una cita médica (140 pacientes, 28.9%), Realizar los exámenes indicados (85 pacientes, 17.5%), Esperar los resultados (71 pacientes, 14.6%) y Disponibilidad de medicinas (50 pacientes, 10.3%).",
    "priv": "En el sector privado, las principales dificultades se relacionaron con autorizaciones de cobertura de seguros (30 pacientes, 23.6%) y costo económico o copagos (25 pacientes, 19.7%). El 20.5% (26 pacientes) afirmó no haber tenido ninguna dificultad."
  },
  "AT": {
    "pub": "Casi la mitad de las pacientes del sector público (227 mujeres, 46.8%) tuvo que acudir de forma particular al sector privado y pagar de su bolsillo para acelerar consultas, ecografías y biopsias debido a la saturación de los hospitales públicos.",
    "priv": "En el sector privado, el 52.0% (66 pacientes) también debió asumir pagos directos particulares fuera de su plan de seguro para acceder a procedimientos de mayor rapidez o tecnologías no cubiertas."
  },
  "AU": {
    "pub": "El 69.5% de las pacientes del sector público (337 mujeres) consideró firmemente que los trámites burocráticos y las demoras del sistema de salud retrasaron de manera perjudicial el inicio de su tratamiento oncológico.",
    "priv": "En el sector privado, el 66.9% (85 pacientes) consideró que el servicio fue oportuno y NO retrasó su tratamiento, mientras que un 26.8% (34 pacientes) percibió retrasos asociados a aprobaciones de cartas de garantía."
  },
  "AV": {
    "pub": "Tiempo total transcurrido desde la primera sospecha hasta el inicio del tratamiento: En el sector público, el 58.1% tardó más de 3 meses (148 pacientes, 30.5% esperó de 3 a 6 meses; y 134 pacientes, 27.6% esperó más de 6 meses). Solo el 14.2% inició en menos de un mes.",
    "priv": "En el sector privado, el 79.5% de las pacientes inició su tratamiento dentro de los primeros 3 meses: 37 pacientes (29.1%) en hasta 30 días, 34 (26.8%) en hasta 3 meses y 30 (23.6%) en menos de 7 días. Solo el 14.2% tardó más de 3 meses."
  },
  "AW": {
    "pub": "En cuanto a claridad de la información: En el sector público, solo el 29.5% (143 pacientes) refirió haber recibido 'Siempre' información clara y oportuna sobre el siguiente paso; el 47.2% la recibió 'Algunas veces' o 'Casi siempre', y un 14.8% indicó que 'Nunca' se le explicó.",
    "priv": "En el sector privado, la comunicación médica fue marcadamente superior: el 65.4% (83 pacientes) refirió que 'Siempre' recibió información clara y detallada, y el 16.5% 'Casi siempre'. Solo el 12.6% refirió 'Nunca'."
  },
  "AX": {
    "pub": "A 190 pacientes del sector público (39.2%) se les indicó algún medicamento o tratamiento innovador (terapias dirigidas, inmunoterapias o inhibidores CDK4/6) no cubierto por el petitorio institucional de EsSalud o MINSA, requiriendo gestiones de excepción o compra de bolsillo.",
    "priv": "En el sector privado, al 46.5% (59 pacientes) se le prescribió tratamientos innovadores no cubiertos por la póliza base de su seguro privado o EPS, debiendo gestionar coberturas especiales o asumir copagos considerables."
  }
};


    // Catálogo de orden canónico oficial por columna (para no ordenar por cantidad de datos)
    const QUESTION_CANONICAL_ORDER = {
      // Perfil
      'I': ['Sí', 'No'],
      'J': ['EsSalud', 'MINSA / SIS', 'Seguro Privado', 'FF.AA. / PNP', 'Atención Particular'],
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
        'Radioterapia'
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
        'No recuerdo'
      ],

      // Pregunta 6: Tiempo hasta buscar atención médica
      'R': [
        'El mismo día',
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        'No recuerdo'
      ],

      // Pregunta 7: Tiempo hasta la primera consulta médica
      'S': [
        'El mismo día',
        'Hasta 7 días',
        'Hasta 30 días',
        'Hasta 3 meses',
        'Hasta 6 meses',
        'Más de 6 meses',
        'No recuerdo'
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
      'AD': ['Sí', 'No'],

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
        if (col === 'AI') return 'No me lo informaron';
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
        case 'J': // Sistema de Salud
          if (ans === 'Minsa') return 'MINSA / SIS';
          if (ans === 'FFAA') return 'FF.AA. / PNP';
          if (ans === 'Particular') return 'Atención Particular';
          break;
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

    function getCheckedValues(name) {
      const inputs = document.querySelectorAll(`input[name="${name}"]:checked`);
      return Array.from(inputs).map(i => i.value);
    }

    function syncSystemsFromSector() {
      const pubCb = document.querySelector('input[name="f-sector"][value="PUBLIC"]');
      const privCb = document.querySelector('input[name="f-sector"][value="PRIVATE"]');

      const isPub = pubCb ? pubCb.checked : false;
      const isPriv = privCb ? privCb.checked : false;

      const publicSystems = ['EsSalud', 'Minsa', 'FFAA'];
      const privateSystems = ['Seguro Privado', 'Particular'];

      if (isPub && !isPriv) {
        publicSystems.forEach(s => {
          const cb = document.querySelector(`input[name="f-system"][value="${s}"]`);
          if (cb) cb.checked = true;
        });
        privateSystems.forEach(s => {
          const cb = document.querySelector(`input[name="f-system"][value="${s}"]`);
          if (cb) cb.checked = false;
        });
      } else if (isPriv && !isPub) {
        privateSystems.forEach(s => {
          const cb = document.querySelector(`input[name="f-system"][value="${s}"]`);
          if (cb) cb.checked = true;
        });
        publicSystems.forEach(s => {
          const cb = document.querySelector(`input[name="f-system"][value="${s}"]`);
          if (cb) cb.checked = false;
        });
      } else if (!isPub && !isPriv) {
        ['EsSalud', 'Minsa', 'FFAA', 'Seguro Privado', 'Particular'].forEach(s => {
          const cb = document.querySelector(`input[name="f-system"][value="${s}"]`);
          if (cb) cb.checked = false;
        });
      }
    }

    function syncSectorFromSystems() {
      const publicSystems = ['EsSalud', 'Minsa', 'FFAA'];
      const privateSystems = ['Seguro Privado', 'Particular'];

      const pubChecked = publicSystems.filter(s => {
        const cb = document.querySelector(`input[name="f-system"][value="${s}"]`);
        return cb && cb.checked;
      }).length;

      const privChecked = privateSystems.filter(s => {
        const cb = document.querySelector(`input[name="f-system"][value="${s}"]`);
        return cb && cb.checked;
      }).length;

      const pubCb = document.querySelector('input[name="f-sector"][value="PUBLIC"]');
      const privCb = document.querySelector('input[name="f-sector"][value="PRIVATE"]');

      if (pubCb) pubCb.checked = (pubChecked === publicSystems.length);
      if (privCb) privCb.checked = (privChecked === privateSystems.length);
    }

    function updateTriggerLabels() {
      // Sector
      const sectors = getCheckedValues('f-sector');
      const txtSector = document.getElementById('txt-ms-sector');
      const btnSector = document.getElementById('btn-ms-sector');
      if (txtSector && btnSector) {
        if (sectors.length === 0 || sectors.length === 2) {
          txtSector.textContent = `Todos los Sectores (${DATA.totalCount})`;
          btnSector.classList.remove('has-active');
        } else if (sectors.includes('PUBLIC')) {
          const c = DATA.records.filter(r => r.J !== 'Seguro Privado' && r.J !== 'Particular').length;
          txtSector.textContent = `Público (${c})`;
          btnSector.classList.add('has-active');
        } else {
          const c = DATA.records.filter(r => r.J === 'Seguro Privado' || r.J === 'Particular').length;
          txtSector.textContent = `Privado (${c})`;
          btnSector.classList.add('has-active');
        }
      }

      // Sistema de Salud (Suma acumulativa de sistemas seleccionados)
      const systems = getCheckedValues('f-system');
      const txtSystem = document.getElementById('txt-ms-system');
      const btnSystem = document.getElementById('btn-ms-system');
      if (txtSystem && btnSystem) {
        if (systems.length === 0 || systems.length === 5) {
          txtSystem.textContent = `Todos los Sistemas (${DATA.totalCount})`;
          btnSystem.classList.remove('has-active');
        } else {
          const c = DATA.records.filter(r => systems.includes(r.J)).length;
          if (systems.length <= 2) {
            txtSystem.textContent = `${systems.join(' + ')} (${c})`;
          } else {
            txtSystem.textContent = `${systems.length} seleccionados (${c})`;
          }
          btnSystem.classList.add('has-active');
        }
      }

      // Ubicación Geográfica
      const regions = getCheckedValues('f-region');
      const txtRegion = document.getElementById('txt-ms-region');
      const btnRegion = document.getElementById('btn-ms-region');
      if (txtRegion && btnRegion) {
        if (regions.length === 0 || regions.length === 2) {
          txtRegion.textContent = `Todo el Perú (${DATA.totalCount})`;
          btnRegion.classList.remove('has-active');
        } else if (regions.includes('LIMA')) {
          const c = DATA.records.filter(r => r.H === 'Lima').length;
          txtRegion.textContent = `Solo Lima (${c})`;
          btnRegion.classList.add('has-active');
        } else {
          const c = DATA.records.filter(r => r.H !== 'Lima').length;
          txtRegion.textContent = `Solo Regiones (${c})`;
          btnRegion.classList.add('has-active');
        }
      }
    }

    function getFilteredRecords() {
      const sectors = getCheckedValues('f-sector');
      const systems = getCheckedValues('f-system');
      const regions = getCheckedValues('f-region');

      return DATA.records.filter(r => {
        // 1. Sector: si está seleccionado un solo sector y no se especificaron sistemas particulares
        if (sectors.length === 1 && (systems.length === 0 || systems.length === 5)) {
          if (sectors.includes('PUBLIC')) {
            if (r.J === 'Seguro Privado' || r.J === 'Particular') return false;
          }
          if (sectors.includes('PRIVATE')) {
            if (r.J !== 'Seguro Privado' && r.J !== 'Particular') return false;
          }
        }

        // 2. Sistema de Salud: suma de todos los sistemas marcados (OR inclusivo)
        if (systems.length > 0 && systems.length < 5) {
          if (!systems.includes(r.J)) return false;
        }

        // 3. Región geográfica (OR inclusivo entre regiones marcadas)
        if (regions.length > 0 && regions.length < 2) {
          if (regions.includes('LIMA') && r.H !== 'Lima') return false;
          if (regions.includes('PROV') && r.H === 'Lima') return false;
        }

        return true;
      });
    }

    function updateActiveFilterChips(records) {
      const sSearch = document.getElementById('f-search');
      const sShowNA = document.getElementById('f-show-na');

      const countText = document.getElementById('f-count-text');
      const pct = DATA.totalCount ? ((records.length / DATA.totalCount) * 100).toFixed(1) : '0';
      if (countText) {
        countText.textContent = `${records.length} de ${DATA.totalCount} personas (${pct}%)`;
      }

      const chipsContainer = document.getElementById('active-chips');
      const row = document.getElementById('active-filters-row');
      if (!chipsContainer || !row) return;

      chipsContainer.innerHTML = '';
      const activeList = [];

      // Chips de sistemas individuales seleccionados
      const systems = getCheckedValues('f-system');
      if (systems.length > 0 && systems.length < 5) {
        systems.forEach(sys => {
          const sysCount = DATA.records.filter(r => r.J === sys).length;
          activeList.push({
            label: `Sistema: ${sys === 'Minsa' ? 'MINSA / SIS' : (sys === 'FFAA' ? 'FF.AA. / PNP' : (sys === 'Particular' ? 'Atención Particular' : sys))} (${sysCount})`,
            clear: () => {
              const cb = document.querySelector(`input[name="f-system"][value="${sys}"]`);
              if (cb) cb.checked = false;
              syncSectorFromSystems();
              updateTriggerLabels();
              renderDashboard();
            }
          });
        });
      }

      // Chips de sector (solo si no hay sistemas individuales filtrados)
      const sectors = getCheckedValues('f-sector');
      if (sectors.length === 1 && (systems.length === 0 || systems.length === 5)) {
        sectors.forEach(sec => {
          const isPub = sec === 'PUBLIC';
          activeList.push({
            label: `Sector: ${isPub ? 'Público (485)' : 'Privado (127)'}`,
            clear: () => {
              const cb = document.querySelector(`input[name="f-sector"][value="${sec}"]`);
              if (cb) cb.checked = false;
              syncSystemsFromSector();
              updateTriggerLabels();
              renderDashboard();
            }
          });
        });
      }

      // Chips de ubicación geográfica
      const regions = getCheckedValues('f-region');
      if (regions.length === 1) {
        regions.forEach(reg => {
          const isLima = reg === 'LIMA';
          activeList.push({
            label: `Región: ${isLima ? 'Solo Lima (292)' : 'Solo Regiones (320)'}`,
            clear: () => {
              const cb = document.querySelector(`input[name="f-region"][value="${reg}"]`);
              if (cb) cb.checked = false;
              updateTriggerLabels();
              renderDashboard();
            }
          });
        });
      }

      // Búsqueda
      if (sSearch && sSearch.value.trim() !== '') {
        activeList.push({
          label: `Búsqueda: "${sSearch.value.trim()}"`,
          clear: () => { sSearch.value = ''; renderDashboard(); }
        });
      }

      // Mostrar No respondió
      if (sShowNA && sShowNA.checked) {
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
      if (elBultoSub) elBultoSub.textContent = `${bultoC} de ${total} encuestados`;

      const elPrivado = document.getElementById('kpi-privado');
      if (elPrivado) elPrivado.textContent = total ? (privC / total * 100).toFixed(1) + '%' : '0%';

      const elPrivadoSub = document.getElementById('kpi-privado-sub');
      if (elPrivadoSub) elPrivadoSub.textContent = `${privC} de ${total} encuestados`;

      const elRetraso = document.getElementById('kpi-retraso');
      if (elRetraso) elRetraso.textContent = total ? (retC / total * 100).toFixed(1) + '%' : '0%';

      const elRetrasoSub = document.getElementById('kpi-retraso-sub');
      if (elRetrasoSub) elRetrasoSub.textContent = `${retC} de ${total} encuestados`;
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
          const badgeLabel = isConditional ? condRule.badge : 'Total Encuestados';

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

            <div class="segment-actions">
              <button type="button" id="btn-pub-${q.col}" class="btn-seg btn-public" onclick="toggleSector('${q.col}', 'public')">
                🏢 Ver Sector Público (485)
              </button>
              <button type="button" id="btn-priv-${q.col}" class="btn-seg btn-private" onclick="toggleSector('${q.col}', 'priv')">
                🏥 Ver Sector Privado (127)
              </button>
            </div>

            <!-- DRAWER PÚBLICO -->
            <div class="segment-drawer" id="drawer-pub-${q.col}">
              <div class="segment-layout">
                <div class="seg-left-card">
                  <div>
                    <span class="seg-header-badge badge-pub">🏢 Sector Público (EsSalud, MINSA, FF.AA.)<br><span class="seg-badge-n">(N = 485)</span></span>
                    <div class="seg-chart-wrapper">
                      <canvas id="chart-pub-${q.col}"></canvas>
                    </div>
                  </div>
                  <div class="seg-narrative" id="narr-pub-${q.col}">Cargando análisis...</div>
                </div>
                <div class="seg-right-card">
                  <div class="seg-right-title">
                    <span>Composición del Sector</span>
                    <span>485 Casos</span>
                  </div>
                  <div class="entity-list">
                    <div class="entity-item">
                      <div class="entity-info">
                        <div class="entity-logo-badge logo-essalud">EsS</div>
                        <div>
                          <div class="entity-name">EsSalud</div>
                          <div class="entity-sub">Seguro Social de Salud</div>
                        </div>
                      </div>
                      <div class="entity-data">
                        <div class="entity-n">282</div>
                        <div class="entity-pct">58.1%</div>
                      </div>
                    </div>
                    <div class="entity-item">
                      <div class="entity-info">
                        <div class="entity-logo-badge logo-minsa">MIN</div>
                        <div>
                          <div class="entity-name">MINSA / SIS</div>
                          <div class="entity-sub">Ministerio de Salud</div>
                        </div>
                      </div>
                      <div class="entity-data">
                        <div class="entity-n">182</div>
                        <div class="entity-pct">37.5%</div>
                      </div>
                    </div>
                    <div class="entity-item">
                      <div class="entity-info">
                        <div class="entity-logo-badge logo-ffaa">FFAA</div>
                        <div>
                          <div class="entity-name">Sanidad FF.AA. / PNP</div>
                          <div class="entity-sub">Fuerzas Armadas</div>
                        </div>
                      </div>
                      <div class="entity-data">
                        <div class="entity-n">21</div>
                        <div class="entity-pct">4.3%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- DRAWER PRIVADO -->
            <div class="segment-drawer" id="drawer-priv-${q.col}">
              <div class="segment-layout">
                <div class="seg-left-card">
                  <div>
                    <span class="seg-header-badge badge-priv">🏥 Sector Privado (Seguros, EPS, Particular)<br><span class="seg-badge-n">(N = 127)</span></span>
                    <div class="seg-chart-wrapper">
                      <canvas id="chart-priv-${q.col}"></canvas>
                    </div>
                  </div>
                  <div class="seg-narrative priv" id="narr-priv-${q.col}">Cargando análisis...</div>
                </div>
                <div class="seg-right-card">
                  <div class="seg-right-title">
                    <span>Composición del Sector</span>
                    <span>127 Casos</span>
                  </div>
                  <div class="entity-list">
                    <div class="entity-item">
                      <div class="entity-info">
                        <div class="entity-logo-badge logo-eps">EPS</div>
                        <div>
                          <div class="entity-name">Seguro Privado</div>
                          <div class="entity-sub">Pólizas y Empresas</div>
                        </div>
                      </div>
                      <div class="entity-data">
                        <div class="entity-n">110</div>
                        <div class="entity-pct">86.6%</div>
                      </div>
                    </div>
                    <div class="entity-item">
                      <div class="entity-info">
                        <div class="entity-logo-badge logo-part">PAR</div>
                        <div>
                          <div class="entity-name">Atención Particular</div>
                          <div class="entity-sub">Gasto de Bolsillo Directo</div>
                        </div>
                      </div>
                      <div class="entity-data">
                        <div class="entity-n">17</div>
                        <div class="entity-pct">13.4%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

    
    // Adaptador de lectura normalizada para sector
    function getRecordAnswer(col, r) {
      let val = (col === 'M') ? r.H : r[col];
      return normalizeAnswer(col, val);
    }

    // Conteo y ordenamiento canónico para análisis sectorial
    function getSectorStats(records, col) {
      const counts = {};
      let valid = 0;
      records.forEach(r => {
        const val = getRecordAnswer(col, r);
        counts[val] = (counts[val] || 0) + 1;
        if (val !== 'Sin respuesta' && val !== 'No respondió' && val !== 'No corresponde') valid++;
      });

      const canonicalOrder = QUESTION_CANONICAL_ORDER[col] || null;

      const entries = Object.entries(counts).sort((a, b) => {
        const labelA = a[0];
        const labelB = b[0];

        if (labelA === 'No corresponde') return 1;
        if (labelB === 'No corresponde') return -1;
        if (labelA === 'No respondió' || labelA === 'Sin respuesta') return 1;
        if (labelB === 'No respondió' || labelB === 'Sin respuesta') return -1;
        if (labelA === 'No recuerdo' && labelB !== 'No respondió' && labelB !== 'No corresponde') return 1;
        if (labelB === 'No recuerdo' && labelA !== 'No respondió' && labelA !== 'No corresponde') return -1;

        if (canonicalOrder) {
          const idxA = canonicalOrder.indexOf(labelA);
          const idxB = canonicalOrder.indexOf(labelB);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          if (idxA !== -1) return -1;
          if (idxB !== -1) return 1;
        }

        return b[1] - a[1];
      });

      return {
        total: records.length,
        valid,
        entries
      };
    }

    // Actualización dinámica de la tarjeta de entidades según opción seleccionada
    function updateEntityCard(col, sector, selectedOption) {
      const isPub = (sector === 'public');
      const drawer = document.getElementById((isPub ? 'drawer-pub-' : 'drawer-priv-') + col);
      if (!drawer) return;

      const titleEl = drawer.querySelector('.seg-right-title');
      const listEl = drawer.querySelector('.entity-list');
      if (!titleEl || !listEl) return;

      const sectorRecords = DATA.records.filter(r => isPub ? pubList.includes(r.J) : privList.includes(r.J));
      let targetRecords = sectorRecords;
      let headerTitle = 'Composición del Sector';
      let headerBadge = isPub ? '485 Casos' : '127 Casos';

      if (selectedOption) {
        targetRecords = sectorRecords.filter(r => getRecordAnswer(col, r) === selectedOption);
        const optDisplay = selectedOption.length > 20 ? selectedOption.substring(0, 18) + '…' : selectedOption;
        headerTitle = 'Detalle: "' + optDisplay + '"';
        headerBadge = targetRecords.length + ' Casos';
      }

      titleEl.innerHTML = '<span>' + headerTitle + '</span><span style="background:' + (selectedOption ? '#fef3c7; color:#92400e; padding:0.15rem 0.5rem; border-radius:4px; font-size:0.75rem;' : '') + '">' + headerBadge + '</span>';

      const totalBase = targetRecords.length;

      if (isPub) {
        const cEssalud = targetRecords.filter(r => r.J === 'EsSalud').length;
        const cMinsa = targetRecords.filter(r => r.J === 'Minsa').length;
        const cFFAA = targetRecords.filter(r => r.J === 'FFAA').length;

        const pEssalud = totalBase ? ((cEssalud / totalBase) * 100).toFixed(1) : '0.0';
        const pMinsa = totalBase ? ((cMinsa / totalBase) * 100).toFixed(1) : '0.0';
        const pFFAA = totalBase ? ((cFFAA / totalBase) * 100).toFixed(1) : '0.0';

        listEl.innerHTML = 
          '<div class="entity-item">' +
            '<div class="entity-info">' +
              '<div class="entity-logo-badge logo-essalud">EsS</div>' +
              '<div><div class="entity-name">EsSalud</div><div class="entity-sub">Seguro Social</div></div>' +
            '</div>' +
            '<div class="entity-data"><div class="entity-n">' + cEssalud + '</div><div class="entity-pct">' + pEssalud + '%</div></div>' +
          '</div>' +
          '<div class="entity-item">' +
            '<div class="entity-info">' +
              '<div class="entity-logo-badge logo-minsa">MIN</div>' +
              '<div><div class="entity-name">MINSA / SIS</div><div class="entity-sub">Ministerio de Salud</div></div>' +
            '</div>' +
            '<div class="entity-data"><div class="entity-n">' + cMinsa + '</div><div class="entity-pct">' + pMinsa + '%</div></div>' +
          '</div>' +
          '<div class="entity-item">' +
            '<div class="entity-info">' +
              '<div class="entity-logo-badge logo-ffaa">FFAA</div>' +
              '<div><div class="entity-name">FF.AA. / PNP</div><div class="entity-sub">Fuerzas Armadas</div></div>' +
            '</div>' +
            '<div class="entity-data"><div class="entity-n">' + cFFAA + '</div><div class="entity-pct">' + pFFAA + '%</div></div>' +
          '</div>';
      } else {
        const cPriv = targetRecords.filter(r => r.J === 'Seguro Privado').length;
        const cPart = targetRecords.filter(r => r.J === 'Particular').length;

        const pPriv = totalBase ? ((cPriv / totalBase) * 100).toFixed(1) : '0.0';
        const pPart = totalBase ? ((cPart / totalBase) * 100).toFixed(1) : '0.0';

        listEl.innerHTML = 
          '<div class="entity-item">' +
            '<div class="entity-info">' +
              '<div class="entity-logo-badge logo-eps">EPS</div>' +
              '<div><div class="entity-name">Seguro Privado</div><div class="entity-sub">Pólizas y Empresas</div></div>' +
            '</div>' +
            '<div class="entity-data"><div class="entity-n">' + cPriv + '</div><div class="entity-pct">' + pPriv + '%</div></div>' +
          '</div>' +
          '<div class="entity-item">' +
            '<div class="entity-info">' +
              '<div class="entity-logo-badge logo-part">PAR</div>' +
              '<div><div class="entity-name">Atención Particular</div><div class="entity-sub">Gasto Directo</div></div>' +
            '</div>' +
            '<div class="entity-data"><div class="entity-n">' + cPart + '</div><div class="entity-pct">' + pPart + '%</div></div>' +
          '</div>';
      }
    }

    // Renderizado del contenido y gráfico apilado del sector
    function renderSectorContent(col, sector) {
      const isPub = (sector === 'public');
      const chartId = (isPub ? 'chart-pub-' : 'chart-priv-') + col;
      const narrId = (isPub ? 'narr-pub-' : 'narr-priv-') + col;

      const sectorRecords = DATA.records.filter(r => isPub ? pubList.includes(r.J) : privList.includes(r.J));
      const stats = getSectorStats(sectorRecords, col);
      const validEntries = stats.entries.filter(e => e[0] !== 'Sin respuesta' && e[0] !== 'No corresponde');

      updateEntityCard(col, sector, null);

      const narrEl = document.getElementById(narrId);
      if (narrEl) {
        const customAnalysis = SECTOR_ANALYSIS[col];
        if (customAnalysis) {
          narrEl.innerHTML = isPub ? customAnalysis.pub : customAnalysis.priv;
        } else if (validEntries.length > 0) {
          const top1 = validEntries[0];
          const top1Pct = ((top1[1] / stats.total) * 100).toFixed(1);
          narrEl.innerHTML = 'En el sector ' + (isPub ? 'público' : 'privado') + ', la opción más frecuente fue <strong>' + top1[0] + '</strong> con ' + top1[1] + ' casos (' + top1Pct + '%).';
        }
      }

      const chartKey = 'sec-' + chartId;
      if (charts[chartKey]) {
        charts[chartKey].destroy();
        delete charts[chartKey];
      }

      const ctx = document.getElementById(chartId);
      if (!ctx) return;

      const labels = validEntries.map(e => e[0]);

      let stackedDatasets = [];
      if (isPub) {
        const dEssalud = labels.map(l => sectorRecords.filter(r => r.J === 'EsSalud' && getRecordAnswer(col, r) === l).length);
        const dMinsa = labels.map(l => sectorRecords.filter(r => r.J === 'Minsa' && getRecordAnswer(col, r) === l).length);
        const dFFAA = labels.map(l => sectorRecords.filter(r => r.J === 'FFAA' && getRecordAnswer(col, r) === l).length);

        stackedDatasets = [
          {
            label: 'EsSalud',
            data: dEssalud,
            backgroundColor: '#e596b2',
            borderRadius: { topLeft: 4, bottomLeft: 4 },
            barPercentage: 0.72
          },
          {
            label: 'MINSA / SIS',
            data: dMinsa,
            backgroundColor: '#e66f95',
            barPercentage: 0.72
          },
          {
            label: 'FF.AA. / PNP',
            data: dFFAA,
            backgroundColor: '#656261',
            borderRadius: { topRight: 4, bottomRight: 4 },
            barPercentage: 0.72
          }
        ];
      } else {
        const dPrivado = labels.map(l => sectorRecords.filter(r => r.J === 'Seguro Privado' && getRecordAnswer(col, r) === l).length);
        const dParticular = labels.map(l => sectorRecords.filter(r => r.J === 'Particular' && getRecordAnswer(col, r) === l).length);

        stackedDatasets = [
          {
            label: 'Seguro Privado',
            data: dPrivado,
            backgroundColor: '#7359a0',
            borderRadius: { topLeft: 4, bottomLeft: 4 },
            barPercentage: 0.72
          },
          {
            label: 'Atención Particular',
            data: dParticular,
            backgroundColor: '#aea2d0',
            borderRadius: { topRight: 4, bottomRight: 4 },
            barPercentage: 0.72
          }
        ];
      }

      charts[chartKey] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: stackedDatasets
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          onClick: function(evt, elements) {
            if (elements && elements.length > 0) {
              const clickedIdx = elements[0].index;
              const selectedOpt = labels[clickedIdx];
              updateEntityCard(col, sector, selectedOpt);
            } else {
              updateEntityCard(col, sector, null);
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                useBorderRadius: true,
                borderRadius: 3,
                font: { family: 'Inter', size: 11, weight: '600' },
                padding: 12
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: function(items) {
                  return items[0].label;
                },
                label: function(c) {
                  const val = c.raw;
                  return ' ' + c.dataset.label + ': ' + val + ' casos';
                },
                footer: function(items) {
                  let sum = 0;
                  items.forEach(i => sum += i.raw);
                  const pct = ((sum / stats.total) * 100).toFixed(1);
                  return 'Total respuesta: ' + sum + ' personas (' + pct + '% del sector)';
                }
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              grid: { color: '#f1f5f9' },
              ticks: { precision: 0 }
            },
            y: {
              stacked: true,
              grid: { display: false }
            }
          }
        }
      });
    }

    // Toggle de acordeón / drawer
    function toggleSector(col, sector) {
      const drawerPub = document.getElementById('drawer-pub-' + col);
      const drawerPriv = document.getElementById('drawer-priv-' + col);
      const btnPub = document.getElementById('btn-pub-' + col);
      const btnPriv = document.getElementById('btn-priv-' + col);

      const isPub = (sector === 'public');
      const targetDrawer = isPub ? drawerPub : drawerPriv;
      const otherDrawer = isPub ? drawerPriv : drawerPub;
      const targetBtn = isPub ? btnPub : btnPriv;
      const otherBtn = isPub ? btnPriv : btnPub;

      if (!targetDrawer) return;

      if (otherDrawer) otherDrawer.classList.remove('is-open');
      if (otherBtn) otherBtn.classList.remove('active');

      const willOpen = !targetDrawer.classList.contains('is-open');
      targetDrawer.classList.toggle('is-open', willOpen);
      if (targetBtn) {
        targetBtn.classList.toggle('active', willOpen);
      }

      if (willOpen) {
        renderSectorContent(col, sector);
      }
    }
    window.toggleSector = toggleSector;

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
      document.querySelectorAll('.obs-ms-option input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
      });
      const sSearch = document.getElementById('f-search');
      const sShowNA = document.getElementById('f-show-na');
      if (sSearch) sSearch.value = '';
      if (sShowNA) sShowNA.checked = false;

      updateTriggerLabels();
      renderDashboard();
    }

    function setupMultiselectHandlers() {
      // Toggle dropdown open/close on trigger button click
      document.querySelectorAll('.obs-ms-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const parent = btn.closest('.obs-multiselect');
          if (!parent) return;
          const wasOpen = parent.classList.contains('is-open');

          // Cerrar otros dropdowns abiertos
          document.querySelectorAll('.obs-multiselect.is-open').forEach(el => {
            el.classList.remove('is-open');
            const b = el.querySelector('.obs-ms-trigger');
            if (b) b.setAttribute('aria-expanded', 'false');
          });

          if (!wasOpen) {
            parent.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
          }
        });
      });

      // Cerrar dropdown al hacer clic fuera
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.obs-multiselect')) {
          document.querySelectorAll('.obs-multiselect.is-open').forEach(el => {
            el.classList.remove('is-open');
            const b = el.querySelector('.obs-ms-trigger');
            if (b) b.setAttribute('aria-expanded', 'false');
          });
        }
      });

      // Botones de acción "Todos" y "Limpiar" en cada dropdown
      document.querySelectorAll('.obs-ms-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          const target = btn.dataset.target;
          const checkboxes = document.querySelectorAll(`input[name="${target}"]`);

          checkboxes.forEach(cb => {
            cb.checked = (action === 'all');
          });

          if (target === 'f-sector') {
            syncSystemsFromSector();
          } else if (target === 'f-system') {
            syncSectorFromSystems();
          }

          updateTriggerLabels();
          renderDashboard();
        });
      });

      // Checkboxes individuales
      document.querySelectorAll('.obs-ms-option input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.name === 'f-sector') {
            syncSystemsFromSector();
          } else if (cb.name === 'f-system') {
            syncSectorFromSystems();
          }

          updateTriggerLabels();
          renderDashboard();
        });
      });
    }

    function initObservatorioMetrics() {
      if (!document.getElementById('questions-root')) return;

      setupMultiselectHandlers();
      updateTriggerLabels();

      const showNA = document.getElementById('f-show-na');
      if (showNA) showNA.addEventListener('change', renderDashboard);

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


