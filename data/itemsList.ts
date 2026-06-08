export interface Item {
  id: number
  name: string
  rarity: 'comun' | 'raro' | 'epico' | 'legendario'
  sprite: string
  description: string
  enabled: boolean // Si el item esta habilitado para salir en la ruleta
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
  { id: 1, name: 'Pocion', rarity: 'comun', sprite: `${BASE}potion.png`, description: 'Recupera 20 PS de un Pokemon.', enabled: true },
  { id: 2, name: 'Superpocion', rarity: 'comun', sprite: `${BASE}super-potion.png`, description: 'Recupera 50 PS de un Pokemon.', enabled: true },
  { id: 3, name: 'Pocion Maxima', rarity: 'comun', sprite: `${BASE}max-potion.png`, description: 'Recupera todos los PS de un Pokemon.', enabled: true },
  { id: 4, name: 'Agua Fresca', rarity: 'comun', sprite: `${BASE}fresh-water.png`, description: 'Recupera 30 PS de un Pokemon.', enabled: true },
  { id: 5, name: 'Acqua', rarity: 'comun', sprite: `${BASE}soda-pop.png`, description: 'Recupera 50 PS de un Pokemon.', enabled: true },
  { id: 6, name: 'Limonada', rarity: 'comun', sprite: `${BASE}lemonade.png`, description: 'Recupera 80 PS de un Pokemon.', enabled: true },
  { id: 7, name: 'Leche Mo Mo', rarity: 'comun', sprite: `${BASE}moomoo-milk.png`, description: 'Recupera 100 PS de un Pokemon.', enabled: true },
  { id: 8, name: 'Pokeball', rarity: 'comun', sprite: `${BASE}poke-ball.png`, description: 'Una ball para capturar Pokemon.', enabled: true },
  { id: 9, name: 'Antidoto', rarity: 'comun', sprite: `${BASE}antidote.png`, description: 'Cura el envenenamiento.', enabled: true },
  { id: 10, name: 'Antiquemar', rarity: 'comun', sprite: `${BASE}burn-heal.png`, description: 'Cura las quemaduras.', enabled: true },
  { id: 11, name: 'Antihielo', rarity: 'comun', sprite: `${BASE}ice-heal.png`, description: 'Descongela a un Pokemon.', enabled: true },
  { id: 12, name: 'Despertar', rarity: 'comun', sprite: `${BASE}awakening.png`, description: 'Despierta a un Pokemon dormido.', enabled: true },
  { id: 13, name: 'Antiparalizador', rarity: 'comun', sprite: `${BASE}paralyze-heal.png`, description: 'Cura la paralisis.', enabled: true },
  { id: 14, name: 'Restaurador Total', rarity: 'comun', sprite: `${BASE}full-heal.png`, description: 'Cura todos los problemas de estado.', enabled: true },
  { id: 15, name: 'Revivir', rarity: 'comun', sprite: `${BASE}revive.png`, description: 'Revive a un Pokemon con la mitad de PS.', enabled: true },
  { id: 16, name: 'Polvo Energia', rarity: 'comun', sprite: `${BASE}energy-powder.png`, description: 'Recupera 50 PS pero baja amistad.', enabled: true },
  { id: 17, name: 'Raiz Energia', rarity: 'comun', sprite: `${BASE}energy-root.png`, description: 'Recupera 200 PS pero baja amistad.', enabled: true },
  { id: 18, name: 'Baya Aranja', rarity: 'comun', sprite: `${BASE}oran-berry.png`, description: 'Recupera 10 PS automaticamente.', enabled: true },
  { id: 19, name: 'Baya Meloc', rarity: 'comun', sprite: `${BASE}pecha-berry.png`, description: 'Cura envenenamiento automaticamente.', enabled: true },
  { id: 20, name: 'Baya Safre', rarity: 'comun', sprite: `${BASE}rawst-berry.png`, description: 'Cura quemaduras automaticamente.', enabled: true },
  { id: 21, name: 'Baya Caquic', rarity: 'comun', sprite: `${BASE}chesto-berry.png`, description: 'Despierta automaticamente.', enabled: true },
  { id: 22, name: 'Baya Atania', rarity: 'comun', sprite: `${BASE}cheri-berry.png`, description: 'Cura paralisis automaticamente.', enabled: true },
  { id: 23, name: 'Baya Perasi', rarity: 'comun', sprite: `${BASE}persim-berry.png`, description: 'Cura confusion automaticamente.', enabled: true },
  { id: 24, name: 'Baya Oram', rarity: 'comun', sprite: `${BASE}aspear-berry.png`, description: 'Descongela automaticamente.', enabled: true },
  { id: 25, name: 'Baya Zanama', rarity: 'comun', sprite: `${BASE}leppa-berry.png`, description: 'Restaura 10 PP automaticamente.', enabled: true },
  { id: 26, name: 'Baya Atalaya', rarity: 'comun', sprite: `${BASE}lum-berry.png`, description: 'Cura cualquier problema de estado.', enabled: true },
  { id: 27, name: 'Repelente', rarity: 'comun', sprite: `${BASE}repel.png`, description: 'Aleja Pokemon salvajes debiles.', enabled: true },
  { id: 28, name: 'Super Repelente', rarity: 'comun', sprite: `${BASE}super-repel.png`, description: 'Aleja Pokemon por 200 pasos.', enabled: true },
  { id: 29, name: 'Cola Blanca', rarity: 'comun', sprite: `${BASE}fluffy-tail.png`, description: 'Sirve para huir de Pokemon salvajes.', enabled: true },
  { id: 30, name: 'Cuerda Huida', rarity: 'comun', sprite: `${BASE}escape-rope.png`, description: 'Escapa de cuevas y mazmorras.', enabled: true },
  { id: 31, name: 'Bicicleta', rarity: 'comun', sprite: `${BASE}bike.png`, description: 'Transporte rapido para el entrenador.', enabled: true },
  { id: 32, name: 'Silbato', rarity: 'comun', sprite: `${BASE}clear-bell.png`, description: 'Silbato para llamar a Pokemon amistosos.', enabled: true },

  // ============================================================
  // RAROS - Items de mejora y evolucion
  // ============================================================
  { id: 33, name: 'Superball', rarity: 'raro', sprite: `${BASE}great-ball.png`, description: 'Ball de efectividad media-alta.', enabled: true },
  { id: 34, name: 'Ultraball', rarity: 'raro', sprite: `${BASE}ultra-ball.png`, description: 'Ball de alta efectividad.', enabled: true },
  { id: 35, name: 'Repelente Maximo', rarity: 'raro', sprite: `${BASE}max-repel.png`, description: 'Aleja Pokemon por 250 pasos.', enabled: true },
  { id: 36, name: 'Huevo Suerte', rarity: 'raro', sprite: `${BASE}lucky-egg.png`, description: 'Aumenta los puntos de experiencia.', enabled: true },
  { id: 37, name: 'Campana Concha', rarity: 'raro', sprite: `${BASE}shell-bell.png`, description: 'Recupera PS al danar al rival.', enabled: true },
  { id: 38, name: 'Piedra Agua', rarity: 'raro', sprite: `${BASE}water-stone.png`, description: 'Evoluciona a ciertos Pokemon de agua.', enabled: true },
  { id: 39, name: 'Piedra Fuego', rarity: 'raro', sprite: `${BASE}fire-stone.png`, description: 'Evoluciona a ciertos Pokemon de fuego.', enabled: true },
  { id: 40, name: 'Piedra Trueno', rarity: 'raro', sprite: `${BASE}thunder-stone.png`, description: 'Evoluciona a ciertos Pokemon electricos.', enabled: true },
  { id: 41, name: 'Piedra Hoja', rarity: 'raro', sprite: `${BASE}leaf-stone.png`, description: 'Evoluciona a ciertos Pokemon planta.', enabled: true },
  { id: 42, name: 'Piedra Lunar', rarity: 'raro', sprite: `${BASE}moon-stone.png`, description: 'Evoluciona a ciertos Pokemon.', enabled: true },
  { id: 43, name: 'Piedra Solar', rarity: 'raro', sprite: `${BASE}sun-stone.png`, description: 'Evoluciona a ciertos Pokemon.', enabled: true },
  { id: 44, name: 'Piedra Hielo', rarity: 'raro', sprite: `${BASE}ice-stone.png`, description: 'Evoluciona a ciertos Pokemon de hielo.', enabled: true },
  { id: 45, name: 'Piedra Noche', rarity: 'raro', sprite: `${BASE}dusk-stone.png`, description: 'Evoluciona a ciertos Pokemon.', enabled: true },
  { id: 46, name: 'Piedra Alba', rarity: 'raro', sprite: `${BASE}dawn-stone.png`, description: 'Evoluciona a ciertos Pokemon.', enabled: true },
  { id: 47, name: 'Piedra Oval', rarity: 'raro', sprite: `${BASE}oval-stone.png`, description: 'Evoluciona a ciertos Pokemon.', enabled: true },
  { id: 48, name: 'Piedra Brillo', rarity: 'raro', sprite: `${BASE}shiny-stone.png`, description: 'Evoluciona a ciertos Pokemon.', enabled: true },
  { id: 49, name: 'Piedra Eterna', rarity: 'raro', sprite: `${BASE}ever-stone.png`, description: 'Evita la evolucion de un Pokemon.', enabled: true },
  { id: 50, name: 'Escama Corazon', rarity: 'raro', sprite: `${BASE}heart-scale.png`, description: 'Usado para recordar movimientos olvidados.', enabled: true },
  { id: 51, name: 'Manzana Dulce', rarity: 'raro', sprite: `${BASE}sweet-apple.png`, description: 'Evoluciona a Appletun.', enabled: true },
  { id: 52, name: 'Manzana Acida', rarity: 'raro', sprite: `${BASE}tart-apple.png`, description: 'Evoluciona a Flapple.', enabled: true },
  { id: 53, name: 'Fragmento Estrella', rarity: 'raro', sprite: `${BASE}star-piece.png`, description: 'Fragmento brillante que se vende por mucho.', enabled: true },
  { id: 54, name: 'Caramelo Dinamax', rarity: 'raro', sprite: `${BASE}dynamax-candy.png`, description: 'Aumenta el nivel Dinamax.', enabled: true },
  { id: 55, name: 'Escama Draga', rarity: 'raro', sprite: `${BASE}dragon-scale.png`, description: 'Evoluciona a ciertos Pokemon dragon.', enabled: true },
  { id: 56, name: 'Paquete Eter', rarity: 'raro', sprite: `${BASE}ether.png`, description: 'Restaura 10 PP de un movimiento.', enabled: true },
  { id: 57, name: 'Max Eter', rarity: 'raro', sprite: `${BASE}max-ether.png`, description: 'Restaura todos los PP de un movimiento.', enabled: true },
  { id: 58, name: 'Elixir', rarity: 'raro', sprite: `${BASE}elixir.png`, description: 'Restaura 10 PP de todos los movimientos.', enabled: true },
  { id: 59, name: 'Max Elixir', rarity: 'raro', sprite: `${BASE}max-elixir.png`, description: 'Restaura todos los PP de todos los movimientos.', enabled: true },

  // ============================================================
  // EPICOS - Items competitivos y objetos equipables
  // ============================================================
  { id: 60, name: 'Master Ball', rarity: 'epico', sprite: `${BASE}master-ball.png`, description: 'Atrapa cualquier Pokemon sin fallo.', enabled: true },
  { id: 61, name: 'Caramelo Raro', rarity: 'epico', sprite: `${BASE}rare-candy.png`, description: 'Sube un nivel a un Pokemon.', enabled: true },
  { id: 62, name: 'Cinta Elegida', rarity: 'epico', sprite: `${BASE}choice-band.png`, description: 'Sube Ataque pero solo permite un movimiento.', enabled: true },
  { id: 63, name: 'Gafas Elegidas', rarity: 'epico', sprite: `${BASE}choice-specs.png`, description: 'Sube Ataque Especial pero solo un movimiento.', enabled: true },
  { id: 64, name: 'Bufanda Elegida', rarity: 'epico', sprite: `${BASE}choice-scarf.png`, description: 'Sube Velocidad pero solo un movimiento.', enabled: true },
  { id: 65, name: 'Casco Dentado', rarity: 'epico', sprite: `${BASE}rocky-helmet.png`, description: 'Dana al contacto fisico al rival.', enabled: true },
  { id: 66, name: 'Restos', rarity: 'epico', sprite: `${BASE}leftovers.png`, description: 'Recupera 1/16 de PS por turno.', enabled: true },
  { id: 67, name: 'Vida Esfera', rarity: 'epico', sprite: `${BASE}life-orb.png`, description: 'Aumenta un 30% el poder pero dania al portador.', enabled: true },
  { id: 68, name: 'Lazo Focus', rarity: 'epico', sprite: `${BASE}focus-sash.png`, description: 'Aguanta con 1 PS si esta a maxima salud.', enabled: true },
  { id: 69, name: 'Banda Focus', rarity: 'epico', sprite: `${BASE}focus-band.png`, description: 'A veces aguanta un golpe KO.', enabled: true },
  { id: 70, name: 'Chaleco Asalto', rarity: 'epico', sprite: `${BASE}assault-vest.png`, description: 'Sube Defensa Especial pero solo atacar.', enabled: true },
  { id: 71, name: 'Politica Debil', rarity: 'epico', sprite: `${BASE}weakness-policy.png`, description: 'Sube drasticamente Ataque al recibir golpe super efectivo.', enabled: true },
  { id: 72, name: 'Globo Helio', rarity: 'epico', sprite: `${BASE}air-balloon.png`, description: 'Evita ataques de tipo Tierra.', enabled: true },
  { id: 73, name: 'Baya Zidra', rarity: 'epico', sprite: `${BASE}figy-berry.png`, description: 'Recupera 1/3 de PS si baja de 1/4.', enabled: true },
  { id: 74, name: 'Baya Wiki', rarity: 'epico', sprite: `${BASE}wiki-berry.png`, description: 'Recupera PS en emergencia (At. Esp.).', enabled: true },
  { id: 75, name: 'Baya Mago', rarity: 'epico', sprite: `${BASE}mago-berry.png`, description: 'Recupera PS en emergencia (Velocidad).', enabled: true },
  { id: 76, name: 'Baya Aguav', rarity: 'epico', sprite: `${BASE}aguav-berry.png`, description: 'Recupera PS en emergencia (Def. Esp.).', enabled: true },
  { id: 77, name: 'Baya Iapapa', rarity: 'epico', sprite: `${BASE}iapapa-berry.png`, description: 'Recupera PS en emergencia (Defensa).', enabled: true },
  { id: 78, name: 'Paquete Habilidad', rarity: 'epico', sprite: `${BASE}ability-capsule.png`, description: 'Cambia entre las 2 habilidades normales.', enabled: true },
  { id: 79, name: 'Parche Habilidad', rarity: 'epico', sprite: `${BASE}ability-patch.png`, description: 'Cambia a la habilidad oculta de un Pokemon.', enabled: true },
  { id: 80, name: 'Cinta Milagro', rarity: 'epico', sprite: `${BASE}lagging-tail.png`, description: 'Hace que el portador se mueva ultimo.', enabled: true },
  { id: 81, name: 'Cuchara Torcida', rarity: 'epico', sprite: `${BASE}twisted-spoon.png`, description: 'Potencia los movimientos de tipo Psiquico.', enabled: true },
  { id: 82, name: 'Palo Negro', rarity: 'epico', sprite: `${BASE}black-belt.png`, description: 'Potencia los movimientos de tipo Lucha.', enabled: true },
  { id: 83, name: 'Piedra Dura', rarity: 'epico', sprite: `${BASE}hard-stone.png`, description: 'Potencia los movimientos de tipo Roca.', enabled: true },
  { id: 84, name: 'Musgo Velo', rarity: 'epico', sprite: `${BASE}never-melt-ice.png`, description: 'Potencia los movimientos de tipo Hielo.', enabled: true },
  { id: 85, name: 'Cinta Mistica', rarity: 'epico', sprite: `${BASE}clear-bell.png`, description: 'Potencia los movimientos de tipo Hada.', enabled: true },
  { id: 86, name: 'Polvo Metalico', rarity: 'epico', sprite: `${BASE}metal-powder.png`, description: 'Sube la Defensa de Ditto.', enabled: true },
  { id: 87, name: 'Hueso Hueco', rarity: 'epico', sprite: `${BASE}thick-club.png`, description: 'Duplica el Ataque de Cubone y Marowak.', enabled: true },
  { id: 88, name: 'Mecha de Luz', rarity: 'epico', sprite: `${BASE}light-ball.png`, description: 'Duplica el Ataque Especial de Pikachu.', enabled: true },
  { id: 89, name: 'Escama Metal', rarity: 'epico', sprite: `${BASE}metal-coat.png`, description: 'Potencia Acero y evoluciona a ciertos Pokemon.', enabled: true },
  { id: 90, name: 'Capa Naranja', rarity: 'epico', sprite: `${BASE}king-s-rock.png`, description: 'Puede hacer retroceder al rival.', enabled: true },
  { id: 91, name: 'Colmillo Aguijon', rarity: 'epico', sprite: `${BASE}poison-barb.png`, description: 'Potencia los movimientos de tipo Veneno.', enabled: true },
  { id: 92, name: 'Ceniza Mistica', rarity: 'epico', sprite: `${BASE}sacred-ash.png`, description: 'Revive a todos los Pokemon del equipo.', enabled: true },
  { id: 93, name: 'Cinta Suave', rarity: 'epico', sprite: `${BASE}soothe-bell.png`, description: 'Aumenta la amistad del Pokemon.', enabled: true },
  { id: 94, name: 'Cuenta Suerte', rarity: 'epico', sprite: `${BASE}amulet-coin.png`, description: 'Duplica el dinero ganado en combate.', enabled: true },
  { id: 95, name: 'Parche Muscular', rarity: 'epico', sprite: `${BASE}muscle-band.png`, description: 'Potencia los movimientos fisicos.', enabled: true },
  { id: 96, name: 'Parche Sabio', rarity: 'epico', sprite: `${BASE}wise-glasses.png`, description: 'Potencia los movimientos especiales.', enabled: true },
  { id: 97, name: 'Garra Experta', rarity: 'epico', sprite: `${BASE}razor-claw.png`, description: 'Aumenta el indice de critico.', enabled: true },
  { id: 98, name: 'Colmillo Aguilar', rarity: 'epico', sprite: `${BASE}razor-fang.png`, description: 'Aumenta el indice de critico.', enabled: true },
  { id: 99, name: 'Baya Liechi', rarity: 'epico', sprite: `${BASE}liechi-berry.png`, description: 'Sube Ataque en emergencia.', enabled: true },
  { id: 100, name: 'Baya Ganlon', rarity: 'epico', sprite: `${BASE}ganlon-berry.png`, description: 'Sube Defensa en emergencia.', enabled: true },
  { id: 101, name: 'Baya Salac', rarity: 'epico', sprite: `${BASE}salac-berry.png`, description: 'Sube Velocidad en emergencia.', enabled: true },
  { id: 102, name: 'Baya Petaya', rarity: 'epico', sprite: `${BASE}petaya-berry.png`, description: 'Sube At. Especial en emergencia.', enabled: true },
  { id: 103, name: 'Baya Apicot', rarity: 'epico', sprite: `${BASE}apicot-berry.png`, description: 'Sube Def. Especial en emergencia.', enabled: true },
  { id: 104, name: 'Baya Lansat', rarity: 'epico', sprite: `${BASE}lansat-berry.png`, description: 'Aumenta el indice de critico en emergencia.', enabled: true },
  { id: 105, name: 'Baya Chiri', rarity: 'epico', sprite: `${BASE}cheri-berry.png`, description: 'Cura paralisis en emergencia.', enabled: true },
  { id: 106, name: 'Baya Nuez', rarity: 'epico', sprite: `${BASE}kebia-berry.png`, description: 'Reduce dano de tipo Veneno.', enabled: true },
  { id: 107, name: 'Baya Aturan', rarity: 'epico', sprite: `${BASE}shuca-berry.png`, description: 'Reduce dano de tipo Tierra.', enabled: true },
  { id: 108, name: 'Baya Kouba', rarity: 'epico', sprite: `${BASE}coba-berry.png`, description: 'Reduce dano de tipo Volador.', enabled: true },
  { id: 109, name: 'Baya Sapih', rarity: 'epico', sprite: `${BASE}passho-berry.png`, description: 'Reduce dano de tipo Agua.', enabled: true },
  { id: 110, name: 'Baya Tamate', rarity: 'epico', sprite: `${BASE}tamat-berry.png`, description: 'Reduce dano de tipo Electrico.', enabled: true },
  { id: 111, name: 'Baya Pinia', rarity: 'epico', sprite: `${BASE}pinap-berry.png`, description: 'Usada para crear Pokeballs.', enabled: true },
  { id: 112, name: 'Cinta Destino', rarity: 'epico', sprite: `${BASE}destiny-knot.png`, description: 'Transmite naturaleza al criar.', enabled: true },
  { id: 113, name: 'Incienso Suave', rarity: 'epico', sprite: `${BASE}sea-incense.png`, description: 'Potencia movimientos de tipo Agua.', enabled: true },
  { id: 114, name: 'Incienso Roca', rarity: 'epico', sprite: `${BASE}rock-incense.png`, description: 'Potencia movimientos de tipo Roca.', enabled: true },
  { id: 115, name: 'Incienso Planta', rarity: 'epico', sprite: `${BASE}rose-incense.png`, description: 'Potencia movimientos de tipo Planta.', enabled: true },
  { id: 116, name: 'Incienso Oleaje', rarity: 'epico', sprite: `${BASE}wave-incense.png`, description: 'Potencia movimientos de tipo Agua.', enabled: true },

  // ============================================================
  // LEGENDARIOS - Items de maxima rareza
  // ============================================================
  { id: 117, name: 'Caramelo Maestro', rarity: 'legendario', sprite: `${BASE}rare-candy.png`, description: 'Item mitico que potencia al maximo a un Pokemon.', enabled: true },
  { id: 118, name: 'Corona de Campeon', rarity: 'legendario', sprite: `${BASE}clear-bell.png`, description: 'Simbolo de grandeza suprema de un campeon.', enabled: true },
  { id: 119, name: 'Hoja Plateada', rarity: 'legendario', sprite: `${BASE}silver-leaf.png`, description: 'Item de coleccionista legendario de Plata.', enabled: true },
  { id: 120, name: 'Hoja Dorada', rarity: 'legendario', sprite: `${BASE}gold-leaf.png`, description: 'Brillo dorado de leyenda.', enabled: true },
  { id: 121, name: 'Pluma de Ho-Oh', rarity: 'legendario', sprite: `${BASE}rainbow-wing.png`, description: 'Pluma arcoiris del legendario Ho-Oh.', enabled: true },
  { id: 122, name: 'Pluma de Lugia', rarity: 'legendario', sprite: `${BASE}silver-wing.png`, description: 'Pluma plateada del legendario Lugia.', enabled: true },
  { id: 123, name: 'Fragmento Vida', rarity: 'legendario', sprite: `${BASE}large-leaf.png`, description: 'Fragmento legendario de energia vital.', enabled: true },
  { id: 124, name: 'Llamas Eternas', rarity: 'legendario', sprite: `${BASE}fire-stone.png`, description: 'Llama legendaria que nunca se apaga.', enabled: true },
  { id: 125, name: 'Espina Lunar', rarity: 'legendario', sprite: `${BASE}moon-stone.png`, description: 'Espina legendaria caida de la luna.', enabled: true },
  { id: 126, name: 'Colmillo del Trueno', rarity: 'legendario', sprite: `${BASE}thunder-stone.png`, description: 'Colmillo legendario de poder electrico.', enabled: true },
  { id: 127, name: 'Esencia Cristal', rarity: 'legendario', sprite: `${BASE}shiny-stone.png`, description: 'Esencia legendaria de cristal puro.', enabled: true },
  { id: 128, name: 'Garra de Dragon', rarity: 'legendario', sprite: `${BASE}dragon-scale.png`, description: 'Garra de dragon legendario.', enabled: true },
  { id: 129, name: 'Gema Oceano', rarity: 'legendario', sprite: `${BASE}water-stone.png`, description: 'Gema legendaria del oceano profundo.', enabled: true },
  { id: 130, name: 'Alma del Bosque', rarity: 'legendario', sprite: `${BASE}leaf-stone.png`, description: 'Alma legendaria del bosque antiguo.', enabled: true },
  { id: 131, name: 'Garra Oscura', rarity: 'legendario', sprite: `${BASE}dusk-stone.png`, description: 'Garra legendaria de la oscuridad.', enabled: true },
  { id: 132, name: 'Alba Radiante', rarity: 'legendario', sprite: `${BASE}dawn-stone.png`, description: 'Gema legendaria del amanecer.', enabled: true },
  { id: 133, name: 'Corona Solar', rarity: 'legendario', sprite: `${BASE}sun-stone.png`, description: 'Corona legendaria de poder solar.', enabled: true },
]

export default defaultItems
