export interface Item {
  id: number
  name: string
  rarity: 'comun' | 'raro' | 'epico' | 'legendario'
  sprite: string
  description: string
}

export const RARITY_WEIGHTS = {
  comun: 50,
  raro: 30,
  epico: 15,
  legendario: 5,
}

export const RARITY_COLORS = {
  comun: '#10b981',
  raro: '#4fc3f7',
  epico: '#a855f7',
  legendario: '#f59e0b',
}

export const RARITY_GLOWS = {
  comun: 'rgba(16, 185, 129, 0.3)',
  raro: 'rgba(79, 195, 247, 0.3)',
  epico: 'rgba(168, 85, 247, 0.3)',
  legendario: 'rgba(245, 158, 11, 0.4)',
}

export const RARITY_LABELS = {
  comun: 'Común',
  raro: 'Raro',
  epico: 'Épico',
  legendario: 'Legendario',
}

const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'

const defaultItems: Item[] = [
  // ============================================================
  // COMUNES - Items basicos de uso diario
  // ============================================================
  { id: 1, name: 'Pocion', rarity: 'comun', sprite: `${BASE}potion.png`, description: 'Recupera 20 PS de un Pokemon.' },
  { id: 2, name: 'Superpocion', rarity: 'comun', sprite: `${BASE}super-potion.png`, description: 'Recupera 50 PS de un Pokemon.' },
  { id: 3, name: 'Pocion Maxima', rarity: 'comun', sprite: `${BASE}max-potion.png`, description: 'Recupera todos los PS de un Pokemon.' },
  { id: 4, name: 'Agua Fresca', rarity: 'comun', sprite: `${BASE}fresh-water.png`, description: 'Recupera 30 PS de un Pokemon.' },
  { id: 5, name: 'Acqua', rarity: 'comun', sprite: `${BASE}soda-pop.png`, description: 'Recupera 50 PS de un Pokemon.' },
  { id: 6, name: 'Limonada', rarity: 'comun', sprite: `${BASE}lemonade.png`, description: 'Recupera 80 PS de un Pokemon.' },
  { id: 7, name: 'Leche Mo Mo', rarity: 'comun', sprite: `${BASE}moomoo-milk.png`, description: 'Recupera 100 PS de un Pokemon.' },
  { id: 8, name: 'Pokeball', rarity: 'comun', sprite: `${BASE}poke-ball.png`, description: 'Una ball para capturar Pokemon.' },
  { id: 9, name: 'Antidoto', rarity: 'comun', sprite: `${BASE}antidote.png`, description: 'Cura el envenenamiento.' },
  { id: 10, name: 'Antiquemar', rarity: 'comun', sprite: `${BASE}burn-heal.png`, description: 'Cura las quemaduras.' },
  { id: 11, name: 'Antihielo', rarity: 'comun', sprite: `${BASE}ice-heal.png`, description: 'Descongela a un Pokemon.' },
  { id: 12, name: 'Despertar', rarity: 'comun', sprite: `${BASE}awakening.png`, description: 'Despierta a un Pokemon dormido.' },
  { id: 13, name: 'Antiparalizador', rarity: 'comun', sprite: `${BASE}paralyze-heal.png`, description: 'Cura la paralisis.' },
  { id: 14, name: 'Restaurador Total', rarity: 'comun', sprite: `${BASE}full-heal.png`, description: 'Cura todos los problemas de estado.' },
  { id: 15, name: 'Revivir', rarity: 'comun', sprite: `${BASE}revive.png`, description: 'Revive a un Pokemon con la mitad de PS.' },
  { id: 16, name: 'Polvo Energia', rarity: 'comun', sprite: `${BASE}energy-powder.png`, description: 'Recupera 50 PS pero baja amistad.' },
  { id: 17, name: 'Raiz Energia', rarity: 'comun', sprite: `${BASE}energy-root.png`, description: 'Recupera 200 PS pero baja amistad.' },
  { id: 18, name: 'Baya Aranja', rarity: 'comun', sprite: `${BASE}oran-berry.png`, description: 'Recupera 10 PS automaticamente.' },
  { id: 19, name: 'Baya Meloc', rarity: 'comun', sprite: `${BASE}pecha-berry.png`, description: 'Cura envenenamiento automaticamente.' },
  { id: 20, name: 'Baya Safre', rarity: 'comun', sprite: `${BASE}rawst-berry.png`, description: 'Cura quemaduras automaticamente.' },
  { id: 21, name: 'Baya Caquic', rarity: 'comun', sprite: `${BASE}chesto-berry.png`, description: 'Despierta automaticamente.' },
  { id: 22, name: 'Baya Atania', rarity: 'comun', sprite: `${BASE}cheri-berry.png`, description: 'Cura paralisis automaticamente.' },
  { id: 23, name: 'Baya Perasi', rarity: 'comun', sprite: `${BASE}persim-berry.png`, description: 'Cura confusion automaticamente.' },
  { id: 24, name: 'Baya Oram', rarity: 'comun', sprite: `${BASE}aspear-berry.png`, description: 'Descongela automaticamente.' },
  { id: 25, name: 'Baya Zanama', rarity: 'comun', sprite: `${BASE}leppa-berry.png`, description: 'Restaura 10 PP automaticamente.' },
  { id: 26, name: 'Baya Atalaya', rarity: 'comun', sprite: `${BASE}lum-berry.png`, description: 'Cura cualquier problema de estado.' },
  { id: 27, name: 'Repelente', rarity: 'comun', sprite: `${BASE}repel.png`, description: 'Aleja Pokemon salvajes debiles.' },
  { id: 28, name: 'Super Repelente', rarity: 'comun', sprite: `${BASE}super-repel.png`, description: 'Aleja Pokemon por 200 pasos.' },
  { id: 29, name: 'Cola Blanca', rarity: 'comun', sprite: `${BASE}fluffy-tail.png`, description: 'Sirve para huir de Pokemon salvajes.' },
  { id: 30, name: 'Cuerda Huida', rarity: 'comun', sprite: `${BASE}escape-rope.png`, description: 'Escapa de cuevas y mazmorras.' },
  { id: 31, name: 'Bicicleta', rarity: 'comun', sprite: `${BASE}bike.png`, description: 'Transporte rapido para el entrenador.' },
  { id: 32, name: 'Silbato', rarity: 'comun', sprite: `${BASE}clear-bell.png`, description: 'Silbato para llamar a Pokemon amistosos.' },

  // ============================================================
  // RAROS - Items de mejora y evolucion
  // ============================================================
  { id: 33, name: 'Superball', rarity: 'raro', sprite: `${BASE}great-ball.png`, description: 'Ball de efectividad media-alta.' },
  { id: 34, name: 'Ultraball', rarity: 'raro', sprite: `${BASE}ultra-ball.png`, description: 'Ball de alta efectividad.' },
  { id: 35, name: 'Repelente Maximo', rarity: 'raro', sprite: `${BASE}max-repel.png`, description: 'Aleja Pokemon por 250 pasos.' },
  { id: 36, name: 'Huevo Suerte', rarity: 'raro', sprite: `${BASE}lucky-egg.png`, description: 'Aumenta los puntos de experiencia.' },
  { id: 37, name: 'Campana Concha', rarity: 'raro', sprite: `${BASE}shell-bell.png`, description: 'Recupera PS al danar al rival.' },
  { id: 38, name: 'Piedra Agua', rarity: 'raro', sprite: `${BASE}water-stone.png`, description: 'Evoluciona a ciertos Pokemon de agua.' },
  { id: 39, name: 'Piedra Fuego', rarity: 'raro', sprite: `${BASE}fire-stone.png`, description: 'Evoluciona a ciertos Pokemon de fuego.' },
  { id: 40, name: 'Piedra Trueno', rarity: 'raro', sprite: `${BASE}thunder-stone.png`, description: 'Evoluciona a ciertos Pokemon electricos.' },
  { id: 41, name: 'Piedra Hoja', rarity: 'raro', sprite: `${BASE}leaf-stone.png`, description: 'Evoluciona a ciertos Pokemon planta.' },
  { id: 42, name: 'Piedra Lunar', rarity: 'raro', sprite: `${BASE}moon-stone.png`, description: 'Evoluciona a ciertos Pokemon.' },
  { id: 43, name: 'Piedra Solar', rarity: 'raro', sprite: `${BASE}sun-stone.png`, description: 'Evoluciona a ciertos Pokemon.' },
  { id: 44, name: 'Piedra Hielo', rarity: 'raro', sprite: `${BASE}ice-stone.png`, description: 'Evoluciona a ciertos Pokemon de hielo.' },
  { id: 45, name: 'Piedra Noche', rarity: 'raro', sprite: `${BASE}dusk-stone.png`, description: 'Evoluciona a ciertos Pokemon.' },
  { id: 46, name: 'Piedra Alba', rarity: 'raro', sprite: `${BASE}dawn-stone.png`, description: 'Evoluciona a ciertos Pokemon.' },
  { id: 47, name: 'Piedra Oval', rarity: 'raro', sprite: `${BASE}oval-stone.png`, description: 'Evoluciona a ciertos Pokemon.' },
  { id: 48, name: 'Piedra Brillo', rarity: 'raro', sprite: `${BASE}shiny-stone.png`, description: 'Evoluciona a ciertos Pokemon.' },
  { id: 49, name: 'Piedra Eterna', rarity: 'raro', sprite: `${BASE}ever-stone.png`, description: 'Evita la evolucion de un Pokemon.' },
  { id: 50, name: 'Escama Corazon', rarity: 'raro', sprite: `${BASE}heart-scale.png`, description: 'Usado para recordar movimientos olvidados.' },
  { id: 51, name: 'Manzana Dulce', rarity: 'raro', sprite: `${BASE}sweet-apple.png`, description: 'Evoluciona a Appletun.' },
  { id: 52, name: 'Manzana Acida', rarity: 'raro', sprite: `${BASE}tart-apple.png`, description: 'Evoluciona a Flapple.' },
  { id: 53, name: 'Fragmento Estrella', rarity: 'raro', sprite: `${BASE}star-piece.png`, description: 'Fragmento brillante que se vende por mucho.' },
  { id: 54, name: 'Caramelo Dinamax', rarity: 'raro', sprite: `${BASE}dynamax-candy.png`, description: 'Aumenta el nivel Dinamax.' },
  { id: 55, name: 'Escama Draga', rarity: 'raro', sprite: `${BASE}dragon-scale.png`, description: 'Evoluciona a ciertos Pokemon dragon.' },
  { id: 56, name: 'Paquete Eter', rarity: 'raro', sprite: `${BASE}ether.png`, description: 'Restaura 10 PP de un movimiento.' },
  { id: 57, name: 'Max Eter', rarity: 'raro', sprite: `${BASE}max-ether.png`, description: 'Restaura todos los PP de un movimiento.' },
  { id: 58, name: 'Elixir', rarity: 'raro', sprite: `${BASE}elixir.png`, description: 'Restaura 10 PP de todos los movimientos.' },
  { id: 59, name: 'Max Elixir', rarity: 'raro', sprite: `${BASE}max-elixir.png`, description: 'Restaura todos los PP de todos los movimientos.' },

  // ============================================================
  // EPICOS - Items competitivos y objetos equipables
  // ============================================================
  { id: 60, name: 'Master Ball', rarity: 'epico', sprite: `${BASE}master-ball.png`, description: 'Atrapa cualquier Pokemon sin fallo.' },
  { id: 61, name: 'Caramelo Raro', rarity: 'epico', sprite: `${BASE}rare-candy.png`, description: 'Sube un nivel a un Pokemon.' },
  { id: 62, name: 'Cinta Elegida', rarity: 'epico', sprite: `${BASE}choice-band.png`, description: 'Sube Ataque pero solo permite un movimiento.' },
  { id: 63, name: 'Gafas Elegidas', rarity: 'epico', sprite: `${BASE}choice-specs.png`, description: 'Sube Ataque Especial pero solo un movimiento.' },
  { id: 64, name: 'Bufanda Elegida', rarity: 'epico', sprite: `${BASE}choice-scarf.png`, description: 'Sube Velocidad pero solo un movimiento.' },
  { id: 65, name: 'Casco Dentado', rarity: 'epico', sprite: `${BASE}rocky-helmet.png`, description: 'Dana al contacto fisico al rival.' },
  { id: 66, name: 'Restos', rarity: 'epico', sprite: `${BASE}leftovers.png`, description: 'Recupera 1/16 de PS por turno.' },
  { id: 67, name: 'Vida Esfera', rarity: 'epico', sprite: `${BASE}life-orb.png`, description: 'Aumenta un 30% el poder pero dania al portador.' },
  { id: 68, name: 'Lazo Focus', rarity: 'epico', sprite: `${BASE}focus-sash.png`, description: 'Aguanta con 1 PS si esta a maxima salud.' },
  { id: 69, name: 'Banda Focus', rarity: 'epico', sprite: `${BASE}focus-band.png`, description: 'A veces aguanta un golpe KO.' },
  { id: 70, name: 'Chaleco Asalto', rarity: 'epico', sprite: `${BASE}assault-vest.png`, description: 'Sube Defensa Especial pero solo atacar.' },
  { id: 71, name: 'Politica Debil', rarity: 'epico', sprite: `${BASE}weakness-policy.png`, description: 'Sube drasticamente Ataque al recibir golpe super efectivo.' },
  { id: 72, name: 'Globo Helio', rarity: 'epico', sprite: `${BASE}air-balloon.png`, description: 'Evita ataques de tipo Tierra.' },
  { id: 73, name: 'Baya Zidra', rarity: 'epico', sprite: `${BASE}figy-berry.png`, description: 'Recupera 1/3 de PS si baja de 1/4.' },
  { id: 74, name: 'Baya Wiki', rarity: 'epico', sprite: `${BASE}wiki-berry.png`, description: 'Recupera PS en emergencia (At. Esp.).' },
  { id: 75, name: 'Baya Mago', rarity: 'epico', sprite: `${BASE}mago-berry.png`, description: 'Recupera PS en emergencia (Velocidad).' },
  { id: 76, name: 'Baya Aguav', rarity: 'epico', sprite: `${BASE}aguav-berry.png`, description: 'Recupera PS en emergencia (Def. Esp.).' },
  { id: 77, name: 'Baya Iapapa', rarity: 'epico', sprite: `${BASE}iapapa-berry.png`, description: 'Recupera PS en emergencia (Defensa).' },
  { id: 78, name: 'Paquete Habilidad', rarity: 'epico', sprite: `${BASE}ability-capsule.png`, description: 'Cambia entre las 2 habilidades normales.' },
  { id: 79, name: 'Parche Habilidad', rarity: 'epico', sprite: `${BASE}ability-patch.png`, description: 'Cambia a la habilidad oculta de un Pokemon.' },
  { id: 80, name: 'Cinta Milagro', rarity: 'epico', sprite: `${BASE}lagging-tail.png`, description: 'Hace que el portador se mueva ultimo.' },
  { id: 81, name: 'Cuchara Torcida', rarity: 'epico', sprite: `${BASE}twisted-spoon.png`, description: 'Potencia los movimientos de tipo Psiquico.' },
  { id: 82, name: 'Palo Negro', rarity: 'epico', sprite: `${BASE}black-belt.png`, description: 'Potencia los movimientos de tipo Lucha.' },
  { id: 83, name: 'Piedra Dura', rarity: 'epico', sprite: `${BASE}hard-stone.png`, description: 'Potencia los movimientos de tipo Roca.' },
  { id: 84, name: 'Musgo Velo', rarity: 'epico', sprite: `${BASE}never-melt-ice.png`, description: 'Potencia los movimientos de tipo Hielo.' },
  { id: 85, name: 'Cinta Mistica', rarity: 'epico', sprite: `${BASE}clear-bell.png`, description: 'Potencia los movimientos de tipo Hada.' },
  { id: 86, name: 'Polvo Metalico', rarity: 'epico', sprite: `${BASE}metal-powder.png`, description: 'Sube la Defensa de Ditto.' },
  { id: 87, name: 'Hueso Hueco', rarity: 'epico', sprite: `${BASE}thick-club.png`, description: 'Duplica el Ataque de Cubone y Marowak.' },
  { id: 88, name: 'Mecha de Luz', rarity: 'epico', sprite: `${BASE}light-ball.png`, description: 'Duplica el Ataque Especial de Pikachu.' },
  { id: 89, name: 'Escama Metal', rarity: 'epico', sprite: `${BASE}metal-coat.png`, description: 'Potencia Acero y evoluciona a ciertos Pokemon.' },
  { id: 90, name: 'Capa Naranja', rarity: 'epico', sprite: `${BASE}king-s-rock.png`, description: 'Puede hacer retroceder al rival.' },
  { id: 91, name: 'Colmillo Aguijon', rarity: 'epico', sprite: `${BASE}poison-barb.png`, description: 'Potencia los movimientos de tipo Veneno.' },
  { id: 92, name: 'Ceniza Mistica', rarity: 'epico', sprite: `${BASE}sacred-ash.png`, description: 'Revive a todos los Pokemon del equipo.' },
  { id: 93, name: 'Cinta Suave', rarity: 'epico', sprite: `${BASE}soothe-bell.png`, description: 'Aumenta la amistad del Pokemon.' },
  { id: 94, name: 'Cuenta Suerte', rarity: 'epico', sprite: `${BASE}amulet-coin.png`, description: 'Duplica el dinero ganado en combate.' },
  { id: 95, name: 'Parche Muscular', rarity: 'epico', sprite: `${BASE}muscle-band.png`, description: 'Potencia los movimientos fisicos.' },
  { id: 96, name: 'Parche Sabio', rarity: 'epico', sprite: `${BASE}wise-glasses.png`, description: 'Potencia los movimientos especiales.' },
  { id: 97, name: 'Garra Experta', rarity: 'epico', sprite: `${BASE}razor-claw.png`, description: 'Aumenta el indice de critico.' },
  { id: 98, name: 'Colmillo Aguilar', rarity: 'epico', sprite: `${BASE}razor-fang.png`, description: 'Aumenta el indice de critico.' },
  { id: 99, name: 'Baya Liechi', rarity: 'epico', sprite: `${BASE}liechi-berry.png`, description: 'Sube Ataque en emergencia.' },
  { id: 100, name: 'Baya Ganlon', rarity: 'epico', sprite: `${BASE}ganlon-berry.png`, description: 'Sube Defensa en emergencia.' },
  { id: 101, name: 'Baya Salac', rarity: 'epico', sprite: `${BASE}salac-berry.png`, description: 'Sube Velocidad en emergencia.' },
  { id: 102, name: 'Baya Petaya', rarity: 'epico', sprite: `${BASE}petaya-berry.png`, description: 'Sube At. Especial en emergencia.' },
  { id: 103, name: 'Baya Apicot', rarity: 'epico', sprite: `${BASE}apicot-berry.png`, description: 'Sube Def. Especial en emergencia.' },
  { id: 104, name: 'Baya Lansat', rarity: 'epico', sprite: `${BASE}lansat-berry.png`, description: 'Aumenta el indice de critico en emergencia.' },
  { id: 105, name: 'Baya Chiri', rarity: 'epico', sprite: `${BASE}cheri-berry.png`, description: 'Cura paralisis en emergencia.' },
  { id: 106, name: 'Baya Nuez', rarity: 'epico', sprite: `${BASE}kebia-berry.png`, description: 'Reduce dano de tipo Veneno.' },
  { id: 107, name: 'Baya Aturan', rarity: 'epico', sprite: `${BASE}shuca-berry.png`, description: 'Reduce dano de tipo Tierra.' },
  { id: 108, name: 'Baya Kouba', rarity: 'epico', sprite: `${BASE}coba-berry.png`, description: 'Reduce dano de tipo Volador.' },
  { id: 109, name: 'Baya Sapih', rarity: 'epico', sprite: `${BASE}passho-berry.png`, description: 'Reduce dano de tipo Agua.' },
  { id: 110, name: 'Baya Tamate', rarity: 'epico', sprite: `${BASE}tamat-berry.png`, description: 'Reduce dano de tipo Electrico.' },
  { id: 111, name: 'Baya Pinia', rarity: 'epico', sprite: `${BASE}pinap-berry.png`, description: 'Usada para crear Pokeballs.' },
  { id: 112, name: 'Cinta Destino', rarity: 'epico', sprite: `${BASE}destiny-knot.png`, description: 'Transmite naturaleza al criar.' },
  { id: 113, name: 'Incienso Suave', rarity: 'epico', sprite: `${BASE}sea-incense.png`, description: 'Potencia movimientos de tipo Agua.' },
  { id: 114, name: 'Incienso Roca', rarity: 'epico', sprite: `${BASE}rock-incense.png`, description: 'Potencia movimientos de tipo Roca.' },
  { id: 115, name: 'Incienso Planta', rarity: 'epico', sprite: `${BASE}rose-incense.png`, description: 'Potencia movimientos de tipo Planta.' },
  { id: 116, name: 'Incienso Oleaje', rarity: 'epico', sprite: `${BASE}wave-incense.png`, description: 'Potencia movimientos de tipo Agua.' },

  // ============================================================
  // LEGENDARIOS - Items de maxima rareza
  // ============================================================
  { id: 117, name: 'Caramelo Maestro', rarity: 'legendario', sprite: `${BASE}rare-candy.png`, description: 'Item mitico que potencia al maximo a un Pokemon.' },
  { id: 118, name: 'Corona de Campeon', rarity: 'legendario', sprite: `${BASE}clear-bell.png`, description: 'Simbolo de grandeza suprema de un campeon.' },
  { id: 119, name: 'Hoja Plateada', rarity: 'legendario', sprite: `${BASE}silver-leaf.png`, description: 'Item de coleccionista legendario de Plata.' },
  { id: 120, name: 'Hoja Dorada', rarity: 'legendario', sprite: `${BASE}gold-leaf.png`, description: 'Brillo dorado de leyenda.' },
  { id: 121, name: 'Pluma de Ho-Oh', rarity: 'legendario', sprite: `${BASE}rainbow-wing.png`, description: 'Pluma arcoiris del legendario Ho-Oh.' },
  { id: 122, name: 'Pluma de Lugia', rarity: 'legendario', sprite: `${BASE}silver-wing.png`, description: 'Pluma plateada del legendario Lugia.' },
  { id: 123, name: 'Fragmento Vida', rarity: 'legendario', sprite: `${BASE}large-leaf.png`, description: 'Fragmento legendario de energia vital.' },
  { id: 124, name: 'Llamas Eternas', rarity: 'legendario', sprite: `${BASE}fire-stone.png`, description: 'Llama legendaria que nunca se apaga.' },
  { id: 125, name: 'Espina Lunar', rarity: 'legendario', sprite: `${BASE}moon-stone.png`, description: 'Espina legendaria caida de la luna.' },
  { id: 126, name: 'Colmillo del Trueno', rarity: 'legendario', sprite: `${BASE}thunder-stone.png`, description: 'Colmillo legendario de poder electrico.' },
  { id: 127, name: 'Esencia Cristal', rarity: 'legendario', sprite: `${BASE}shiny-stone.png`, description: 'Esencia legendaria de cristal puro.' },
  { id: 128, name: 'Garra de Dragon', rarity: 'legendario', sprite: `${BASE}dragon-scale.png`, description: 'Garra de dragon legendario.' },
  { id: 129, name: 'Gema Oceano', rarity: 'legendario', sprite: `${BASE}water-stone.png`, description: 'Gema legendaria del oceano profundo.' },
  { id: 130, name: 'Alma del Bosque', rarity: 'legendario', sprite: `${BASE}leaf-stone.png`, description: 'Alma legendaria del bosque antiguo.' },
  { id: 131, name: 'Garra Oscura', rarity: 'legendario', sprite: `${BASE}dusk-stone.png`, description: 'Garra legendaria de la oscuridad.' },
  { id: 132, name: 'Alba Radiante', rarity: 'legendario', sprite: `${BASE}dawn-stone.png`, description: 'Gema legendaria del amanecer.' },
  { id: 133, name: 'Corona Solar', rarity: 'legendario', sprite: `${BASE}sun-stone.png`, description: 'Corona legendaria de poder solar.' },
]

export default defaultItems