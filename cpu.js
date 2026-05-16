// cpu.js

//待ち時間の定数。CPUのターンのスピードはこの定数で調節する。
const CPU_WAIT_SHORT = 800;
const CPU_WAIT_NORMAL = 1200;

export async function cpuAction(cpu, opponentPlayer, helpers) {
    const {
      players,
      isGameOver,
      playCard,
      battle,
      attackLeader,
      renderGame,
      displayMessageWithActions,
      wait,
    } = helpers;
  
    if (cpu.name !== "cpu") {
      console.log("CPUのターンではないのにcpuActionが呼ばれました。");
      return;
    }
  
    if (isGameOver()) {
      return;
    }
  
    function getAt(card) {
      return card.currentAt ?? card.at ?? 0;
    }
  
    function getHp(card) {
      return card.currentHp ?? card.hp ?? 0;
    }
  
    function getCardValue(card) {
      const at = getAt(card);
      const hp = getHp(card);
      const cost = card.cost ?? 0;
  
      return at * 2.2 + hp * 1.4 + cost * 0.5;
    }
  
    function chooseBestCardsToPlay() {
      const fieldMaxLength = 3;
      const emptySlots = fieldMaxLength - cpu.field.length;
  
      if (emptySlots <= 0) {
        return [];
      }
  
      const playableCards = cpu.hand.filter(card => {
        return card.type === "follower" && card.cost <= cpu.currentPp;
      });
  
      if (playableCards.length === 0) {
        return [];
      }
  
      let bestCards = [];
      let bestScore = -Infinity;
  
      function search(startIndex, selectedCards, totalCost) {
        if (selectedCards.length > emptySlots) {
          return;
        }
  
        if (totalCost > cpu.currentPp) {
          return;
        }
  
        if (selectedCards.length > 0) {
          const totalValue = selectedCards.reduce((sum, card) => {
            return sum + getCardValue(card);
          }, 0);
  
          const unusedPp = cpu.currentPp - totalCost;
          const cardCountBonus = selectedCards.length * 1.2;
          const score = totalValue - unusedPp * 0.8 + cardCountBonus;
  
          if (score > bestScore) {
            bestScore = score;
            bestCards = [...selectedCards];
          }
        }
  
        for (let i = startIndex; i < playableCards.length; i++) {
          const card = playableCards[i];
          search(i + 1, [...selectedCards, card], totalCost + card.cost);
        }
      }
  
      search(0, [], 0);
  
      bestCards.sort((a, b) => a.cost - b.cost);
  
      return bestCards;
    }
  
    async function playBestCards() {
      while (true) {
        if (isGameOver()) {
          return;
        }
    
        if (cpu.field.length >= 3) {
          return;
        }
    
        const cardsToPlay = chooseBestCardsToPlay();
    
        if (cardsToPlay.length === 0) {
          return;
        }
    
        let playedAnyCard = false;
    
        for (const card of cardsToPlay) {
          if (isGameOver()) {
            return;
          }
    
          if (!cpu.hand.includes(card)) {
            continue;
          }
    
          if (cpu.currentPp < card.cost) {
            continue;
          }
    
          if (cpu.field.length >= 3) {
            return;
          }
    
          displayMessageWithActions(`CPUは「${card.name}」を場に出します。`);
          await wait(CPU_WAIT_NORMAL);
    
          playCard(cpu, card);
          console.log(`CPUは${card.name}を場に出しました。`);
          playedAnyCard = true;
    
          renderGame(players);
          await wait(CPU_WAIT_SHORT);
        }
    
        renderGame(players);
    
        if (!playedAnyCard) {
          return;
        }
      }
    }
  
    function getAttackableCards() {
      return cpu.field.filter(card => {
        return card.type === "follower" && card.isInactivated === false;
      });
    }
  
    function canDefeat(attacker, defender) {
      return getAt(attacker) >= getHp(defender);
    }
  
    function willAttackerSurvive(attacker, defender) {
      return getHp(attacker) > getAt(defender);
    }
  
    function chooseBestAttack() {
      const attackableCards = getAttackableCards();
  
      if (attackableCards.length === 0) {
        return null;
      }
  
      const lethalAttackers = attackableCards.filter(attacker => {
        return getAt(attacker) >= opponentPlayer.hp;
      });
  
      if (lethalAttackers.length > 0) {
        lethalAttackers.sort((a, b) => getAt(a) - getAt(b));
  
        return {
          type: "leader",
          attacker: lethalAttackers[0],
          score: 999999,
        };
      }
  
      let bestMove = null;
      let bestScore = -Infinity;
  
      attackableCards.forEach(attacker => {
        const attackerValue = getCardValue(attacker);
  
        opponentPlayer.field.forEach(defender => {
          if (defender.type !== "follower") {
            return;
          }
  
          const defenderValue = getCardValue(defender);
          const defenderDies = canDefeat(attacker, defender);
          const attackerSurvives = willAttackerSurvive(attacker, defender);
  
          let score = 0;
  
          if (defenderDies) {
            score += defenderValue * 2.0;
          } else {
            score += getAt(attacker) * 0.6;
          }
  
          if (attackerSurvives) {
            score += attackerValue * 0.8;
          } else {
            score -= attackerValue * 1.6;
          }
  
          score += getAt(defender) * 1.2;
          score += Math.max(0, getAt(attacker) - getHp(defender)) * 0.5;
  
          if (defenderDies && !attackerSurvives && defenderValue > attackerValue) {
            score += (defenderValue - attackerValue) * 2.5;
          }
  
          if (cpu.hp <= 8) {
            score += getAt(defender) * 1.2;
          }
  
          if (score > bestScore) {
            bestScore = score;
            bestMove = {
              type: "follower",
              attacker,
              target: defender,
              score,
            };
          }
        });
  
        let leaderAttackScore = getAt(attacker) * 2.2;
  
        if (opponentPlayer.hp <= 10) {
          leaderAttackScore += getAt(attacker) * 2.0;
        }
  
        if (opponentPlayer.hp <= 6) {
          leaderAttackScore += getAt(attacker) * 3.0;
        }
  
        const opponentThreat = opponentPlayer.field.reduce((sum, card) => {
          return sum + getAt(card);
        }, 0);
  
        if (opponentThreat >= cpu.hp) {
          leaderAttackScore -= opponentThreat * 2.5;
        } else {
          leaderAttackScore -= opponentThreat * 0.3;
        }
  
        if (opponentPlayer.field.length === 0) {
          leaderAttackScore += 8;
        }
  
        if (leaderAttackScore > bestScore) {
          bestScore = leaderAttackScore;
          bestMove = {
            type: "leader",
            attacker,
            score: leaderAttackScore,
          };
        }
      });
  
      return bestMove;
    }
  
    async function attackBestTargets() {
      while (true) {
        if (isGameOver()) {
          return;
        }
    
        const move = chooseBestAttack();
    
        if (!move) {
          return;
        }
    
        if (move.type === "leader") {
          displayMessageWithActions(`CPUの「${move.attacker.name}」がプレイヤーリーダーを攻撃します。`);
          await wait(CPU_WAIT_NORMAL);
    
          console.log(`CPUは${move.attacker.name}でプレイヤーリーダーを攻撃します。`);
          attackLeader(move.attacker, opponentPlayer);
          renderGame(players);
    
          await wait(CPU_WAIT_SHORT);
    
          if (isGameOver()) {
            return;
          }
        }
    
        if (move.type === "follower") {
          displayMessageWithActions(`CPUの「${move.attacker.name}」が「${move.target.name}」を攻撃します。`);
          await wait(CPU_WAIT_NORMAL);
    
          console.log(`CPUは${move.attacker.name}で${move.target.name}を攻撃します。`);
          battle(cpu, move.attacker, opponentPlayer, move.target);
          renderGame(players);
    
          await wait(CPU_WAIT_SHORT);
    
          if (isGameOver()) {
            return;
          }
        }
      }
    }
  
    renderGame(players);
    await wait(CPU_WAIT_NORMAL);

    await playBestCards();

    if (isGameOver()) {
      return;
    }

    await attackBestTargets();

    if (isGameOver()) {
      return;
    }

    await playBestCards();

    if (isGameOver()) {
      return;
    }

    displayMessageWithActions("CPUの行動が終了しました。");
    renderGame(players);
    await wait(CPU_WAIT_SHORT);

  }