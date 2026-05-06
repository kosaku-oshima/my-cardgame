const players = [
    {
        name : "player",
        hp : 20,
        maxPp : 0,
        currentPp : 0,
        deck : [],
        hand : [],
        field : [],
        cemetery : [],
        playOrder : 0,
    },
    {
        name : "cpu",
        hp : 20,
        maxPp : 0,
        currentPp : 0,
        deck : [],
        hand : [],
        field : [],
        cemetery : [],
        playOrder : 1,
    }
];

const cards = [
    // type(カードの種類),name、hp(Hit Point),at(Attack Point),cost,isInactivated(1=行動不可、フォロワーでのみ使用)
    {
        type : "follower",
        name : "エルフの剣士",
        hp : 1,
        at : 1,
        cost : 1,
    },
    {
        type : "follower",
        name : "砦を守る翼竜",
        hp : 2,
        at : 1,
        cost : 1,
    },
    {
        type : "follower",
        name : "グレムリン",
        hp : 1,
        at : 2,
        cost : 1,
    },
];

//カードプールからデッキを作る関数。今はcard配列をそのままセット
//followerカードの場合はcurrentHpとcurrentAtをセットし、isInactivatedをtrueにする
function createDeck(player, cards) {
    if (cards && player.deck.length === 0) {
        player.deck = cards.map(card => {
            if (card.type !== "follower") {
                return { ...card };
            }
            return {
                ...card,
                currentHp: card.hp,
                currentAt: card.at,
                isInactivated: true,
            };
        });
        console.log("デッキを作成しました。");
        console.table(player.deck);
    }
}

//デッキをシャッフルする関数
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      // 0～iのランダムなインデックスを取得
      const j = Math.floor(Math.random() * (i + 1));
      // 要素を入れ替える（分割代入）
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    console.log("デッキをシャッフルしました");
    return deck;
  }

//ppの上限を+1して全回復する関数。最大10まで。
function recoveryPp (player) {
    const maxLimitPp = 10;
    if (player.maxPp < maxLimitPp) {
        player.maxPp += 1;
        console.log(`${player.name}の最大PPが+1され${player.maxPp}になりました。`);    
    }
    player.currentPp = player.maxPp;
    console.log(`${player.name}のPPが回復し${player.maxPp}になりました。`);    
}

//fieldのfollowerカードのisInactivatedをfalseにする関数
function activateFollower(field) {
    if (field.length === 0 ) {
        console.log("フィールドにカードがないためactiveFollowerは無効です。");
        return;
    }
    field.forEach(card => {
        if (card.type !== "follower") {
            console.log(`${card.name}はフォロワーではありません`);
            return;
        }
        card.isInactivated = false;
        console.log(`${card.name}を活性化しました。`);
    });
}

// followerカードの場合はisInactivatedをtrueにする関数
function deactivateFollower(card) {
    if (card.type !== "follower") {
        console.log(`${card.name}はフォロワーではありません`);
        return;
    }
    card.isInactivated = true;
    console.log(`${card.name}を非活性化しました。`);
}

//カードを1枚ドローする関数
function drawCard (player) {
    if (player.deck.length > 0) {
        player.hand.push(player.deck.shift());
        console.log(`${player.name}の手札が1枚増えました。`);
        console.table(player.hand);
    }
}

//手札から場にカードを出す関数
function playCard (player, card) {
    const fieldMaxLength = 3;
    const cardIndex = player.hand.indexOf(card);

    if (player.currentPp < card.cost) {
        alert("PPが足りません");
        return;
    }
    if (player.field.length >= fieldMaxLength) {
        alert("フィールドに空きがありません");
        return;
    }

    if (cardIndex === -1) {
      alert("そのカードは手札にありません");
      return;
    }
  
    player.hand.splice(cardIndex, 1);
    player.field.push(card);
    player.currentPp -= card.cost;
  
    console.log(`${card.name}を場に出しました`);
}

//バトル処理の関数
function battle(attackPlayer, attacker, defendPlayer, defender) {
    if (!attacker || !defender) {
        console.log("攻撃側または防御側のカードが存在しません。");
        return;
    }
    if (attacker.isInactivated) {
        console.log("そのカードは攻撃できません。");
        return;
    }
    deactivateFollower(attacker);
    defender.currentHp -= attacker.currentAt;
    attacker.currentHp -= defender.currentAt;
    console.log(`${attacker.name}が${defender.name}を攻撃しました。`);
    console.log(`${defender.name}の残りHP: ${defender.currentHp}`);
    console.log(`${attacker.name}の残りHP: ${attacker.currentHp}`);
    if (defender.currentHp <= 0) {
        sendToCemetery(defendPlayer, defender);
    }
    if (attacker.currentHp <= 0) {
        sendToCemetery(attackPlayer, attacker);
    }
}

//カードを墓地に送る関数
function sendToCemetery(player, card) {
    const cardIndex = player.field.indexOf(card);
    if (cardIndex === -1) {
        console.log(`${card.name}はフィールドに存在しません。`);
        return;
    }
    player.field.splice(cardIndex, 1);
    player.cemetery.push(card);
    console.log(`${card.name}を墓地に送りました。`);
}

