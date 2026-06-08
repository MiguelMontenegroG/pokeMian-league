/**
 * Algoritmo de Generación de Enfrentamientos
 * 
 * Reglas:
 * - Todos contra todos (1 vuelta)
 * - Equipo que pelea en Fecha N, NO puede pelear en Fecha N+1 (descansa 1 fecha)
 * - Mínimo 4 equipos para generar enfrentamientos
 */

export interface Team {
  id: number
  teamName: string
  pokemons?: any[] // Opcional para validación
}

export interface Matchup {
  teamAId: number
  teamBId: number
  round: number
}

interface TeamSchedule {
  lastPlayedRound: number
  opponentIds: Set<number>
}

/**
 * Genera todos los enfrentamientos posibles respetando la regla de descanso
 */
export function generateMatchups(teams: Team[]): Matchup[] {
  const numTeams = teams.length
  
  // Validación mínima
  if (numTeams < 4) {
    throw new Error('Se necesitan al menos 4 equipos para generar enfrentamientos')
  }
  
  const matchups: Matchup[] = []
  const teamSchedules = new Map<number, TeamSchedule>()
  
  // Inicializar horarios de equipos
  teams.forEach(team => {
    teamSchedules.set(team.id, {
      lastPlayedRound: -999, // Nunca han jugado
      opponentIds: new Set<number>(), // Oponentes ya enfrentados
      roundsPlayed: 0 // Cantidad total de rondas jugadas
    })
  })
  
  // Calcular total de enfrentamientos necesarios
  const totalMatchesNeeded = (numTeams * (numTeams - 1)) / 2
  let matchesCreated = 0
  
  // Calcular rondas estimadas (con factor de holgura por descansos)
  const maxRounds = totalMatchesNeeded * 2
  let currentRound = 1
  
  while (matchesCreated < totalMatchesNeeded && currentRound <= maxRounds) {
    const roundMatchups: Matchup[] = []
    const teamsPlayingThisRound = new Set<number>()
    
    // PRIORIZAR equipos con MENOS rondas jugadas (para mantener parejo)
    const sortedTeams = [...teams].sort((a, b) => {
      const scheduleA = teamSchedules.get(a.id)!
      const scheduleB = teamSchedules.get(b.id)!
      return scheduleA.roundsPlayed - scheduleB.roundsPlayed
    })
    
    for (let i = 0; i < sortedTeams.length; i++) {
      const teamA = sortedTeams[i]
      
      // Si ya está jugando esta ronda, saltar
      if (teamsPlayingThisRound.has(teamA.id)) continue
      
      const scheduleA = teamSchedules.get(teamA.id)!
      
      // Verificar si puede jugar (regla de descanso)
      const canTeamAPlay = currentRound - scheduleA.lastPlayedRound >= 2
      
      if (!canTeamAPlay) continue
      
      // Buscar oponente disponible
      for (let j = i + 1; j < sortedTeams.length; j++) {
        const teamB = sortedTeams[j]
        
        if (teamsPlayingThisRound.has(teamB.id)) continue
        
        const scheduleB = teamSchedules.get(teamB.id)!
        
        // Ya jugaron entre ellos?
        if (scheduleA.opponentIds.has(teamB.id)) continue
        
        // Verificar regla de descanso
        const canTeamBPlay = currentRound - scheduleB.lastPlayedRound >= 2
        
        if (!canTeamBPlay) continue
        
        // ¡Enfrentamiento válido encontrado!
        roundMatchups.push({
          teamAId: teamA.id,
          teamBId: teamB.id,
          round: currentRound
        })
        
        teamsPlayingThisRound.add(teamA.id)
        teamsPlayingThisRound.add(teamB.id)
        
        // Actualizar horarios
        scheduleA.lastPlayedRound = currentRound
        scheduleA.opponentIds.add(teamB.id)
        scheduleA.roundsPlayed += 1
        
        scheduleB.lastPlayedRound = currentRound
        scheduleB.opponentIds.add(teamA.id)
        scheduleB.roundsPlayed += 1
        
        matchesCreated++
        break // Salir del loop interno, buscar siguiente pareja
      }
    }
    
    // Agregar enfrentamientos de esta ronda
    if (roundMatchups.length > 0) {
      matchups.push(...roundMatchups)
    }
    
    // Avanzar a la siguiente ronda
    currentRound++
  }
  
  // Verificación final
  if (matchesCreated < totalMatchesNeeded) {
    console.warn(
      `Advertencia: Solo se pudieron generar ${matchesCreated} de ${totalMatchesNeeded} enfrentamientos`
    )
  }
  
  return matchups
}

/**
 * Valida si es posible generar enfrentamientos
 */
export function canGenerateMatchups(teams: Team[]): { valid: boolean; message: string } {
  if (teams.length < 4) {
    return {
      valid: false,
      message: `Se necesitan al menos 4 equipos, actualmente hay ${teams.length}`
    }
  }
  
  // Verificar que todos los equipos tengan al menos 6 Pokémon (OPCIONAL por ahora)
  // Comentado para permitir generación sin validar Pokémon
  /*
  const teamsWithoutEnoughPokemon = teams.filter(t => t.pokemons?.length < 6)
  if (teamsWithoutEnoughPokemon.length > 0) {
    return {
      valid: false,
      message: `${teamsWithoutEnoughPokemon.length} equipo(s) no tienen al menos 6 Pokémon`
    }
  }
  */
  
  return {
    valid: true,
    message: 'Listo para generar enfrentamientos'
  }
}

/**
 * Calcula estadísticas del calendario generado
 */
export function getMatchupStats(matchups: Matchup[]) {
  const rounds = new Set(matchups.map(m => m.round))
  const teams = new Set<number>()
  
  matchups.forEach(m => {
    teams.add(m.teamAId)
    teams.add(m.teamBId)
  })
  
  const matchesPerTeam = new Map<number, number>()
  matchups.forEach(m => {
    matchesPerTeam.set(m.teamAId, (matchesPerTeam.get(m.teamAId) || 0) + 1)
    matchesPerTeam.set(m.teamBId, (matchesPerTeam.get(m.teamBId) || 0) + 1)
  })
  
  return {
    totalMatches: matchups.length,
    totalRounds: rounds.size,
    totalTeams: teams.size,
    matchesPerTeam: Object.fromEntries(matchesPerTeam),
    averageMatchesPerRound: matchups.length / rounds.size
  }
}
