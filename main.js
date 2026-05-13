// cpuの処理を別ファイルからimport
import { cpuAction } from "./cpu.js";

// ====================================
// ◆ Model ◆
// ====================================
//プレイヤー情報の定義
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

// 【テストプレイ用】プレイヤー側デッキ：バランス型
const playerCards = [
    { type: "follower", name: "見習い剣士", hp: 1, at: 1, cost: 1, text: "軽く出せる基本フォロワー。" },
    { type: "follower", name: "森の弓使い", hp: 1, at: 2, cost: 1, text: "攻撃力が高いが倒されやすい。" },
    { type: "follower", name: "小さな守り手", hp: 2, at: 1, cost: 1, text: "序盤の守りに向いたフォロワー。" },
    { type: "follower", name: "旅する斥候", hp: 1, at: 2, cost: 1, text: "序盤から相手に圧力をかける。" },
    { type: "follower", name: "草原の兵士", hp: 2, at: 2, cost: 2, text: "扱いやすい2コストフォロワー。" },
  
    { type: "follower", name: "盾を持つ兵士", hp: 3, at: 1, cost: 2, text: "体力が高く、場に残りやすい。" },
    { type: "follower", name: "炎の魔術師", hp: 2, at: 3, cost: 2, text: "攻撃寄りの2コストフォロワー。" },
    { type: "follower", name: "街道の槍兵", hp: 2, at: 2, cost: 2, text: "攻守のバランスがよい。" },
    { type: "follower", name: "白銀の見習い騎士", hp: 3, at: 2, cost: 3, text: "中盤につなげる安定したフォロワー。" },
    { type: "follower", name: "荒野の戦士", hp: 3, at: 3, cost: 3, text: "中盤の主力。" },
  
    { type: "follower", name: "癒しの聖職者", hp: 4, at: 2, cost: 3, text: "体力が高めで場に残りやすい。" },
    { type: "follower", name: "双剣の冒険者", hp: 2, at: 4, cost: 3, text: "攻撃力重視の中盤フォロワー。" },
    { type: "follower", name: "鋼の騎士", hp: 5, at: 4, cost: 4, text: "攻守ともに優秀な主力カード。" },
    { type: "follower", name: "雷鳴の獣", hp: 4, at: 5, cost: 4, text: "相手リーダーへの攻撃力が高い。" },
    { type: "follower", name: "城壁の番人", hp: 6, at: 3, cost: 4, text: "守りに強い大型寄りフォロワー。" },
  
    { type: "follower", name: "古代の守護者", hp: 7, at: 4, cost: 5, text: "高い体力で場に残りやすい。" },
    { type: "follower", name: "紅蓮の騎士", hp: 5, at: 6, cost: 5, text: "攻撃力の高い終盤カード。" },
    { type: "follower", name: "竜騎士", hp: 6, at: 7, cost: 6, text: "終盤の切り札。" },
    { type: "follower", name: "森の大守護獣", hp: 8, at: 6, cost: 6, text: "攻守に優れた大型フォロワー。" },
    { type: "follower", name: "天空の勇者", hp: 8, at: 8, cost: 7, text: "勝負を決める大型フォロワー。" },
  ];
  
  // 【テストプレイ用】CPU側デッキ：やや攻撃寄り
  const cpuCards = [
    { type: "follower", name: "ゴブリン", hp: 1, at: 1, cost: 1, text: "軽く出せる基本フォロワー。" },
    { type: "follower", name: "グレムリン", hp: 1, at: 2, cost: 1, text: "攻撃力が高い序盤フォロワー。" },
    { type: "follower", name: "影の小鬼", hp: 1, at: 2, cost: 1, text: "序盤から攻めるフォロワー。" },
    { type: "follower", name: "骨の兵士", hp: 2, at: 1, cost: 1, text: "少しだけ場持ちする低コストカード。" },
    { type: "follower", name: "荒くれ山賊", hp: 2, at: 2, cost: 2, text: "攻めやすい2コストフォロワー。" },
  
    { type: "follower", name: "毒爪の獣", hp: 1, at: 3, cost: 2, text: "攻撃力は高いが倒されやすい。" },
    { type: "follower", name: "黒鉄の斧使い", hp: 3, at: 2, cost: 2, text: "安定した2コストフォロワー。" },
    { type: "follower", name: "砂漠の盗賊", hp: 2, at: 3, cost: 2, text: "序盤から強く攻める。" },
    { type: "follower", name: "魔狼", hp: 3, at: 3, cost: 3, text: "中盤の攻撃役。" },
    { type: "follower", name: "暗黒の槍兵", hp: 2, at: 4, cost: 3, text: "攻撃力重視の中盤フォロワー。" },
  
    { type: "follower", name: "岩肌の巨人", hp: 5, at: 2, cost: 3, text: "高い体力で場に残る。" },
    { type: "follower", name: "狂える戦士", hp: 3, at: 4, cost: 3, text: "攻撃寄りの中盤カード。" },
    { type: "follower", name: "地獄の番犬", hp: 4, at: 5, cost: 4, text: "攻撃力の高い主力カード。" },
    { type: "follower", name: "黒鎧の騎士", hp: 5, at: 4, cost: 4, text: "攻守のバランスがよい。" },
    { type: "follower", name: "魔導ゴーレム", hp: 6, at: 3, cost: 4, text: "守りに強い中型フォロワー。" },
  
    { type: "follower", name: "雷角の獣", hp: 5, at: 6, cost: 5, text: "終盤に相手を追い詰める。" },
    { type: "follower", name: "深淵の守護者", hp: 7, at: 4, cost: 5, text: "高い体力を持つ大型フォロワー。" },
    { type: "follower", name: "炎獄の竜", hp: 5, at: 7, cost: 6, text: "攻撃力の高い大型フォロワー。" },
    { type: "follower", name: "闇の巨兵", hp: 8, at: 6, cost: 6, text: "終盤の主力。" },
    { type: "follower", name: "魔王の使い", hp: 7, at: 9, cost: 7, text: "放置すると危険な切り札。" },
  ];