//プレイヤーを攻撃する関数
function attackLeader(attacker, targetLeader) {
    if (!attacker || !targetLeader) {
        console.log("攻撃側カードまたは防御側プレイヤーが存在しません。");
        return;
    }
    if (attacker.isInactivated) {
        console.log("そのカードは攻撃できません。");
        return;
    }
    console.log(`${attacker.name}が${targetLeader.name}を攻撃しました。`);
    deactivateFollower(attacker);
    targetLeader.hp -= attacker.currentAt;
    if (targetLeader.hp <= 0) {
        targetLeader.hp = 0;
    }
    console.log(`${targetLeader.name}の残りHP: ${targetLeader.hp}`);
}

//勝敗を判定する関数
function checkWinner(players) {
    if (players[0].hp <= 0) {
        console.log(`${players[1].name}の勝ちです。`);
        return players[1];
    }
    if (players[1].hp <= 0) {
        console.log(`${players[0].name}の勝ちです。`);
        return players[0];
    }
    return null;
}

//現在プレイしているプレイヤーを返す関数
function getCurrentPlayer() {
    return players[currentPlayerIndex];
}

//現在の相手プレイヤーを返す関数
function getOpponentPlayer() {
    return players[currentPlayerIndex === 0 ? 1 : 0];
}

//ターンプレイヤーを交代させる関数
function switchTurn() {
    //3項演算子「条件 ? 条件がtrueのときの値 : 条件がfalseのときの値」
    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
}

//ゲーム開始時の処理
function startGame(players) {
    console.log("ゲームを始めます。");
    createDeck(players[0], cards);
    shuffleDeck(players[0].deck);
    createDeck(players[1], cards);
    shuffleDeck(players[1].deck);
}

//【フェーズ管理】ターン開始時の処理
function startPhase(player) {
    console.log(`${player.name}のターンを始めます`);
    recoveryPp(player);
    activateFollower(player.field);
    drawCard(player);
}

//【フェーズ管理】メインフェイズ（行動）の処理
function mainPhase(player, opponentPlayer) {
    console.log(`${player.name}のメインフェイズを始めます。`);
    if (player.name === "cpu") {
        cpuAction(player, opponentPlayer);
        finishTurn();
    }
}

//【フェーズ管理】ターン終了時の処理
function endPhase(player) {
    console.log(`${player.name}のターンを終了します`);
    switchTurn();
}

//1ターンの流れを管理
function turnCycle() {
    const currentPlayer = getCurrentPlayer();
    const currentOpponentPlayer = getOpponentPlayer();
    startPhase(currentPlayer);
    mainPhase(currentPlayer, currentOpponentPlayer);
}

//1ターンの終了処理、HTML側で操作されたら呼ぶ想定
function finishTurn() {
    const currentPlayer = getCurrentPlayer();
    endPhase(currentPlayer);
    const winner = checkWinner(players);
    if (winner) {
        console.log(`ゲーム終了：${winner.name}の勝利`);
        return;
    }
    turnCycle();
}

//cpuの行動
function cpuAction(cpu, opponentPlayer) {
    if (cpu.name !== "cpu") {
        console.log("CPUのターンではないのにcpuActionが呼ばれました。");
        return;
    }
    //手札に出せるカードがあれば出す
    if (cpu.hand.length > 0) {
        const playableCards = cpu.hand.filter(card => card.cost <= cpu.currentPp);
        //一番ATが高いカードを抽出
        if (playableCards.length > 0) {
            const highestAtCard = playableCards.reduce((a, b) => (a.currentAt > b.currentAt ? a : b));
            playCard(cpu, highestAtCard);    
        }
    }
    //攻撃可能なカードがあり、かつ倒せるフォロワーがいれば攻撃する
    const attackableCards = cpu.field.filter(card => card.type === "follower" && card.isInactivated === false);
    if (attackableCards.length > 0) {
        const attacker = attackableCards.reduce((a, b) => (a.currentAt > b.currentAt ? a : b));
        const targetCards = opponentPlayer.field.filter(card => card.type === "follower" && attacker.currentAt >= card.currentHp);
        if (targetCards.length > 0) {
            const target = targetCards.reduce((a, b) => (a.currentAt > b.currentAt ? a : b));
            battle(cpu, attacker, opponentPlayer, target);
        } else {
            attackLeader(attacker, opponentPlayer);
        }
    }    
}

//テストで使う確認用の関数
function showPlayerState(player) {
    console.log(`=== ${player.name}の状態 ===`);
    console.log(`HP: ${player.hp}`);
    console.log(`PP: ${player.currentPp}/${player.maxPp}`);

    console.log("デッキ");
    console.table(player.deck);

    console.log("手札");
    console.table(player.hand);

    console.log("フィールド");
    console.table(player.field);

    console.log("墓地");
    console.table(player.cemetery);
}


// ====================================
// ここからターン管理
// ====================================
let currentPlayerIndex = 0;

//ゲーム開始
startGame(players);

//ターン処理
turnCycle();
// startPhase(players[0]);
// playCard(players[0], players[0].hand[0]);
// endPhase(players[0]);

// startPhase(players[1]);
// playCard(players[1], players[1].hand[0]);
// endPhase(players[1]);

// startTurn(players[0]);
// playCard(players[0], players[0].hand[0]);
// battle(players[0], players[0].field[0], players[1], players[1].field[0]);
// attackLeader(players[0].field[0], players[1]);
// checkWinner(players);
// endTurn(players[0]);