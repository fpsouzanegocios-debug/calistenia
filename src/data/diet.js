// Restricciones alimentarias
export const dietaryRestrictions = [
  { id: "vegetariano", label: "Vegetariano" },
  { id: "vegano", label: "Vegano" },
  { id: "sem-gluten", label: "Sin Gluten" },
  { id: "sem-lactose", label: "Sin Lactosa" },
  { id: "low-carb", label: "Low Carb" },
  { id: "diabetico", label: "Diabético" }
];

// Grupos de alimentos seleccionables
export const foodGroups = [
  {
    id: "carnes",
    name: "Carnes y Pescados",
    icon: "🥩",
    items: [
      { id: "frango", label: "Pollo" },
      { id: "carne-bovina", label: "Carne de Res" },
      { id: "carne-suina", label: "Carne de Cerdo" },
      { id: "peixe", label: "Pescado" },
      { id: "camarao", label: "Camarón" },
      { id: "peru", label: "Pavo" },
      { id: "pato", label: "Pato" },
      { id: "cordeiro", label: "Cordero" }
    ]
  },
  {
    id: "ovos-laticinios",
    name: "Huevos y Lácteos",
    icon: "🥚",
    items: [
      { id: "ovos", label: "Huevos" },
      { id: "leite", label: "Leche" },
      { id: "queijo", label: "Queso" },
      { id: "iogurte", label: "Yogur" },
      { id: "manteiga", label: "Mantequilla" },
      { id: "requeijao", label: "Queso Crema" }
    ]
  },
  {
    id: "leguminosas",
    name: "Legumbres",
    icon: "🫘",
    items: [
      { id: "feijao-preto", label: "Frijol Negro" },
      { id: "feijao-carioca", label: "Frijol Rojo / Pinto" },
      { id: "lentilha", label: "Lentejas" },
      { id: "grao-de-bico", label: "Garbanzos" },
      { id: "ervilha", label: "Guisantes" },
      { id: "soja", label: "Soya" },
      { id: "fava", label: "Habas" }
    ]
  },
  {
    id: "cereais-graos",
    name: "Cereales y Granos",
    icon: "🌾",
    items: [
      { id: "arroz-branco", label: "Arroz Blanco" },
      { id: "arroz-integral", label: "Arroz Integral" },
      { id: "aveia", label: "Avena" },
      { id: "quinoa", label: "Quinua" },
      { id: "milho", label: "Maíz" },
      { id: "trigo", label: "Trigo" },
      { id: "cevada", label: "Cebada" },
      { id: "centeio", label: "Centeno" }
    ]
  },
  {
    id: "legumes-verduras",
    name: "Verduras y Hortalizas",
    icon: "🥬",
    items: [
      { id: "alface", label: "Lechuga" },
      { id: "rucula", label: "Rúcula" },
      { id: "espinafre", label: "Espinaca" },
      { id: "couve", label: "Col rizada" },
      { id: "brocolis", label: "Brócoli" },
      { id: "couve-flor", label: "Coliflor" },
      { id: "cenoura", label: "Zanahoria" },
      { id: "beterraba", label: "Remolacha" },
      { id: "tomate", label: "Tomate" },
      { id: "pepino", label: "Pepino" },
      { id: "abobrinha", label: "Calabacín" },
      { id: "berinjela", label: "Berenjena" },
      { id: "pimentao", label: "Pimiento" },
      { id: "cebola", label: "Cebolla" },
      { id: "alho", label: "Ajo" }
    ]
  },
  {
    id: "frutas",
    name: "Frutas",
    icon: "🍎",
    items: [
      { id: "banana", label: "Plátano" },
      { id: "maca", label: "Manzana" },
      { id: "laranja", label: "Naranja" },
      { id: "limao", label: "Limón" },
      { id: "morango", label: "Fresa" },
      { id: "uva", label: "Uva" },
      { id: "manga", label: "Mango" },
      { id: "abacaxi", label: "Piña" },
      { id: "melancia", label: "Sandía" },
      { id: "melao", label: "Melón" },
      { id: "mamao", label: "Papaya" },
      { id: "pera", label: "Pera" },
      { id: "kiwi", label: "Kiwi" },
      { id: "abacate", label: "Aguacate" },
      { id: "goiaba", label: "Guayaba" },
      { id: "acerola", label: "Acerola" }
    ]
  },
  {
    id: "oleaginosas",
    name: "Frutos Secos y Semillas",
    icon: "🥜",
    items: [
      { id: "castanha-para", label: "Nuez de Brasil" },
      { id: "castanha-caju", label: "Anacardos" },
      { id: "amendoim", label: "Maní" },
      { id: "amêndoas", label: "Almendras" },
      { id: "nozes", label: "Nueces" },
      { id: "pistache", label: "Pistacho" }
    ]
  },
  {
    id: "tuberculos",
    name: "Tubérculos",
    icon: "🥔",
    items: [
      { id: "batata-inglesa", label: "Papa Blanca" },
      { id: "batata-doce", label: "Camote / Batata Dulce" },
      { id: "mandioca", label: "Yuca" },
      { id: "inhame", label: "Ñame" },
      { id: "cará", label: "Taro" }
    ]
  }
];

