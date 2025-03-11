import { useState } from 'react'
import './index.css'

function App() {
  const [players, setPlayers] = useState({
    player1: { name: '', scores: [], totalScore: 0, isE: false },
    player2: { name: '', scores: [], totalScore: 0, isE: false },
    player3: { name: '', scores: [], totalScore: 0, isE: false },
    player4: { name: '', scores: [], totalScore: 0, isE: false }
  })

  const [roundWinner, setRoundWinner] = useState(null)

  const handleNameChange = (e, playerKey) => {
    setPlayers({
      ...players,
      [playerKey]: {
        ...players[playerKey],
        name: e.target.value
      }
    })
  }

  function calculateFinalScores(roundScores, selectedWinner, ePlayer) {
    let finalScores = { ...roundScores }
    
    // Step 1: Winner takes points from everyone
    const winnerPoints = roundScores[selectedWinner]
    Object.keys(roundScores).forEach(playerKey => {
      if (playerKey !== selectedWinner) {
        // Double points if either the winner or the losing player is E
        const multiplier = (selectedWinner === ePlayer || playerKey === ePlayer) ? 2 : 1
        const pointsToTake = winnerPoints * multiplier
        finalScores[playerKey] -= pointsToTake
        finalScores[selectedWinner] += pointsToTake
      }
    })
  
    // Step 2: Calculate differences based on initial scores
    const sortedPlayers = Object.entries(roundScores)
      .filter(([key]) => key !== selectedWinner)
      .sort(([, a], [, b]) => b - a)
  
    // Process differences with double points for E player
    for (let i = 0; i < sortedPlayers.length - 1; i++) {
      const [currentPlayer, currentScore] = sortedPlayers[i]
      
      for (let j = i + 1; j < sortedPlayers.length; j++) {
        const [targetPlayer, targetScore] = sortedPlayers[j]
        let difference = currentScore - targetScore
        
        // Double the difference if either player is E
        const multiplier = (currentPlayer === ePlayer || targetPlayer === ePlayer) ? 2 : 1
        difference *= multiplier
        
        finalScores[currentPlayer] += difference
        finalScores[targetPlayer] -= difference
      }
    }
  
    return finalScores
  }
  
  const addNewRoundScores = () => {
    // Reset previous E role
    const resetPlayers = Object.keys(players).reduce((acc, key) => ({
      ...acc,
      [key]: { ...players[key], isE: false }
    }), {})
    setPlayers(resetPlayers)

    // Collect scores
    const roundScores = {}
    Object.keys(players).forEach(playerKey => {
      const score = parseInt(prompt(`Enter score for ${players[playerKey].name || playerKey}:`)) || 0
      roundScores[playerKey] = score
    })

    // Select winner
    const winnerSelection = prompt(
      `Select round winner (1-4):\n${
        Object.keys(players).map((playerKey, index) => 
          `${index + 1}: ${players[playerKey].name || playerKey} - Score: ${roundScores[playerKey]}`
        ).join('\n')
      }`
    )
    const selectedWinner = `player${winnerSelection}`
    setRoundWinner(selectedWinner)

    // Select who is E
    const ePlayerSelection = prompt(
      `Select who is E (1-4):\n${
        Object.keys(players).map((playerKey, index) => 
          `${index + 1}: ${players[playerKey].name || playerKey}`
        ).join('\n')
      }`
    )
    const ePlayer = `player${ePlayerSelection}`

    // Calculate final scores
    const finalScores = calculateFinalScores(roundScores, selectedWinner, ePlayer)

    // Update players with final scores
    Object.keys(players).forEach(playerKey => {
      setPlayers(prev => ({
        ...prev,
        [playerKey]: {
          ...prev[playerKey],
          scores: [...prev[playerKey].scores, finalScores[playerKey]],
          totalScore: prev[playerKey].totalScore + finalScores[playerKey],
          isE: playerKey === ePlayer
        }
      }))
    })
  }

  return (
    <div className="container">
      <h1>Score Tracker</h1>
      
      <div className="player-inputs">
        {Object.keys(players).map((playerKey, index) => (
          <div key={playerKey} className="player-box">
            <input
              type="text"
              value={players[playerKey].name}
              onChange={(e) => handleNameChange(e, playerKey)}
              placeholder={`Player ${index + 1} name`}
            />
            <div className="score-info">
              <div>Round Scores: {players[playerKey].scores.join(', ')}</div>
              <div>Total Score: {players[playerKey].totalScore}</div>
              {players[playerKey].isE && <div className="e-badge">E</div>}
              {roundWinner === playerKey && <div className="winner-badge">Round Winner!</div>}
            </div>
          </div>
        ))}
      </div>

      <button onClick={addNewRoundScores} className="new-round-btn">Add Round Scores</button>
    </div>
  )
}
export default App