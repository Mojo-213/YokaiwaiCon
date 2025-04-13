import React, { useState } from 'react';

export default function App() {
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState('');
  const [races, setRaces] = useState([]);
  const [currentRace, setCurrentRace] = useState(Array(4).fill(''));
  const [showRaces, setShowRaces] = useState(false);
  const [sortBy, setSortBy] = useState('elo'); // oder "score"
  const calculateScore = (player) => {
    if (player.races === 0) return -Infinity; // Für Sortierung
    return (player.elo - 1000) / Math.sqrt(player.races);
  };
  const [showFullList, setShowFullList] = useState(false);

  const addPlayer = () => {
    if (newPlayer.trim() === '') return;
    setPlayers([
      ...players,
      {
        name: newPlayer.trim(),
        elo: 1000,
        races: 0,
      },
    ]);
    setNewPlayer('');
  };
  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'elo') {
      return b.elo - a.elo;
    } else {
      return calculateScore(b) - calculateScore(a);
    }
  });
  const visiblePlayers = showFullList
    ? sortedPlayers
    : sortedPlayers.slice(0, 8);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'top',
        alignItems: 'center',
        flexDirection: 'column',
        minHeight: '100vh',
        textAlign: 'center',
      }}
    >
      <h1>Mario Kart Turnier</h1>

      <input
        type="text"
        value={newPlayer}
        onChange={(e) => setNewPlayer(e.target.value)}
        placeholder="Spielername"
      />
      <button onClick={addPlayer}>Hinzufügen</button>
      <button onClick={() => setSortBy(sortBy === 'elo' ? 'score' : 'elo')}>
        Nach {sortBy === 'elo' ? 'Score' : 'Elo'} sortieren
      </button>
      <button onClick={() => setShowFullList(!showFullList)}>
        {showFullList ? 'Nur Top 8 anzeigen' : 'Alle Spieler anzeigen'}
      </button>

      <h2>Spielerliste</h2>
      <ul style={{ textAlign: 'left' }}>
        {visiblePlayers.map((player, index) => (
          <li key={index}>
            {player.name} - Elo: {player.elo} - Rennen: {player.races} – Score:{' '}
            {player.races > 0 ? Math.round(calculateScore(player)) : '–'}
          </li>
        ))}
      </ul>

      <h2>Neues Rennen</h2>
      {currentRace.map((name, index) => (
        <div key={index}>
          <label>Platz {index + 1}: </label>
          <select
            value={name}
            onChange={(e) => {
              const updatedRace = [...currentRace];
              updatedRace[index] = e.target.value;
              setCurrentRace(updatedRace);
            }}
          >
            <option value="">-- Spieler auswählen --</option>
            {players
              .filter((p) => !currentRace.includes(p.name) || p.name === name)
              .map((player, i) => (
                <option key={i} value={player.name}>
                  {player.name}
                </option>
              ))}
          </select>
        </div>
      ))}
      <button
        onClick={() => {
          if (currentRace.some((name) => name.trim() === '')) return;
          // Rennen speichern und Elo berechnen
          const raceWithObjects = currentRace.map((name) =>
            players.find((p) => p.name === name)
          );

          // Elo-Funktion: Platzierungsbasierte Punkte
          const placementPoints = [60, 40, 10, -20];
          const averageOpponentElo =
            raceWithObjects.reduce((sum, p) => sum + p.elo, 0) / 4;

          const updatedPlayers = players.map((player) => {
            const raceIndex = currentRace.indexOf(player.name);
            if (raceIndex === -1) return player; // Spieler war in diesem Rennen nicht dabei

            const rawPoints = placementPoints[raceIndex];
            let adjustedPoints = 0;

            if (rawPoints >= 0) {
              adjustedPoints =
                rawPoints * (averageOpponentElo / player.elo) ** 2;
            } else {
              adjustedPoints =
                rawPoints * (player.elo / averageOpponentElo) ** 2;
            }

            const finalPoints = Math.round(adjustedPoints);

            return {
              ...player,
              elo: player.elo + finalPoints,
              races: player.races + 1,
            };
          });

          setPlayers(updatedPlayers);
          setRaces([...races, currentRace]);
          setCurrentRace(Array(4).fill(''));
        }}
      >
        Rennen speichern
      </button>
      <button onClick={() => setShowRaces(!showRaces)}>
        {showRaces ? 'Rennen ausblenden' : 'Rennen anzeigen'}
      </button>

      {showRaces && (
        <>
          <h2>Alle Rennen</h2>
          <ol>
            {races.map((race, idx) => (
              <li key={idx}>
                Rennen {idx + 1}:{' '}
                {race.map((name, i) => `#${i + 1} ${name}`).join(', ')}
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  );
}