//カード情報の定義　※CPUなど複数用意する場合はこれが必要になると思われる。
// const cards = [
    //followerのみデッキ作成時に時にisInactivated(true=行動不能)を付与する。
    // {
        // type : "follower", //follower,spell,amuletの3種を実装予定
        // name : "エルフの剣士",
        // hp : 1, //hit point
        // at : 1, //attack point
        // cost : 1, //召喚コスト
//     },
//     {
//         type : "follower",
//         name : "砦を守る翼竜",
//         hp : 2,
//         at : 1,
//         cost : 1,
//     },
//     {
//         type : "follower",
//         name : "グレムリン",
//         hp : 5,
//         at : 2,
//         cost : 1,
//     },
//     {
//         type: "follower",
//         name: "見習い剣士",
//         hp: 1,
//         at: 1,
//         cost: 1,
//     },
//     {
//         type: "follower",
//         name: "森の弓使い",
//         hp: 1,
//         at: 2,
//         cost: 1,
//     },
//     {
//         type: "follower",
//         name: "盾を持つ兵士",
//         hp: 3,
//         at: 1,
//         cost: 2,
//     },
//     {
//         type: "follower",
//         name: "炎の魔術師",
//         hp: 2,
//         at: 3,
//         cost: 2,
//     },
//     {
//         type: "follower",
//         name: "荒野の戦士",
//         hp: 3,
//         at: 3,
//         cost: 3,
//     },
//     {
//         type: "follower",
//         name: "癒しの聖職者",
//         hp: 4,
//         at: 2,
//         cost: 3,
//     },
//     {
//         type: "follower",
//         name: "鋼の騎士",
//         hp: 5,
//         at: 4,
//         cost: 4,
//     },
//     {
//         type: "follower",
//         name: "雷鳴の獣",
//         hp: 4,
//         at: 5,
//         cost: 4,
//     },
//     {
//         type: "follower",
//         name: "古代の守護者",
//         hp: 7,
//         at: 4,
//         cost: 5,
//     },
//     {
//         type: "follower",
//         name: "竜騎士",
//         hp: 6,
//         at: 7,
//         cost: 6,
//     },
// ];