// Catálogo de recetas
export const recipes = [
  {
    id: 1,
    name: "Tortilla de Espinacas",
    category: "Desayuno",
    time: "10 min",
    calories: 220,
    image: "🍳",
    ingredients: [
      "2 huevos",
      "1 taza de espinacas frescas",
      "Sal y pimienta al gusto",
      "1 cucharada de aceite de oliva"
    ],
    instructions: [
      "Bate los huevos en un bol con un tenedor hasta integrar.",
      "Calienta el aceite a fuego medio en una sartén antiadherente.",
      "Agrega las hojas de espinaca y saltea 1 minuto hasta que reduzcan.",
      "Vierte los huevos batidos sobre las espinacas distribuyéndolos de forma uniforme.",
      "Condimenta con sal y pimienta al gusto.",
      "Cuando la base esté firme, dobla por la mitad y sirve caliente."
    ]
  },
  {
    id: 2,
    name: "Pollo a la Plancha con Verduras",
    category: "Almuerzo",
    time: "25 min",
    calories: 350,
    image: "🍗",
    ingredients: [
      "150g de pechuga de pollo en filete",
      "Calabacín, berenjena y pimiento en trozos",
      "2 cucharadas de aceite de oliva",
      "Condimentos: ajo picado, sal y finas hierbas"
    ],
    instructions: [
      "Condimenta el pollo con ajo machacado, sal y finas hierbas.",
      "Corta las verduras en rodajas o dados medianos.",
      "Cocina el pollo a fuego medio unos 5 minutos por lado.",
      "En la misma sartén, saltea las verduras hasta dorar.",
      "Cocina hasta que queden tiernas y jugosas.",
      "Sirve el filete de pollo troceado sobre las verduras salteadas."
    ]
  },
  {
    id: 3,
    name: "Ensalada Proteica Completa",
    category: "Almuerzo",
    time: "15 min",
    calories: 280,
    image: "🥗",
    ingredients: [
      "2 tazas de hojas verdes (lechuga, rúcula y espinaca)",
      "1 huevo cocido en rodajas",
      "100g de pechuga de pollo desmenuzada",
      "Tomates cherry cortados por la mitad",
      "Vinagreta ligera de limón con aceite de oliva"
    ],
    instructions: [
      "Lava y seca bien las hojas verdes frescas.",
      "Cocina el huevo en agua hirviendo durante 9 a 10 minutos.",
      "En un plato hondo, coloca la cama de hojas verdes.",
      "Distribuye el pollo desmenuzado y los tomates cherry.",
      "Agrega las rodajas de huevo cocido.",
      "Riega con la vinagreta de limón y oliva justo al servir."
    ]
  },
  {
    id: 4,
    name: "Yogur Natural con Granola y Frutas",
    category: "Merienda",
    time: "3 min",
    calories: 180,
    image: "🥣",
    ingredients: [
      "1 vaso (160g) de yogur natural desnatado",
      "2 cucharadas de granola integral sin azúcar",
      "Fresas o frutos rojos frescos al gusto"
    ],
    instructions: [
      "Coloca el yogur natural en un bol.",
      "Agrega la granola integral esparcida por encima.",
      "Decora con fresas frescas laminadas.",
      "Consume de inmediato para mantener la textura crujiente."
    ]
  },
  {
    id: 5,
    name: "Pescado al Horno con Camote / Batata",
    category: "Cena",
    time: "30 min",
    calories: 320,
    image: "🐟",
    ingredients: [
      "150g de filete de pescado blanco (merluza o tilapia)",
      "1 camote / batata dulce mediana en rodajas",
      "Jugo de medio limón, ajo y aceite de oliva",
      "Hierbas frescas (romero y tomillo)"
    ],
    instructions: [
      "Precalienta el horno a 200°C.",
      "Condimenta el filete de pescado con limón, sal y ajo.",
      "Coloca las rodajas de camote en una bandeja con un chorrito de aceite de oliva.",
      "Hornea el camote previamente durante 15 minutos.",
      "Agrega el filete de pescado condimentado y hornea 12-15 minutos más.",
      "Finaliza con hierbas frescas y acompaña con ensalada verde."
    ]
  }
];

