// cpu.js

//待ち時間の定数。CPUのターンのスピードはこの定数で調節する。
const CPU_WAIT_SHORT = 800;
const CPU_WAIT_NORMAL = 1200;

export async function cpuAction(cpu, opponentPlayer, helpers) {
    //helpersから、この関数内で使う関数や値を取り出す
    const {
        players,
        isGameOver,
        moveHandToField,
        battle,
        attackLeader,
        renderGame,
        displayMessageWithActions,
        wait,
    } = helpers;

    // CPU以外に対して呼ばれていたら処理しない
    if (cpu.name !== "cpu") {
        console.log("CPUのターンではないのにcpuActionが呼ばれました。");
        return;
    }
    // ゲームが終了していたら処理しない
    if (isGameOver()) {
        return;
    }

    //カードのATを取得する関数
    function getAt(card) {
        return card.currentAt ?? card.at ?? 0;
    }

    //カードのHPを取得する関数
    function getHp(card) {
        return card.currentHp ?? card.hp ?? 0;
    }

    //カードのステータスを取得し評価値に変換する関数
    function getCardValue(card) {
        const at = getAt(card);
        const hp = getHp(card);
        const cost = card.cost ?? 0;

        return at * 2.2 + hp * 1.4 + cost * 0.5;
    }

    //現状のPPで出せるカードの組み合わせをすべて試して数値で評価し、最も数値の高いカードの組み合わせを返す関数
    function chooseBestCardsToPlay() {
        //場に空きがなければ空配列を返して処理を終える
        const emptySlots = cpu.field.filter(card => card === null).length;
        if (emptySlots <= 0) {
            return [];
        }
        //手札から今使用できるカードを抽出
        // CPUは現時点ではspellを使わず、followerだけを場に出す。
        const playableCards = cpu.hand.filter(card => {
            return (
                card.type === "follower" &&
                card.cost <= cpu.currentPp
            );
        });
        //手札に使用できるカードがなければ空配列を返して処理を終える
        if (playableCards.length === 0) {
            return [];
        }

        let bestCards = []; //「今のところ一番よい組み合わせ」を保存する変数。
        let bestScore = -Infinity; //bestCardsのスコアを入れる。初期値はマイナス無限大。

        //再帰関数。playableCardsの中から最もプレイする価値のあるカードの組み合わせをbestCardsに代入する
        function search(startIndex, selectedCards, totalCost) {
            // 選んだカードの枚数が場の空き数を超えたら処理を終える
            if (selectedCards.length > emptySlots) {
                return;
            }
            //PPが足りなければ処理を終える
            if (totalCost > cpu.currentPp) {
                return;
            }
            //selectedCardsの価値を評価し、良いものであれば保存しておく処理
            if (selectedCards.length > 0) {
                //選ばれたカードそれぞれの評価値を計算し、合計する
                const totalValue = selectedCards.reduce((sum, card) => {
                    return sum + getCardValue(card);
                }, 0);
                // 上記の構文
                // array.reduce((累積値(前の結果), 現在の要素) => {
                //     // 処理内容
                //     return 次の累積値;
                //   }, 初期値);
                // sumも初期値0で毎回選ばれたカードのvalueが足されていく。

                //スコア計算（カードの強さの合計 - 余ったPPのペナルティ + 出した枚数のボーナス）
                const unusedPp = cpu.currentPp - totalCost; //選択したカードを使用した場合に残るPPを計算。
                const cardCountBonus = selectedCards.length * 1.2; //出すカードの枚数が多いほどボーナスを加算。
                const score = totalValue - unusedPp * 0.8 + cardCountBonus; //補正したスコアを計算。カードの強さの合計 - 余ったPPのペナルティ + 出した枚数のボーナス

                //より高いスコアが見つかったら暫定１位として変数に保存しておく
                if (score > bestScore) {
                    bestScore = score;
                    bestCards = [...selectedCards];
                }
            }
            //playableCardsの中から一枚ずつ選んでselectedCardsに追加して、search関数を再帰呼び出しする
            for (let i = startIndex; i < playableCards.length; i++) {
                const card = playableCards[i];
                search(i + 1, [...selectedCards, card], totalCost + card.cost);
            }
        }
        search(0, [], 0); //search関数の初期呼び出し。

        bestCards.sort((a, b) => a.cost - b.cost); //コストが低い順にソート
        return bestCards; //bestCardsを返す
    }


    async function playBestCards() {
        // カードを出した後もPPや手札が変わるため、出せるカードがなくなるまで繰り返す
        while (true) {
            //ゲームが終了していたら処理を終える
            if (isGameOver()) {
                return;
            }
            //場に空きがなければ処理を終える
            if (!cpu.field.includes(null)) {
                return;
            }
            //最もプレイする価値のあるカードの組み合わせを抽出する
            const cardsToPlay = chooseBestCardsToPlay();
            if (cardsToPlay.length === 0) {
                return;
            }

            let playedAnyCard = false;

            //1枚ずつフォロワーを場に出す
            for (const card of cardsToPlay) {
                if (isGameOver()) {
                    return;
                }

                if (!cpu.hand.includes(card)) {
                    continue;
                }

                if (card.type !== "follower") {
                    continue;
                }

                if (cpu.currentPp < card.cost) {
                    continue;
                }

                if (!cpu.field.includes(null)) {
                    return;
                }

                displayMessageWithActions(`CPUは「${card.name}」を場に出します。`);
                await wait(CPU_WAIT_NORMAL);

                moveHandToField(cpu, card);
                console.log(`CPUは${card.name}を場に出しました。`);

                playedAnyCard = true; //1枚以上出せたことを示すためのフラグを立てる。

                renderGame(players);
                await wait(CPU_WAIT_SHORT);
            }

            renderGame(players);

            //1枚も出せなかった場合は処理を終了する
            if (!playedAnyCard) {
                return;
            }
        }
    }

    //場のカードで攻撃可能なカードを抽出する関数
    function getAttackableCards() {
        return cpu.field.filter(card => {
            return (
                card &&
                card.type === "follower" &&
                card.isInactivated === false
            );
        });
    }

    //攻撃可能なカードが対象のカードを倒せるかを判定する関数
    function canDefeat(attacker, defender) {
        return getAt(attacker) >= getHp(defender);
    }

    //攻撃可能なカードが対象のカードを攻撃後に生き残るかを判定する関数
    function willAttackerSurvive(attacker, defender) {
        return getHp(attacker) > getAt(defender);
    }

    //最も価値のある攻撃行動を選ぶ関数
    function chooseBestAttack() {
        const attackableCards = getAttackableCards();
        //攻撃可能なカードがなければnullを返して処理を終える
        if (attackableCards.length === 0) {
            return null;
        }
        //相手プレイヤーのHPを０にできるカードを探す処理
        const lethalAttackers = attackableCards.filter(attacker => {
            return getAt(attacker) >= opponentPlayer.hp;
        });
        if (lethalAttackers.length > 0) {
            //ATが最も低いカードを先頭にする
            lethalAttackers.sort((a, b) => getAt(a) - getAt(b));
            //ATが最も低いカードをリーダー攻撃として返す、高いカードは温存
            return {
                type: "leader",
                attacker: lethalAttackers[0],
                score: 999999, //最優先でこの行動を取るようスコアを最大にする。
            };
        }

        let bestMove = null;
        let bestScore = -Infinity;

        attackableCards.forEach(attacker => {
            const attackerValue = getCardValue(attacker);

            opponentPlayer.field.forEach(defender => {
                if (!defender) {
                    return;
                }

                if (defender.type !== "follower") {
                    return;
                }

                const defenderValue = getCardValue(defender);
                const defenderDies = canDefeat(attacker, defender);
                const attackerSurvives = willAttackerSurvive(attacker, defender);

                let score = 0;

                // 相手フォロワーを倒せるなら高く評価する。
                // 倒せない場合でも、ダメージを与える価値として少し評価する。
                if (defenderDies) {
                    score += defenderValue * 2.0;
                } else {
                    score += getAt(attacker) * 0.6;
                }

                // 攻撃後に自分のフォロワーが生き残るなら加点、倒されるなら減点する
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
                if (!card) {
                    return sum;
                }

                return sum + getAt(card);
            }, 0);

            if (opponentThreat >= cpu.hp) {
                leaderAttackScore -= opponentThreat * 2.5;
            } else {
                leaderAttackScore -= opponentThreat * 0.3;
            }

            if (opponentPlayer.field.every(card => card === null)) {
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

    //最も価値のある攻撃行動を実行する関数
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


    // ================================================
    // ■CPUの行動の流れ
    // ================================================

    renderGame(players);
    await wait(CPU_WAIT_NORMAL);

    //最も価値のある組み合わせのカードを場に出す
    await playBestCards();

    if (isGameOver()) {
        return;
    }

    //最も価値のある攻撃行動を実行する
    await attackBestTargets();

    if (isGameOver()) {
        return;
    }

    //再度最も価値のある組み合わせのカードを場に出す
    await playBestCards();

    if (isGameOver()) {
        return;
    }

    //行動終了のメッセージを表示する
    displayMessageWithActions("CPUの行動が終了しました。");
    renderGame(players);
    await wait(CPU_WAIT_SHORT);
}