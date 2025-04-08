import React, { useState } from "react";

export default function App() {
  const [playerCount, setPlayerCount] = useState(3);
  const [gora, setGora] = useState(["", "", "", ""]);
  const [vists, setVists] = useState({
    0: { 1: "", 2: "", 3: "" },
    1: { 0: "", 2: "", 3: "" },
    2: { 0: "", 1: "", 3: "" },
    3: { 0: "", 1: "", 2: "" },
  });
  const [rate, setRate] = useState("");
  const [results, setResults] = useState(["", "", "", ""]);

  function generateVistsState(count) {
    const obj = {};
    for (let i = 0; i < 4; i++) {
      obj[i] = {};
      for (let j = 0; j < 4; j++) {
        if (i !== j && j < count) {
          obj[i][j] = "";
        }
      }
    }
    return obj;
  }

  const handleGoraChange = (index, value) => {
    const updated = [...gora];
    updated[index] = value;
    setGora(updated);
  };

  const handleVistChange = (from, to, value) => {
    setVists((prev) => ({
      ...prev,
      [from]: {
        ...prev[from],
        [to]: value,
      },
    }));
  };

  const handleCalculate = () => {
    const tmpVistsList = JSON.parse(JSON.stringify(vists));

    const normalizeGora = (gorList) => {
      const minG = Math.min(...gorList.slice(0, playerCount));
      const reducedGora = gorList.map((val) => val - minG);
      console.log(reducedGora);
      return reducedGora.map((g, playerNum) => {
        if (!isFinite(g)) {
          return 0;
        }

        if (g % playerCount === 0) {
          return (g * 10) / playerCount;
        }

        if ((g + 1) % playerCount === 0) {
          for (let i = 0; i < playerCount - (playerNum + 1); i++) {
            tmpVistsList[i + 1 + playerNum][playerNum] = +tmpVistsList[i + 1 + playerNum][playerNum] - 3;
          }

          for (let j = playerNum; j > 0; j--) {
            tmpVistsList[j - 1][playerNum] = +tmpVistsList[j - 1][playerNum] - 3;
          }

          
          return ((g + 1) * 10) / 3;
        }

        if ((g - 1) % playerCount === 0) {
          for (let i = 0; i < playerCount - (playerNum + 1); i++) {
            tmpVistsList[i + 1 + playerNum][playerNum] = +tmpVistsList[i + 1 + playerNum][playerNum] + 3;
          }

          for (let j = playerNum; j > 0; j--) {
            tmpVistsList[j - 1][playerNum] = +tmpVistsList[j - 1][playerNum] + 3;
          }
          return ((g - 1) * 10) / 3;
        }
      });
    }
    const gorPoints = normalizeGora(gora.map((p) => +p));

   
    for (let i = 0; i < playerCount; i++) {

      const accum = {};
      Object.entries(tmpVistsList[i]).forEach(([idx, value]) => {
        accum[+idx] = +value + +gorPoints[+idx];
      });
      tmpVistsList[i] = accum;
    }
    console.log('combinedGorVists', tmpVistsList);

    // взаимный вычет вистов
    for (let i = 0; i < playerCount; i++) {
      for (let j = i + 1; j < playerCount; j++) {
        const tmp1 = tmpVistsList[i][j];
        const tmp2 = tmpVistsList[j][i];

        tmpVistsList[i][j] = tmp1 - tmp2;
        tmpVistsList[j][i] = tmp2 - tmp1;
      }
    }

    console.log('pureVists', tmpVistsList);

    // суммирование вистов
    const pureSummedVists = [];
    for (let i = 0; i < playerCount; i++) {
      if (playerCount === 3) {
        tmpVistsList[i][3] = 0;
      }
      pureSummedVists[i] = Object.values(tmpVistsList[i]).reduce((accum, value) => accum + value, 0);
    }

    console.log('pureSummedVists', pureSummedVists);

    setResults(pureSummedVists);
  };

  const renderPlayer = (index, label, positionClass) => {
    if (index >= playerCount) return null;

    const vistTargets = Array(playerCount)
      .fill(0)
      .map((_, i) => i)
      .filter((i) => i !== index);

    return (
      <div className={`player ${positionClass}`} key={index}>
        <div className="label">{label}</div>
        <input
          type="number"
          placeholder="гора"
          value={gora[index]}
          onChange={(e) => handleGoraChange(index, e.target.value)}
        />
        <div className="vists">
          {vistTargets.map((to) => (
            <input
              key={to}
              type="number"
              placeholder={`→ ${to + 1}`}
              value={vists[index]?.[to] || ""}
              onChange={(e) => handleVistChange(index, to, e.target.value)}
            />
          ))}
        </div>
        {results[index] !== "" && (
          <div
            className={
              results[index] > 0 ? "result plus" : results[index] < 0 ? "result minus" : "result"
            }
          >
            {results[index] > 0 ? `+${results[index] * (rate || 1)} ₽` : `${results[index] * (rate || 1)} ₽`}
          </div>
        )}
      </div>
    );
  };

  const positions = ["north", "west", "east", "south"];
  const labels = ["Игрок 1", "Игрок 2", "Игрок 3", "Игрок 4"];

  const handlePlayerCountToggle = (isFourPlayers) => {
    const count = isFourPlayers ? 4 : 3;
    setPlayerCount(count);
    setVists((prev) => ({
      ...generateVistsState(count),
      ...prev,
    }));
  };

  return (
    <div className="wrapper">
      {Array(4)
        .fill(0)
        .map((_, i) => renderPlayer(i, labels[i], positions[i]))}

      <div className="center">
        <input
          type="number"
          placeholder="1 вист = 1 руб"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <button onClick={handleCalculate}>Рассчитать</button>
        {/* <div className="toggle">
          <label>
            <input
              type="checkbox"
              checked={playerCount === 4}
              onChange={(e) => handlePlayerCountToggle(e.target.checked)}
            />
            &nbsp;4 игрока
          </label>
        </div> */}
      </div>
    </div>
  );
}