// Generador inteligente del plan nutricional de 7 días basado en el perfil
export function generateDietPlan({ age, currentWeight, height, targetWeight, targetDays, dietaryRestrictions: rest = [], foodPreferences: foods = [] }) {
  const bmr = 10 * currentWeight + 6.25 * height - 5 * age - 161;
  const tdee = Math.round(bmr * 1.35);
  const calorieDeficit = Math.round(((currentWeight - targetWeight) * 7700) / Math.max(20, targetDays || 30));
  const dailyCalories = Math.max(1200, Math.min(2200, tdee - Math.min(600, Math.max(250, calorieDeficit))));

  const diasConfig = [
    {
      dia: "Lunes",
      short: "Lun",
      refeicoes: [
        {
          nome: "Desayuno",
          horario: "07:00",
          calorias: 280,
          prato: "Tortilla de claras con avena y fruta",
          itens: ["150g de claras", "30g de avena", "100g de plátano"],
          receita: "Bate las claras con la avena y cocina en sartén antiadherente a fuego bajo hasta dorar. Acompaña con plátano en rodajas."
        },
        {
          nome: "Media Mañana",
          horario: "10:00",
          calorias: 150,
          prato: "Yogur natural con anacardos o nueces",
          itens: ["150g de yogur natural", "20g de frutos secos"],
          receita: "Coloca el yogur natural en un bol y agrega los frutos secos picados. Puedes añadir una pizca de canela."
        },
        {
          nome: "Almuerzo",
          horario: "13:00",
          calorias: 420,
          prato: "Pechuga de pollo a la plancha, arroz integral y brócoli",
          itens: ["150g de pechuga de pollo", "80g de arroz integral", "100g de brócoli", "5g de aceite de oliva"],
          receita: "Cocina el pollo a la plancha con hierbas y sal. Cocina el brócoli al vapor al dente y sirve con el arroz caliente."
        },
        {
          nome: "Merienda",
          horario: "16:00",
          calorias: 200,
          prato: "Smoothie de fresa y almendras",
          itens: ["100g de fresas", "150ml de leche desnatada o vegetal", "15g de almendras"],
          receita: "Licúa las fresas frescas o congeladas con la leche y almendras hasta obtener textura cremosa."
        },
        {
          nome: "Cena",
          horario: "19:30",
          calorias: 350,
          prato: "Filete de pescado blanco con verduras al vapor",
          itens: ["150g de filete de pescado", "150g de verduras variadas", "5g de aceite de oliva"],
          receita: "Condimenta el pescado con limón y hierbas. Cocina a la plancha y acompaña de verduras al vapor con un toque de oliva."
        }
      ]
    },
    {
      dia: "Martes",
      short: "Mar",
      refeicoes: [
        {
          nome: "Desayuno",
          horario: "07:00",
          calorias: 290,
          prato: "Pancakes de plátano con canela y huevo",
          itens: ["2 huevos enteros", "1 plátano machacado", "20g de avena en hojuelas"],
          receita: "Mezcla el plátano machacado con los huevos y la avena. Cocina a fuego lento en sartén antiadherente con canela."
        },
        {
          nome: "Media Mañana",
          horario: "10:00",
          calorias: 140,
          prato: "Frutos rojos con semillas de calabaza",
          itens: ["100g de fresas o moras", "15g de semillas de calabaza"],
          receita: "Lava las frutas frescas y acompáñalas con semillas crujientes para un snack antioxidante."
        },
        {
          nome: "Almuerzo",
          horario: "12:30",
          calorias: 510,
          prato: "Carne magra picada con yuca y rúcula",
          itens: ["150g de carne magra picada", "100g de yuca cocida", "Ensalada abundante de rúcula y tomate"],
          receita: "Saltea la carne con cebolla, ajo y tomate. Sirve con la yuca tierna y ensalada fresca."
        },
        {
          nome: "Merienda",
          horario: "16:30",
          calorias: 130,
          prato: "Batido ligero de papaya con leche vegetal",
          itens: ["150ml de leche vegetal o desnatada", "1 rodaja de papaya", "1 cucharadita de semillas de lino"],
          receita: "Licúa todos los ingredientes hasta lograr una mezcla homogénea y refrescante."
        },
        {
          nome: "Cena",
          horario: "19:30",
          calorias: 330,
          prato: "Tortilla de espinacas con calabacín a la plancha",
          itens: ["2 huevos enteros + 2 claras", "1 taza de espinacas", "1 calabacín pequeño con oliva"],
          receita: "Saltea las espinacas con ajo, añade los huevos batidos y dora por ambos lados. Acompaña con calabacín a la plancha."
        }
      ]
    },
    {
      dia: "Miércoles",
      short: "Mié",
      refeicoes: [
        {
          nome: "Desayuno",
          horario: "07:00",
          calorias: 280,
          prato: "Bol proteico de yogur con avena y kiwi",
          itens: ["170g de yogur griego o natural", "30g de avena", "1 kiwi o fruta de temporada"],
          receita: "Mezcla el yogur con la avena y deja reposar 2 minutos. Cubre con la fruta fresca troceada."
        },
        {
          nome: "Media Mañana",
          horario: "10:00",
          calorias: 150,
          prato: "Almendras y uvas pasas",
          itens: ["20g de almendras crudas", "1 cucharada de uvas pasas"],
          receita: "Come despacio para saciar el apetito y mantener la energía estable durante la mañana."
        },
        {
          nome: "Almuerzo",
          horario: "12:30",
          calorias: 520,
          prato: "Pechuga de pollo al horno con camote y ensalada",
          itens: ["150g de pechuga de pollo", "120g de camote asado", "Ensalada mixta de lechuga, pepino y tomate"],
          receita: "Hornea el pollo con rodajas de camote aderezadas con romero y oliva durante 25 min a 200°C."
        },
        {
          nome: "Merienda",
          horario: "16:30",
          calorias: 120,
          prato: "Aguacate pisado con gotas de limón",
          itens: ["60g de aguacate fresco", "Gotas de limón y pizca de sal"],
          receita: "Pisa el aguacate con un tenedor, agrega limón y disfruta de grasas saludables."
        },
        {
          nome: "Cena",
          horario: "19:30",
          calorias: 330,
          prato: "Crema de verduras con pollo desmenuzado",
          itens: ["100g de pollo cocido desmenuzado", "Calabaza y zanahoria cocidas y trituradas", "Hierbas frescas"],
          receita: "Cocina y licúa las verduras con caldo natural. Incorpora el pollo desmenuzado bien caliente."
        }
      ]
    },
    {
      dia: "Jueves",
      short: "Jue",
      refeicoes: [
        {
          nome: "Desayuno",
          horario: "07:00",
          calorias: 280,
          prato: "Huevos revueltos con tomate y pan integral",
          itens: ["2 huevos", "1 rebanada de pan 100% integral", "1 tomate picado con orégano"],
          receita: "Bate los huevos con tomate y orégano. Revuelve a fuego suave y sirve sobre la tostada integral."
        },
        {
          nome: "Media Mañana",
          horario: "10:00",
          calorias: 150,
          prato: "Yogur natural desnatado con chía",
          itens: ["150g de yogur desnatado", "1 cucharada de semillas de chía"],
          receita: "Deja hidratar la chía en el yogur durante 5 minutos antes de consumir."
        },
        {
          nome: "Almuerzo",
          horario: "12:30",
          calorias: 520,
          prato: "Filete de salmón o atún con arroz integral y verduras",
          itens: ["140g de filete de pescado", "80g de arroz integral o quinua", "Brócoli y coliflor al vapor"],
          receita: "Sella el pescado a la plancha rápidamente y acompaña con cereales y verduras crujientes."
        },
        {
          nome: "Merienda",
          horario: "16:30",
          calorias: 120,
          prato: "Pera laminada con canela",
          itens: ["1 pera mediana", "Canela en polvo al gusto"],
          receita: "Corta la pera en láminas y calienta 30 segundos en microondas con canela. ¡Queda tierna y aromática!"
        },
        {
          nome: "Cena",
          horario: "19:30",
          calorias: 330,
          prato: "Pollo desmenuzado con puré de calabaza",
          itens: ["140g de pollo cocido desmenuzado", "150g de puré de calabaza", "Ensalada verde con limón"],
          receita: "Tritura la calabaza cocida con una pizca de nuez moscada y aceite de oliva. Acompaña con el pollo."
        }
      ]
    },
    {
      dia: "Viernes",
      short: "Vie",
      refeicoes: [
        {
          nome: "Desayuno",
          horario: "07:00",
          calorias: 280,
          prato: "Tortilla de claras con avena y fruta",
          itens: ["150g de claras", "30g de avena", "100g de plátano"],
          receita: "Bate las claras con la avena y dora en la sartén. Acompaña de plátano fresco."
        },
        {
          nome: "Media Mañana",
          horario: "10:00",
          calorias: 150,
          prato: "Yogur natural con nueces",
          itens: ["150g de yogur natural", "20g de nueces picadas"],
          receita: "Mezcla las nueces troceadas con el yogur fresco."
        },
        {
          nome: "Almuerzo",
          horario: "12:30",
          calorias: 520,
          prato: "Pollo a la plancha con arroz integral y frijoles / alubias",
          itens: ["150g de pollo", "80g de arroz integral", "1 cucharón pequeño de frijoles", "Ensalada verde al gusto"],
          receita: "Comida completa rica en aminoácidos esenciales y hierro para potenciar la recuperación muscular."
        },
        {
          nome: "Merienda",
          horario: "16:30",
          calorias: 120,
          prato: "Manzana laminada con chía",
          itens: ["1 manzana roja", "1 cucharadita de semillas de chía"],
          receita: "Lava bien la manzana, córtala en láminas y espolvorea con semillas de chía."
        },
        {
          nome: "Cena",
          horario: "19:30",
          calorias: 330,
          prato: "Tiras de carne magra con verduras salteadas",
          itens: ["130g de lomo de res en tiras", "Calabacín, cebolla morada y pimientos", "1 cucharadita de aceite de oliva"],
          receita: "Saltea la carne a fuego vivo para conservar los jugos y añade las verduras hasta que queden al dente."
        }
      ]
    },
    {
      dia: "Sábado",
      short: "Sáb",
      refeicoes: [
        {
          nome: "Desayuno",
          horario: "08:00",
          calorias: 290,
          prato: "Crepe proteico con queso fresco",
          itens: ["1 huevo entero + 2 claras", "1 cucharada de harina de avena o tapioca", "30g de queso fresco o ricota"],
          receita: "Bate el huevo, las claras y la avena. Vierte en sartén, rellena con queso fresco y dobla por la mitad."
        },
        {
          nome: "Media Mañana",
          horario: "10:30",
          calorias: 140,
          prato: "Porción de frutas frescas de temporada",
          itens: ["1 taza de sandía o piña en dados", "Hojas de menta fresca"],
          receita: "Excelente para una hidratación y digestión natural en el fin de semana."
        },
        {
          nome: "Almuerzo",
          horario: "13:00",
          calorias: 520,
          prato: "Pescado al horno con papa y ensalada tropical",
          itens: ["160g de filete de pescado blanco", "1 papa mediana asada", "Ensalada de hojas verdes y tomatitos"],
          receita: "Hornea el pescado con rodajas de cebolla, tomate y oliva. Acompaña con la papa asada."
        },
        {
          nome: "Merienda",
          horario: "16:30",
          calorias: 120,
          prato: "Yogur natural desnatado con canela",
          itens: ["150g de yogur desnatado", "Pizca generosa de canela"],
          receita: "Mezcla bien y disfruta bien frío."
        },
        {
          nome: "Cena",
          horario: "20:00",
          calorias: 330,
          prato: "Tortilla de claras rellena con champiñones y tomate",
          itens: ["3 claras + 1 yema", "100g de champiñones", "1 tomate picado"],
          receita: "Saltea los champiñones con ajo y oliva. Añade los huevos batidos y dobla con el tomate fresco."
        }
      ]
    },
    {
      dia: "Domingo",
      short: "Dom",
      refeicoes: [
        {
          nome: "Desayuno",
          horario: "08:30",
          calorias: 280,
          prato: "Huevos pochados con tostada integral y papaya",
          itens: ["2 huevos pochados o cocidos", "1 rebanada de pan integral tostado", "1 rodaja de papaya con limón"],
          receita: "Cocina los huevos en agua hirviendo con un chorrito de vinagre durante 4 min. Sirve sobre la tostada."
        },
        {
          nome: "Media Mañana",
          horario: "11:00",
          calorias: 150,
          prato: "Mix de nueces y frutos secos",
          itens: ["15g de nueces", "10g de almendras"],
          receita: "Fuente rica en omega 3 para apoyar la regeneración celular y reducir la inflamación muscular."
        },
        {
          nome: "Almuerzo",
          horario: "13:00",
          calorias: 520,
          prato: "Pollo a la plancha con quinua y vegetales asados",
          itens: ["150g de pechuga de pollo", "80g de quinua cocida", "Calabacín, berenjena y zanahoria asadas"],
          receita: "Cocina el pollo con hierbas aromáticas. Mezcla la quinua con los vegetales asados al horno."
        },
        {
          nome: "Merienda",
          horario: "17:00",
          calorias: 120,
          prato: "Smoothie ligero de frutas con agua de coco",
          itens: ["150ml de agua de coco natural", "1/2 plátano congelado", "Fresas frescas"],
          receita: "Licúa todo hasta obtener una consistencia cremosa y muy refrescante."
        },
        {
          nome: "Cena",
          horario: "19:30",
          calorias: 330,
          prato: "Sopa nutritiva de calabaza con jengibre y pollo",
          itens: ["120g de pollo desmenuzado", "Crema de calabaza con jengibre rallado", "Semillas de calabaza tostadas"],
          receita: "Calienta la sopa cremosa, añade el pollo desmenuzado y decora con semillas crujientes. Ideal para el descanso nocturno."
        }
      ]
    }
  ];

  return {
    totalCaloriasDiarias: dailyCalories,
    dias: diasConfig,
    dicas: [
      "Bebe entre 2,5 y 3 litros de agua a lo largo del día para favorecer el metabolismo de la calistenia.",
      "Mastica despacio cada comida (al menos 20 masticaciones por bocado).",
      "Evita pantallas y bebidas con cafeína después de las 17h para facilitar un descanso celular regenerativo.",
      "La constancia de 21 días junto a este plan genera transformaciones visibles en la composición corporal."
    ]
  };
}