//メッセージエリアに表示するボタンのセット
const messageActions = {
    whenHandSelected : [
        {
            label : "場に出す",
            onClick : playSelectedHandCard //グローバル変数に代入されたカードを場に出す。
        },
        {
            label : "キャンセル",
            onClick : resetActionSelection
            //↑「resetActionSelection()」と書くとクリック時でなくmessageActions作成時に処理が呼ばれるので注意。
        },
    ],
    whenFieldSelected : [
        {
            label : "バトル",
            onClick : () => {
                //場のカードをクリックしたことで正常にグローバル変数に代入されているか確認。
                if (!selectedAttacker) {
                    displayMessageWithActions("攻撃するカードが選択されていません。");
                    return;
                }
                //バトルモードON
                battleMode = true;
                selectedTarget = null;
                displayMessageWithActions(
                    "どのカードに攻撃するか選択してください。",
                    messageActions.whenBattleSelected
                ); //メッセージ表示。この後攻撃対象を選択する操作は入る。
            }
        },
        {
            label : "リーダーを直接攻撃",
            onClick : () => {
                attackSelectedLeader();
            }
        },
        {
            label : "キャンセル",
            onClick : resetActionSelection,
        },
    ],
    whenBattleSelected : [
        {
            label : "キャンセル",
            onClick : resetActionSelection,
        },
    ]
}

