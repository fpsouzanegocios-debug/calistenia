// Catálogo completo de los 16 movimientos de Calistenia
export const exercises = [
  {
    id: "prancha-lotus",
    name: "Plancha Loto",
    description: "Plancha con posición de piernas cruzadas, fortaleciendo el core con estabilidad.",
    muscleGroups: ["Core", "Abdomen"],
    difficulty: "Principiante",
    videoUrl: "/videos/Prancha_Lotus.mp4"
  },
  {
    id: "torcao-ritmica",
    name: "Torsión Rítmica de Pie",
    description: "Rotación suave del tronco de pie, activando la cintura y mejorando la movilidad.",
    muscleGroups: ["Oblicuos", "Core"],
    difficulty: "Principiante",
    videoUrl: "/videos/Torcao_Ritmica_em_Pe.mp4"
  },
  {
    id: "abdominal-bicicleta",
    name: "Abdominal Bicicleta Fluido",
    description: "Movimiento alternado de piernas con rotación del tronco, trabajando todo el abdomen.",
    muscleGroups: ["Abdomen", "Oblicuos"],
    difficulty: "Principiante",
    videoUrl: "/videos/Abdominal_Bicicleta_Fluido.mp4"
  },
  {
    id: "elevacao-perna-bambu",
    name: "Elevación de Pierna Bambú",
    description: "Elevación lateral de pierna con control, fortaleciendo glúteos y muslos.",
    muscleGroups: ["Glúteos", "Muslos"],
    difficulty: "Principiante",
    videoUrl: "/videos/Elevacao_de_Perna_Bambu.mp4"
  },
  {
    id: "agachamento-templo",
    name: "Sentadilla Templo",
    description: "Sentadilla profunda con postura erguida, fortaleciendo piernas y glúteos.",
    muscleGroups: ["Cuádriceps", "Glúteos"],
    difficulty: "Principiante",
    videoUrl: "/videos/Agachamento_Templo.mp4"
  },
  {
    id: "afundo-crescente-esquerdo",
    name: "Zancada Creciente (Izquierda)",
    description: "Zancada con movimiento fluido en el lado izquierdo, trabajando fuerza y equilibrio.",
    muscleGroups: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    difficulty: "Principiante",
    videoUrl: "/videos/Afundo_Crescente.mp4"
  },
  {
    id: "afundo-crescente-direito",
    name: "Zancada Creciente (Derecha)",
    description: "Zancada con movimiento fluido en el lado derecho, trabajando fuerza y equilibrio.",
    muscleGroups: ["Cuádriceps", "Glúteos", "Isquiotibiales"],
    difficulty: "Principiante",
    videoUrl: "/videos/Afundo_Lado_Direito.mp4"
  },
  {
    id: "elevacao-pelvica",
    name: "Elevación Pélvica Fluida",
    description: "Puente de cadera con movimiento controlado, activando glúteos y zona lumbar.",
    muscleGroups: ["Glúteos", "Lumbar"],
    difficulty: "Principiante",
    videoUrl: "/videos/Elevacao_Pelvica_Fluida.mp4"
  },
  {
    id: "agachamento-lateral",
    name: "Sentadilla Lateral Deslizante",
    description: "Sentadilla con desplazamiento lateral, trabajando aductores y glúteos.",
    muscleGroups: ["Aductores", "Glúteos", "Cuádriceps"],
    difficulty: "Intermedio",
    videoUrl: "/videos/Agachamento_Lateral_Deslizante.mp4"
  },
  {
    id: "joelhos-altos",
    name: "Rodillas Altas Ligeras",
    description: "Elevación alternada de rodillas con ritmo moderado, calentando el cuerpo.",
    muscleGroups: ["Cardio", "Core"],
    difficulty: "Principiante",
    videoUrl: "/videos/Joelhos_Altos_Leves.mp4"
  },
  {
    id: "polichinelo-leque",
    name: "Polichinela Abanico",
    description: "Polichinela suave con apertura de brazos en abanico, cardio de bajo impacto.",
    muscleGroups: ["Cardio", "Hombros"],
    difficulty: "Principiante",
    videoUrl: "/videos/Polichinelo_Leque.mp4"
  },
  {
    id: "chute-traseiro",
    name: "Patada Trasera Rítmica",
    description: "Patada hacia atrás con ritmo, activando glúteos y parte posterior del muslo.",
    muscleGroups: ["Glúteos", "Isquiotibiales"],
    difficulty: "Principiante",
    videoUrl: "/videos/Chute_Traseiro_Ritmico.mp4"
  },
  {
    id: "circulos-braco",
    name: "Círculos de Brazo Garza",
    description: "Movimientos circulares suaves de brazos, calentando hombros y mejorando la movilidad.",
    muscleGroups: ["Hombros", "Brazos"],
    difficulty: "Principiante",
    videoUrl: "/videos/Circulos_de_Braco_Garca.mp4"
  },
  {
    id: "flexao-parede",
    name: "Flexión de Pared Fluida",
    description: "Flexión apoyada en la pared, fortaleciendo pecho y brazos de forma segura.",
    muscleGroups: ["Pecho", "Tríceps"],
    difficulty: "Principiante",
    videoUrl: "/videos/Flexao_de_Parede.mp4"
  },
  {
    id: "triceps-banco",
    name: "Tríceps en Banco/Silla",
    description: "Fondos de tríceps apoyados, definiendo la parte posterior de los brazos.",
    muscleGroups: ["Tríceps"],
    difficulty: "Intermedio",
    videoUrl: "/videos/Triceps_no_Banco.mp4"
  },
  {
    id: "escalador-prancha",
    name: "Escalador en Plancha Baja",
    description: "Mountain climber en posición de plancha, cardio intenso con trabajo de core.",
    muscleGroups: ["Core", "Cardio"],
    difficulty: "Intermedio",
    videoUrl: "/videos/Escalador_em_Prancha_Baixa.mp4"
  }
];

export function getExerciseById(id) {
  return exercises.find(ex => ex.id === id) || null;
}

export const muscleGroupFilters = [
  'Todos',
  'Core',
  'Abdomen',
  'Oblicuos',
  'Hombros',
  'Brazos',
  'Pecho',
  'Tríceps',
  'Cuádriceps',
  'Glúteos',
  'Muslos',
  'Cardio'
];
