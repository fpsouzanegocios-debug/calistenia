import { exercises, getExerciseById } from './exercises';

export const programWeeks = {
  week1: {
    week: 1,
    name: "Semana 1 — Adaptación",
    description: "Aprender los movimientos y crear el hábito",
    duration: 22,
    exerciseTime: 30,
    restTime: 15,
    setsPerExercise: 3,
    circuits: 3,
    exercises: [
      "circulos-braco",
      "torcao-ritmica",
      "agachamento-templo",
      "afundo-crescente-esquerdo",
      "afundo-crescente-direito",
      "elevacao-pelvica",
      "abdominal-bicicleta",
      "elevacao-perna-bambu",
      "prancha-lotus",
      "flexao-parede"
    ],
    tip: "Ritmo cómodo, fluido, sin prisas."
  },
  week2: {
    week: 2,
    name: "Semana 2 — Activación",
    description: "Aumentar el gasto calórico y la firmeza",
    duration: 25,
    exerciseTime: 30,
    restTime: 15,
    setsPerExercise: 3,
    circuits: 3,
    exercises: [
      "circulos-braco",
      "polichinelo-leque",
      "agachamento-lateral",
      "afundo-crescente-esquerdo",
      "afundo-crescente-direito",
      "elevacao-pelvica",
      "abdominal-bicicleta",
      "elevacao-perna-bambu",
      "prancha-lotus",
      "chute-traseiro",
      "flexao-parede"
    ],
    tip: "Ritmo continuo, respiración controlada."
  },
  week3: {
    week: 3,
    name: "Semana 3 — Intensificación",
    description: "Acelerar la pérdida de grasa y definición",
    duration: 25,
    exerciseTime: 30,
    restTime: 15,
    setsPerExercise: 3,
    circuits: 3,
    exercises: [
      "polichinelo-leque",
      "agachamento-templo",
      "afundo-crescente-esquerdo",
      "afundo-crescente-direito",
      "agachamento-lateral",
      "joelhos-altos",
      "abdominal-bicicleta",
      "elevacao-perna-bambu",
      "prancha-lotus",
      "elevacao-pelvica",
      "triceps-banco",
      "flexao-parede"
    ],
    blocks: [
      {
        name: "Bloque 1 - Inferiores + Cardio",
        exercises: [
          "polichinelo-leque",
          "agachamento-templo",
          "afundo-crescente-esquerdo",
          "afundo-crescente-direito",
          "agachamento-lateral",
          "joelhos-altos"
        ]
      },
      {
        name: "Bloque 2 - Core + Brazos",
        exercises: [
          "abdominal-bicicleta",
          "elevacao-perna-bambu",
          "prancha-lotus",
          "elevacao-pelvica",
          "triceps-banco",
          "flexao-parede"
        ]
      }
    ],
    tip: "¡Mantén la intensidad alta!"
  }
};

export function getWorkoutForDay(dayNumber) {
  const day = Math.max(1, Math.min(21, parseInt(dayNumber, 10) || 1));
  if (day <= 7) {
    return {
      day,
      ...programWeeks.week1,
      exercises: programWeeks.week1.exercises
    };
  }
  if (day <= 14) {
    return {
      day,
      ...programWeeks.week2,
      exercises: programWeeks.week2.exercises
    };
  }
  const blockExercises = programWeeks.week3.blocks.flatMap(b => b.exercises);
  return {
    day,
    ...programWeeks.week3,
    exercises: blockExercises
  };
}

export const extraCardio = [
  {
    id: "caminhada",
    name: "Caminata",
    duration: "30 a 60 minutos",
    icon: "🚶",
    calories: "150-300 kcal",
    description: "Excelente para quema de grasa constante y bajo impacto articular."
  },
  {
    id: "bicicleta",
    name: "Bicicleta",
    duration: "30 a 60 minutos",
    icon: "🚴",
    calories: "200-400 kcal",
    description: "Fortalece piernas y mejora la resistencia cardiovascular."
  },
  {
    id: "corrida",
    name: "Trote Ligero",
    duration: "20 a 40 minutos",
    icon: "🏃",
    calories: "200-350 kcal",
    description: "Cardio dinámico para acelerar el metabolismo post-entrenamiento."
  }
];

export const philosophy = [
  {
    title: "Pocos Ejercicios",
    description: "Menos es más. Dominamos pocos movimientos con perfección para construir fuerza real y control corporal."
  },
  {
    title: "Repetición Inteligente",
    description: "La repetición crea maestría y resultados duraderos, fortaleciendo tendones y ligamentos de forma segura."
  },
  {
    title: "Ritmo Fluido",
    description: "Movimientos suaves como el agua, sin pausas bruscas, generando tensión muscular continua."
  },
  {
    title: "Cero Impacto Agresivo",
    description: "Protegemos tus articulaciones mientras quemamos calorías y tonificamos los músculos."
  },
  {
    title: "Constancia > Intensidad",
    description: "Entrenar 15 a 25 minutos todos los días supera cualquier entrenamiento agotador esporádico."
  }
];

export const motivationalQuotes = [
  "¡Cada día es un nuevo logro! 🌸",
  "¡Estás más fuerte en cada entrenamiento! 💪",
  "¡La constancia transforma vidas! ✨",
  "¡Tu cuerpo agradece cada movimiento! 🌿",
  "¡Hoy es día de evolucionar! 🦋"
];