//カードプールからデッキを作る関数
function createDeck(player, cards) {
    if (player.deck.length === 0 && cards) {
        //今はcard配列をそのままセットする。
        player.deck = cards.map(card => {
            if (card.type !== "follower") {
                //follower以外はcardsの中身をそのままデッキのカードにする
                return { ...card };
            }
            //followerカードの場合はcurrentHp、currentAt、isInactivated=trueをセットする。
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

//ppの上限を+1して全回復する関数
function recoveryPp (player) {
    const maxLimitPp = 10; //PPは最大10個までとする。
    if (player.maxPp < maxLimitPp) {
        player.maxPp += 1;
        console.log(`${player.name}の最大PPが+1され${player.maxPp}になりました。`);    
    }
    player.currentPp = player.maxPp;
    console.log(`${player.name}のPPが回復し${player.maxPp}になりました。`);    
}

//場のfollowerカードをすべて活性化（行動可能状態）する関数
function activateFollower(field) {
    if (field.length === 0) {
        console.log("フィールドにカードがないためactiveFollowerは無効です。");
        return;
    }
    field.forEach(card => {
        if (card.type !== "follower") {
            console.log(`${card.name}はフォロワーではありません。`);
            return;
        }
        card.isInactivated = false;
        console.log(`${card.name}が行動可能になりました。`);
    });
}

//followerカードを非活性（行動不可状態）にする関数
function deactivateFollower(card) {
    if (card.type !== "follower") {
        console.log(`${card.name}はフォロワーではありません`);
        return;
    }
    card.isInactivated = true;
    console.log(`${card.name}は行動不能になりました。`);
}

//初期手札４枚をドローする関数
function createInitialHand(player) {
    if (player.hand.length === 0) {
        const initialCards = player.deck.splice(0, 4);
        player.hand.push(...initialCards); //「...」にすることでデッキから切り出した４枚を１枚ずつ手札に追加できる。
        console.log(`${player.name}は初期手札４枚を引きました。`);
        console.table(player.hand);
    }
}

//デッキからカードを1枚ドローする関数
function drawCard(player) {
    if (player.deck.length > 0) {
        player.hand.push(player.deck.shift());
        console.log(`${player.name}はデッキからカードを１枚ドローしました。`);
        console.table(player.hand);
        return true; //startPhase関数で勝敗判定をするためにtrue/falseを返す
    }

    console.log(`${player.name}はカードを引けませんでした。`);
    return false;
}

//手札から場にカードを出す関数
function playCard (player, card) {
    const fieldMaxLength = 3; //場には最大３枚までカードを出せる。
    const cardIndex = player.hand.indexOf(card);
    if (player.currentPp < card.cost) {
        displayMessageWithActions("PPが足りません");
        return;
    }
    if (player.field.length >= fieldMaxLength) {
        displayMessageWithActions("フィールドに空きがありません");
        return;
    }
    if (cardIndex === -1) {
        displayMessageWithActions("そのカードは手札にありません");
      return;
    }
    player.hand.splice(cardIndex, 1); //手札から対象のカードを削除。
    player.field.push(card); //場にカードを追加。
    player.currentPp -= card.cost;
    console.log(`${card.name}を場に出しました`);
}

//カードを墓地に送る関数
function sendToCemetery(player, card) {
    const cardIndex = player.field.indexOf(card);
    if (cardIndex === -1) {
        console.log(`${card.name}はフィールドに存在しません。`);
        return;
    }
    player.field.splice(cardIndex, 1); //場から対象のカードを削除
    player.cemetery.push(card); //墓地に対象のカードを追加
    console.log(`${card.name}を墓地に送りました。`);
}

//手札クリック時にカードを選択済みにする関数
function selectHandCard(card) {
    if (isGameOver) {
        return;
    } //ゲームが終了していたら入力を受け付けない。
    const player = players[0];
    if(!isPlayerTurn()) {
        displayMessageWithActions("相手ターン中は行動できません。");
        return;
    }
    if(battleMode) {
        displayMessageWithActions("バトル中は選択できません。");
        return;
    }
    if (player.currentPp < card.cost) {
        selectedHandCard = null;
        displayMessageWithActions("PPが足りません。");
        return;
    }
    if (player.field.length >= 3) {
        selectedHandCard = null;
        displayMessageWithActions("フィールドに空きがありません。");
        return;
    }
    //場のカードを選んだあとに手札が選択された場合に備えリセットをかける。
    selectedAttacker = null;
    selectedTarget = null;
    //選択された手札のカードをグローバル変数に代入。
    selectedHandCard = card;
    displayMessageWithActions(
        `${card.name}を選択しました。`,
        messageActions.whenHandSelected
    );//メッセージ表示。
}

//選択した手札のカードを場に出す関数
function playSelectedHandCard() {
    //ゲームが終了していたら入力を受け付けない。
    if (isGameOver) {
        return;
    }
    //定数の定義
    const player = players[0];
    const card = selectedHandCard; //selectedHandCardを別変数に退避。念のため。
    //selectedHandCardの存在確認。
    if(!card) {
        console.log("まだカードが選択されていません。");
        return;
    }
    //手札にselectedHandCardがあるかの確認。念のため。
    if (!player.hand.includes(card)) {
        selectedHandCard = null;
        displayMessageWithActions("そのカードは手札にありません。");
        return;
    }
    //相手ターンに手札がクリックされた場合のアラート表示。
    if (!isPlayerTurn()) {
        displayMessageWithActions("今は自分のターンではありません。");
        return;
    }
    //バトル中に手札がクリックされた場合のアラート表示。
    if (battleMode) {
        displayMessageWithActions("バトル中は手札からカードを出せません。");
        return;
    }
    //召喚実行前のPP確認
    if (player.currentPp < card.cost) {
        displayMessageWithActions("PPが足りません。");
        return;
    }
    //フィールド上に空きがあるか確認
    if (player.field.length >= 3) {
        displayMessageWithActions("フィールドに空きがありません。");
        return;
    }
    playCard(player, card);
    selectedHandCard = null;
    displayMessageWithActions(`${card.name}を場に出しました。`);
    renderGame(players);
}

//バトル処理を担当する関数
function battle(attackPlayer, attacker, defendPlayer, defender) {
    if (!attacker || !defender) {
        console.log("攻撃側または防御側のカードが存在しません。");
        return;
    }
    if (attacker.isInactivated) {
        console.log("そのカードは攻撃できません。");
        return;
    }
    deactivateFollower(attacker); //以下の処理中に間違って行動することがないよう先に行動不能にする。
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

//プレイヤー（リーダー）を直接攻撃処理を担当する関数
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
    deactivateFollower(attacker); //ダメージ計算の前に先に行動不能にしておく。
    targetLeader.hp -= attacker.currentAt;
    if (targetLeader.hp <= 0) {
        targetLeader.hp = 0;
    }
    console.log(`${targetLeader.name}の残りHP: ${targetLeader.hp}`);
    //勝敗判定。
    const winner = checkWinner(players);
    if (winner) {
        finishGame(winner);
    }
}

//バトル時にプレイヤーが攻撃するフォロワーを選択するための関数
// battleMode,selectedAttacker,selectedTarget,gameMessageはグローバル変数として定義されている。
function selectAttacker(card) {
    //ゲームが終了していたら入力を受け付けない。
    if (isGameOver) {
        return;
    }
    //相手ターン中は選択不可とする。
    if (!isPlayerTurn()) {
        displayMessageWithActions("今は自分のターンではありません。");
        return;
    }
    //選択されたカードが行動可能かを判定。
    if (card.isInactivated) {
        displayMessageWithActions("このカードは攻撃できません。");
        return;
    }
    selectedHandCard = null;//手札をクリックしたあとに場のカードをクリックした場合に備えリセットをかける。
    selectedAttacker = card; //グローバル変数に攻撃を行うフォロワーの候補として代入。
    displayMessageWithActions(
        `${card.name}を選択しました。操作を選んでください。`,
        messageActions.whenFieldSelected
    ); //メッセージを表示。このあとバトルするか選択する操作が入る。
}

//バトル時にプレイヤーが攻撃対象のフォロワーを選択するための関数
function selectTarget(card) {
    //ゲームが終了していたら入力を受け付けない。
    if (isGameOver) {
        return;
    }
    //バトルボタンがクリックされ、バトルモードに入っているかを判定。
    if (!battleMode) {
        return;
    }
    //攻撃を行うフォロワーが選択されているかを判定。
    if (!selectedAttacker) {
        battleMode = false;
        selectedTarget = null;
        displayMessageWithActions("先に攻撃するカードを選んでください。");
        return;
    }
    selectedTarget = card; //グローバル変数に攻撃対象のフォロワーを代入。
    const result = confirm(
        `${selectedAttacker.name}で${selectedTarget.name}を攻撃しますか？` //実行確認。
    );
    if (!result) {
        selectedTarget = null;
        displayMessageWithActions("攻撃対象を選び直してください。", messageActions.whenBattleSelected);
        return;
    }
    //バトルを実行。
    const player = players[0]; //※この行いらないかも。
    const cpu = players[1]; //※この行いらないかも。
    battle(player, selectedAttacker, cpu, selectedTarget);

    //バトル終了とともにグローバル変数を変更。
    battleMode = false;
    selectedAttacker = null;
    selectedTarget = null;
    displayMessageWithActions("攻撃しました。次の操作を選んでください。");
    renderGame(players); //HTML上の表示を更新。
}

//自分のターンに相手プレイヤー（リーダー）への直接攻撃処理を呼び出す関数
function attackSelectedLeader() {
    //ゲームが終わっていた場合に備えた処理。
    if (isGameOver) {
        return;
    }
    const cpu = players[1];
    const attacker = selectedAttacker; //selectedAttackerが何らかの理由で消えた場合に備え別の定数に退避。
    if (!attacker) {
        displayMessageWithActions("攻撃するカードが選択されていません。");
        return;
    }
    if (!isPlayerTurn()) {
        displayMessageWithActions("今は自分のターンではありません。");
        return;
    }

    if (attacker.isInactivated) {
        displayMessageWithActions("このカードは攻撃できません。");
        return;
    }
    //実行確認。
    const result = confirm(`${attacker.name}で相手リーダーを攻撃しますか？`);
    if (!result) {
        displayMessageWithActions(
            `${attacker.name}を選択しました。操作を選んでください。`,
            messageActions.whenFieldSelected
        );
        return;
    }
    //直接攻撃処理を呼び出す。
    attackLeader(attacker, cpu);
    //攻撃によってゲーム終了した場合、これ以降の通常処理をしない。
    if (isGameOver) {
        return;
    }
    //グローバル変数のリセット。
    resetActionSelection();
    //メッセージ表示。
    displayMessageWithActions(`${attacker.name}で相手リーダーを攻撃しました。`);
    //HTMLの更新。
    renderGame(players);
}

//グローバル変数をリセットする関数
function resetActionSelection() {
    selectedHandCard = null;
    battleMode = false;
    selectedAttacker = null;
    selectedTarget = null;
    displayMessageWithActions("操作を選んでください。");
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
    //3項演算子「条件 ? 条件がtrueのときの値 : 条件がfalseのときの値」
    return players[currentPlayerIndex === 0 ? 1 : 0];
}

//CPUのターン中にプレイヤーが操作した場合のアラートに使用する関数
function isPlayerTurn() {
    return getCurrentPlayer().name === "player";
}

//ターンプレイヤーを交代させる関数
function switchTurn() {
    //3項演算子「条件 ? 条件がtrueのときの値 : 条件がfalseのときの値」
    currentPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
}

//ゲーム終了時の処理
function finishGame(winner) {
    if (!winner) {
        return;
    }
    //グローバル変数の変更
    isGameOver = true;
    battleMode = false;
    selectedHandCard = null;
    selectedAttacker = null;
    selectedTarget = null;

    //メッセージ表示。
    console.log(`ゲーム終了：${winner.name}の勝利`);
    displayMessageWithActions(`${winner.name}の勝利です！`);
    //HTMLを更新。
    renderGame(players);
}

//テストで使う確認用の関数
// function showPlayerState(player) {
//     console.log(`=== ${player.name}の状態 ===`);
//     console.log(`HP: ${player.hp}`);
//     console.log(`PP: ${player.currentPp}/${player.maxPp}`);

//     console.log("デッキ");
//     console.table(player.deck);

//     console.log("手札");
//     console.table(player.hand);

//     console.log("フィールド");
//     console.table(player.field);

//     console.log("墓地");
//     console.table(player.cemetery);
// }

// --------------------------------------------------------
//ゲームの進行状況、フェーズごとの処理を記述
// --------------------------------------------------------
//ゲーム開始時の処理
function startGame(players) {
    console.log("ゲームを始めます。");
    // createDeck(players[0], cards); //本番用のデッキ作成処理。テスト中はコメントアウト
    createDeck(players[0], playerCards); //テスト用のデッキ作詞処理
    shuffleDeck(players[0].deck); //デッキをシャッフル
    createInitialHand(players[0]); //初期手札４枚を引く
    // createDeck(players[1], cards); //本番用のデッキ作成処理。テスト中はコメントアウト
    createDeck(players[1], cpuCards); //テスト用のデッキ作詞処理
    shuffleDeck(players[1].deck);
    createInitialHand(players[1]);
}

//【フェーズ管理】ターン開始時の処理
function startPhase(player) {
    if (isGameOver) {
        return;
    } //何らかの理由でゲームが終わっていた場合に備えた処理。
    console.log(`${player.name}のターンを始めます。`);
    recoveryPp(player); //PP上限+1＆回復する。
    activateFollower(player.field); //場のフォロワーを行動可能にする。

    const drawSuccess = drawCard(player); //デッキからカードを1枚ドローすると同時に成功可否を取得。
    //ドローができなかった（デッキがなくなっていた）場合は相手の勝利とする。
    if (!drawSuccess) {
        const winner = getOpponentPlayer();
        finishGame(winner);
        return;
    }
    renderGame(players); //HTMLの表示を更新する。
}

//【フェーズ管理】メインフェイズ（行動）の処理
function mainPhase(player, opponentPlayer) {
    console.log(`${player.name}のメインフェイズを始めます。`);
    //CPUのターンは自動で行動。
    if (player.name === "cpu") {
        // cpuAction(player, opponentPlayer);
        
        //テストプレイ用にChatGPTが作った強いcpuActionを呼び出す。
        cpuAction(player, opponentPlayer, {
            players,
            isGameOver: () => isGameOver,
            playCard,
            battle,
            attackLeader,
            renderGame,
            displayMessageWithActions,
          });
        finishTurn();
    }
}

//【フェーズ管理】ターン終了時の処理
function endPhase(player) {
    console.log(`${player.name}のターンを終了します。`);
    switchTurn();
}

// --------------------------------------------------------
// メインフェイズのCPUの行動を記述
// --------------------------------------------------------
// function cpuAction(cpu, opponentPlayer) {
//     if (cpu.name !== "cpu") {
//         console.log("CPUのターンではないのにcpuActionが呼ばれました。");
//         return;
//     }
//     //手札に出せるカードがあれば出す。
//     if (cpu.hand.length > 0) {
//         const playableCards = cpu.hand.filter(card => card.cost <= cpu.currentPp);
//         if (playableCards.length > 0) {
//             const highestAtCard = playableCards.reduce((a, b) => (a.currentAt > b.currentAt ? a : b));//一番ATが高いカードを抽出。
//             playCard(cpu, highestAtCard); //場に出す。
//             renderGame(players); //HTML上の表示を更新。
//         }
//     }
//     //攻撃可能なカードがあり、かつ倒せるフォロワーがいれば攻撃する
//     const attackableCards = cpu.field.filter(card => card.type === "follower" && card.isInactivated === false);
//     if (attackableCards.length > 0) {
//         const attacker = attackableCards.reduce((a, b) => (a.currentAt > b.currentAt ? a : b));
//         const targetCards = opponentPlayer.field.filter(card => card.type === "follower" && attacker.currentAt >= card.currentHp);
//         if (targetCards.length > 0) {
//             const target = targetCards.reduce((a, b) => (a.currentAt > b.currentAt ? a : b));
//             battle(cpu, attacker, opponentPlayer, target);
//         } else {
//             attackLeader(attacker, opponentPlayer);
//         }
//     }    
// }


// --------------------------------------------------------
// 各フェーズの呼び出し方を制御する関数を記述
// --------------------------------------------------------
//スタートフェイズ、メインフェイズ
function turnCycle() {
    // 前の相手ターンでゲームが終了していたら次のターンは行わない
    if (isGameOver) {
        return;
    }
    const currentPlayer = getCurrentPlayer();
    const currentOpponentPlayer = getOpponentPlayer();
    //スタートフェイズ
    startPhase(currentPlayer);
    //自分のスタートフェイズでデッキアウトによりゲームが終わったらその時点で処理をやめる。
    if (isGameOver) {
        return;
    }
    //メインフェイズ
    mainPhase(currentPlayer, currentOpponentPlayer);
}

//エンドフェイズへの移行はプレイヤーの操作を待ってからになるため別関数で定義
function finishTurn() {
    if (isGameOver) {
        return;
    } //何かしらの理由でゲームが終わっていた場合に備えた処理。
    const currentPlayer = getCurrentPlayer();
    endPhase(currentPlayer); //ここでターンプレイヤーを交代。
    if (isGameOver) {
        return;
    } //エンドフェイズで何かしらの理由でゲームが終わった場合に備えた処理。
    turnCycle(); //相手ターンを行う。
}

// ====================================
// ◆ View ◆
// 画面の描画に使う関数
// 最終的にフィールドとカードイラストは画像、それ以外のカード枠などはJavaScript/HTML/CSSで描画する想定
// ====================================
// ステータス、手札、場のカードを描画する関数
function renderGame(players) {
    console.log("renderGame is called.");
    const player = players[0]; //この行いらないかも。CPUを複数用意するとしたら要改善。
    const cpu = players[1]; //この行いらないかも。CPUを複数用意するとしたら要改善。

    //ステータスを描画。
    renderPlayerStatus(player, "player");
    renderPlayerStatus(cpu, "cpu");

    //手札と場のカードを描画。
    renderCardList(player.hand, "player-hand", "playerHand");
    renderCardList(player.field, "player-field", "playerField");
    renderCpuHand(cpu);
    renderCardList(cpu.field, "cpu-field", "cpuField");

    //デッキと墓地のカード枚数を描画。
    renderDeckCemeteryCount(player, cpu);
}

// 各プレイヤーのHP、PPなどステータスを描画する関数
function renderPlayerStatus(player, prefix) {
    console.log("renderPlayerStatus is called.");
    //専用のHMTL要素に描画していく。HTML上のidが一致しているか注意。
    document.getElementById(`${prefix}-name`).textContent = player.name; //名前
    document.getElementById(`${prefix}-hp`).textContent = player.hp; //HP
    document.getElementById(`${prefix}-pp`).textContent =
      `${player.currentPp} / ${player.maxPp}`; //PP
}

// 手札と場のカードを描画する関数
function renderCardList(cards, elementId, areaType) {
    const area = document.getElementById(elementId);
    area.innerHTML = "";

    cards.forEach((card) => {
        const cardElement = document.createElement("div"); //divタグを用意。
        cardElement.className = "card"; //クラス名を指定。
        cardElement.innerHTML = `
        <div><strong>${card.name}</strong></div>
        <div>コスト: ${card.cost}</div>
        <div>攻撃力: ${card.currentAt ?? card.at}</div>
        <div>体力: ${card.currentHp ?? card.hp}</div>
        <div>不活性: ${card.isInactivated ?? null}</div>
        `; //カード1枚に表示する内容を指定。

        //カードに詳細ボタンを追加し、クリックでモーダルが開くようにする処理。
        const previewButton = document.createElement("button");
        previewButton.textContent = "詳細";
        previewButton.classList.add("card-preview-button");
        previewButton.addEventListener("click", (event) => {
            event.stopPropagation(); //詳細ボタンクリック時にそれを包むカードそのもののクリック処理（場に出す）が動かないようにする。
            openCardPreview(card); //カードのプレビューモーダルを開く。
        });

        //自分の手札を描画。
        if (areaType === "playerHand") {
            cardElement.addEventListener("click", () => {
                selectHandCard(card);
            });
        }

        //自分の場に出ているカードを描画。
        if (areaType === "playerField") {
            cardElement.addEventListener("click", () => {
                selectAttacker(card); //クリックされたカードで攻撃するか選べるようにする。
            });
        }

        //相手の場に出ているカードを描画。
        if (areaType === "cpuField") {
            cardElement.addEventListener("click", () => {
                selectTarget(card); //クリックしたカードを対象に攻撃処理を行う。
            });
        }

        cardElement.appendChild(previewButton); //カードに詳細ボタンを追加。
        area.appendChild(cardElement); //HTMLにここで生成したDOM要素を追加。
    });
}

//メッセージ表示を切り替えるための関数
function displayMessageWithActions(message, actions=[]) {
    const messageArea = document.getElementById("message-text");
    const buttonArea = document.getElementById("message-actions");
    if (!messageArea) {
        console.log("メッセージの表示エリアがありません。");
        return;
    }
    if (!buttonArea) {
        console.log("アクションボタンの表示エリアがありません。");
        return;
    }
    messageArea.textContent =  `▶ ${message}`;
    buttonArea.innerHTML = "";
    // actionsは{label:ボタンに表示するテキスト, onClick:クリック時に行う関数名}という想定
    if(actions.length > 0) {
        actions.forEach((action) => {
            const button = document.createElement("button");
            button.textContent = action.label;
            button.addEventListener("click", action.onClick);
            buttonArea.appendChild(button);
        });
    }
}

//相手の手札を中身が見えない状態で描画するための関数
function renderCpuHand(cpu) {
    const cpuHand = document.getElementById("cpu-hand");
    cpuHand.innerHTML = "";
    cpu.hand.forEach(() => {
        const cardBack = document.createElement("div");
        cardBack.classList.add("cpu-hand-card-back");
        cpuHand.appendChild(cardBack);
    });
}

//デッキと墓地のカードの枚数を描画する関数
function renderDeckCemeteryCount(player, cpu) {
    const cpuDeckCount = document.getElementById("cpu-deck-count");
    const cpuCemeteryCount = document.getElementById("cpu-cemetery-count");
    if (!cpuDeckCount || !cpuCemeteryCount) {
        console.log(`${cpu.name}のデッキまたは墓地が存在しません。`);
        return;
    }
    cpuDeckCount.textContent = cpu.deck.length;
    cpuCemeteryCount.textContent = cpu.cemetery.length;
    const playerDeckCount = document.getElementById("player-deck-count");
    const playerCemeteryCount = document.getElementById("player-cemetery-count");
    if (!playerDeckCount || !playerCemeteryCount) {
        console.log(`${player.name}のデッキまたは墓地が存在しません。`);
        return;
    }
    playerDeckCount.textContent = player.deck.length;
    playerCemeteryCount.textContent = player.cemetery.length;
}

//カードのプレビューモーダルを開く関数
function openCardPreview(card) {
    const modal = document.getElementById("card-preview-modal");
    document.getElementById("preview-card-name").textContent = card.name;
    document.getElementById("preview-card-cost").textContent = card.cost;
    document.getElementById("preview-card-at").textContent = card.currentAt ?? card.at;
    document.getElementById("preview-card-hp").textContent = card.currentHp ?? card.hp;
    document.getElementById("preview-card-text").textContent = card.text ?? "";
    const previewImage = document.getElementById("preview-card-image");
    if (card.image) {
      previewImage.src = card.image;
      previewImage.alt = card.name;
      previewImage.hidden = false;
    } else {
      previewImage.src = "";
      previewImage.alt = "";
      previewImage.hidden = true;
    }
    modal.hidden = false;
  }
  
  //カードのプレビューモーダルを閉じる関数
  function closeCardPreview() {
    const modal = document.getElementById("card-preview-modal");
    modal.hidden = true;
  }

// ====================================
// ◆ Controller ◆
// ここからターン管理
// ====================================
//複数の関数で参照する値をグローバル変数として定義。
let currentPlayerIndex = 0;
let selectedHandCard = null;
let battleMode = false;
let selectedAttacker = null;
let selectedTarget = null;
let isGameOver = false;
//画面が読み込まれた時の処理
document.addEventListener("DOMContentLoaded", async () => {
    //HTML要素を定義
    const turnEndBtn = document.getElementById("turn-end-btn");
    //ターンエンドボタンがクリックされた時の処理
    turnEndBtn.addEventListener("click", () => {
        if (isGameOver) {
            return;
        } //何らかの理由でゲームが終わっていた場合に備えた処理。
        console.log("turn-end-btn is clicked.");
        resetActionSelection(); //バトルの準備中にターンが終了した場合のリセット処理。
        finishTurn();  //ターンを終了。
    });
    //カードのプレビューモーダルを閉じるボタンがクリックされた時の処理
    document.getElementById("close-card-preview-button").addEventListener("click", closeCardPreview);

    startGame(players); //ゲーム開始。
    turnCycle(); //ターン処理。
    renderGame(players); //画面描画。
});


