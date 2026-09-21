export const bonusList = [
  {
    id: "alongamento",
    slug: "alongamento",
    title: "Guía de Estiramiento",
    description: "Rutina completa de 10 minutos para antes y después del entrenamiento",
    icon: "🧘"
  },
  {
    id: "detox",
    slug: "detox",
    title: "Recetas Detox",
    description: "Jugos e infusiones para acelerar el metabolismo",
    icon: "🍵"
  },
  {
    id: "meditacao",
    slug: "meditacao",
    title: "Meditación Guiada",
    description: "Práctica de 5 minutos para relajación y enfoque",
    icon: "🧠"
  },
  {
    id: "sono",
    slug: "sono",
    title: "Guía de Sueño",
    description: "Consejos para mejorar la calidad del sueño y la recuperación",
    icon: "😴"
  },
  {
    id: "express",
    slug: "express",
    title: "Entrenamiento Express",
    description: "Entrenamiento de 5 minutos para días con poco tiempo",
    icon: "⚡"
  },
  {
    id: "manutencao",
    slug: "manutencao",
    title: "Plan de Mantenimiento",
    description: "Cómo mantener los resultados después de los 21 días",
    icon: "🏆"
  }
];

export const bonusDetails = {
  alongamento: {
    title: "Guía de Estiramiento",
    icon: "🧘",
    description: "Rutina completa de 10 minutos para antes y después del entrenamiento",
    sections: [
      {
        title: "¿Por qué estirar?",
        content: "El estiramiento aumenta la flexibilidad, mejora la circulación sanguínea, reduce el riesgo de lesiones y ayuda en la recuperación muscular. Dedica 5 minutos antes y 5 minutos después de cada entrenamiento."
      },
      {
        title: "Estiramiento Pre-Entrenamiento (5 min)",
        content: `• Rotación de cuello: 30 segundos cada lado
• Rotación de hombros: 30 segundos
• Estiramiento de brazos cruzados: 20 segundos cada uno
• Rotación de cadera: 30 segundos cada lado
• Estiramiento de pantorrillas: 20 segundos cada una
• Sentadilla suave: 10 repeticiones`
      },
      {
        title: "Estiramiento Post-Entrenamiento (5 min)",
        content: `• Estiramiento de isquiotibiales: 30 segundos cada pierna
• Estiramiento de cuádriceps: 30 segundos cada pierna
• Mariposa sentada: 45 segundos
• Cobra (extensión lumbar): 30 segundos
• Postura del niño: 45 segundos
• Respiración profunda: 1 minuto`
      },
      {
        title: "Consejos Importantes",
        content: `• Nunca fuerces el estiramiento hasta sentir dolor
• Respira profundamente durante cada posición
• Mantén cada estiramiento durante al menos 20 segundos
• Estira en un ambiente cómodo
• Hidrátate antes y después`
      }
    ]
  },
  detox: {
    title: "Recetas Detox",
    icon: "🍵",
    description: "Jugos e infusiones para acelerar el metabolismo",
    sections: [
      {
        title: "Jugo Verde Energizante",
        content: `• 1 hoja de col o espinaca
• 1/2 pepino
• 1 manzana verde
• Jugo de 1 limón
• 200ml de agua de coco
• Hielo al gusto

Licúa todo y bebe en ayunas por la mañana.`
      },
      {
        title: "Té Termogénico",
        content: `• 1 litro de agua
• 1 rama de canela
• 3 rodajas de jengibre
• Cáscara de 1/2 limón
• 1 cucharadita de miel (opcional)

Hierve el agua con los ingredientes durante 10 minutos. Cuela y bebe a lo largo del día.`
      },
      {
        title: "Agua Detox de Frutas",
        content: `• 1 litro de agua
• 5 fresas cortadas
• 1/2 limón en rodajas
• Hojas de menta
• Hielo

Mezcla todo y déjalo en el refrigerador durante 2 horas antes de consumir.`
      },
      {
        title: "Smoothie Post-Entrenamiento",
        content: `• 1 plátano congelado
• 200ml de leche vegetal
• 1 cucharada de avena
• 1 cucharada de crema de maní
• Canela al gusto

Licúa hasta que quede cremoso. Ideal para consumir hasta 30 minutos después del entrenamiento.`
      }
    ]
  },
  meditacao: {
    title: "Meditación Guiada",
    icon: "🧠",
    description: "Práctica de 5 minutos para relajación y enfoque",
    sections: [
      {
        title: "Preparación",
        content: "Encuentra un lugar tranquilo y siéntate cómodamente. Puede ser en una silla con los pies en el suelo o en posición de loto. Cierra suavemente los ojos y relaja los hombros."
      },
      {
        title: "Minuto 1: Consciencia Corporal",
        content: "Respira profundamente por la nariz. Siente tu cuerpo relajarse con cada exhalación. Observa las tensiones y déjalas ir. Siente los pies en el suelo, las manos descansando y la columna alineada."
      },
      {
        title: "Minutos 2-3: Respiración 4-7-8",
        content: `• Inhala por la nariz contando hasta 4
• Sostén la respiración contando hasta 7
• Exhala por la boca contando hasta 8

Repite este ciclo 4 veces. Esta técnica activa el sistema nervioso parasimpático y promueve una relajación profunda.`
      },
      {
        title: "Minuto 4: Visualización",
        content: "Imagina una luz dorada entrando por la coronilla. Con cada inhalación, esa luz se expande, llenando todo tu cuerpo con energía positiva, tranquilidad y calma."
      },
      {
        title: "Minuto 5: Gratitud",
        content: "Piensa en 3 cosas por las que estés agradecida hoy. Puede ser algo simple como un té caliente o un abrazo. Siente la gratitud en tu corazón. Lentamente, abre los ojos y sonríe."
      }
    ]
  },
  sono: {
    title: "Guía de Sueño",
    icon: "😴",
    description: "Consejos para mejorar la calidad del sueño y la recuperación",
    sections: [
      {
        title: "¿Por qué el sueño es crucial?",
        content: "Durante el sueño, tu cuerpo repara los músculos, consolida recuerdos y regula hormonas esenciales para la salud. Una buena noche de sueño potencia los resultados del entrenamiento hasta en un 40%."
      },
      {
        title: "Rutina Pre-Sueño",
        content: `• Apaga pantallas 1 hora antes de dormir
• Toma una ducha tibia relajante
• Practica la meditación guiada del programa
• Mantén la habitación oscura y fresca (18-22°C)
• Utiliza sonidos relajantes o silencio total`
      },
      {
        title: "Alimentos que Ayudan",
        content: `• Té de manzanilla o toronjil
• Plátano (rico en magnesio)
• Frutos secos (contienen melatonina natural)
• Leche tibia con miel

Evita: cafeína después de las 14h, alcohol y cenas pesadas`
      },
      {
        title: "Horarios Ideales",
        content: `• Duerme entre 22h y 23h
• Despierta a la misma hora todos los días
• Busca entre 7 y 8 horas de sueño por noche
• Evita siestas después de las 15h
• Exponte a la luz natural por la mañana`
      },
      {
        title: "Técnica de Relajación",
        content: `Acuéstate y tensa cada grupo muscular durante 5 segundos, luego relaja:

1. Pies y pantorrillas
2. Muslos y glúteos
3. Abdomen y zona lumbar
4. Pecho y hombros
5. Brazos y manos
6. Cuello y rostro

Respira profundamente entre cada grupo.`
      }
    ]
  },
  express: {
    title: "Entrenamiento Express",
    icon: "⚡",
    description: "Entrenamiento de 5 minutos para días con poco tiempo",
    sections: [
      {
        title: "¿Cuándo usarlo?",
        content: "Usa este entrenamiento express cuando no tengas tiempo para la rutina completa. ¡Es mucho mejor hacer 5 minutos que nada! Ideal para mañanas ocupadas, viajes o días de mucho trabajo."
      },
      {
        title: "Calentamiento (30 seg)",
        content: "Marcha en el lugar elevando las rodillas y balanceando los brazos. Aumenta gradualmente la intensidad."
      },
      {
        title: "Circuito Principal (4 min)",
        content: `Realiza cada ejercicio durante 40 segundos, descansa 10 segundos:

1. Polichinelas
2. Sentadillas
3. Plancha
4. Elevación de rodillas
5. Zancadas alternadas

¡Repite si tienes tiempo extra!`
      },
      {
        title: "Finalización (30 seg)",
        content: "Respiración profunda y estiramiento ligero de brazos y piernas. ¡Bebe agua y sigue tu día con energía!"
      },
      {
        title: "Consejos",
        content: `• Mantén la intensidad alta
• Enfócate en la técnica correcta, no en la velocidad
• Usa ropa cómoda
• Puedes realizarlo en cualquier lugar
• Combínalo con la rutina completa los demás días`
      }
    ]
  },
  manutencao: {
    title: "Plan de Mantenimiento",
    icon: "🏆",
    description: "Cómo mantener los resultados después de los 21 días",
    sections: [
      {
        title: "¡Felicitaciones!",
        content: "¡Has completado el programa de 21 días! Ahora es momento de consolidar los resultados alcanzados. Este plan te guiará para seguir evolucionando con constancia."
      },
      {
        title: "Frecuencia de Entrenamiento",
        content: `• Semanas 1-4: Repite el programa completo
• Después de 1 mes: 3-4 entrenamientos por semana
• Alterna entre días de entrenamiento y descanso
• Incluye actividades extras como caminatas
• Escucha a tu cuerpo y descansa cuando lo necesites`
      },
      {
        title: "Progresión",
        content: `Cada semana, intenta:

• Aumentar 5 segundos en cada ejercicio
• Reducir 5 segundos de descanso
• Agregar una repetición extra
• Incluir variaciones más desafiantes`
      },
      {
        title: "Alimentación",
        content: `• Mantén la dieta equilibrada del programa
• 80% del tiempo saludable, 20% flexible
• Continúa hidratándote abundantemente
• Incluye proteína en todas las comidas
• Consume vegetales coloridos diariamente`
      },
      {
        title: "Mentalidad",
        content: `• Celebra cada pequeña victoria
• Toma fotos mensuales para comparar
• Establece nuevas metas
• Encuentra una compañera de entrenamiento
• Recuerda: consistencia > intensidad`
      },
      {
        title: "Próximos Pasos",
        content: `Considera:

• Aprender movimientos más avanzados
• Experimentar nuevos deportes
• Participar en grupos de entrenamiento
• Compartir tu proceso para inspirar a otros
• Repetir el programa con mayor intensidad`
      }
    ]
  }
};
