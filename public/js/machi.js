// 順子一覧、index で指定したいので -1 している
listOfShuntsu = [
    [0, 1, 2], [1, 2, 3], [2, 3, 4], [3, 4, 5], [4, 5, 6],
    [5, 6, 7], [6, 7, 8],
];

document.getElementById("inputPaishi").addEventListener("input", (event) => {
    document.getElementById("countOfPaiInInputPaishi").textContent = event.target.value.length + "枚";
});
// 初期値
document.getElementById("countOfPaiInInputPaishi").textContent = document.getElementById("inputPaishi").value.length + "枚";

const onClickPai = (num) => {
    document.getElementById("inputPaishi").value += String(num);
    document.getElementById("countOfPaiInInputPaishi").textContent = document.getElementById("inputPaishi").value.length + "枚";
}

const onClick = () => {
    // 正規表現
    const reg = /[1-9]{13}/;
    // 牌姿を取得
    const paishi = document.getElementById("inputPaishi").value;
    // 牌姿を検査 - 牌姿の長さが 13 でない場合
    if (!(paishi.length == 13)) {
        document.getElementById("machi").textContent = "牌姿の長さが 13 ではありません。";
        return;
    }
    // 牌姿を検査 - 牌姿に 1-9 以外の文字が含まれる場合
    else if (!(reg.test(paishi))) {
        document.getElementById("machi").textContent = "牌姿に 1-9 以外の文字が含まれています。";
        return;
    }
    // 牌姿から各牌の個数をカウントし、配列にしたものを作成
    const listOfCountOfPaiInPaishi = getListOfCountOfPaiInPaishi(paishi);
    // 牌姿を検査 - カウントが 5 以上の牌が存在しないか
    if (!(isValidCount(listOfCountOfPaiInPaishi))) {
        return;
    }
    // 待ちである牌の配列を取得
    const listOfMachi = getListOfMachi(structuredClone(listOfCountOfPaiInPaishi)); // clone して渡す
    // document を update
    document.getElementById("machi").textContent = listOfMachi;
}
// 入力された牌姿から、それぞれの牌の個数のlistを作成
const getListOfCountOfPaiInPaishi = (paishi) => {
    // 初期化
    let listOfCountOfPaiInPaishi = new Array(9).fill(0);
    const listOfPaiInPaishi = paishi.split("");
    // カウントを追加していく
    listOfPaiInPaishi.forEach(
        (elem) => {
            const index = Number(elem) - 1;
            listOfCountOfPaiInPaishi[index]++;
        });
    // return
    return listOfCountOfPaiInPaishi;
}
// 各牌の枚数が 4 枚以内かどうか
const isValidCount = (listOfCountOfPaiInPaishi) => {
    for (let i = 0; i < 9; i++) {
        if (listOfCountOfPaiInPaishi[i] >= 5) {
            document.getElementById("machi").textContent = `牌姿に ${i + 1} が 5 枚以上含まれています。`;
            return false;
        }
    }
    return true;
}
//
const getListOfMachi = (listOfCountOfPaiInPaishi) => {
    // 待ちである牌の配列
    let listOfMachi = [];
    for (let i = 0; i < 9; i++) {
        if (isAbleToAgariInThisIndexOfMachi(structuredClone(listOfCountOfPaiInPaishi), i)) {
            listOfMachi.push(i+1);
        }
    }
    // return
    return listOfMachi
}
//
const isAbleToAgariInThisIndexOfMachi = (listOfCountOfPaiInPaishi, indexOfMachi) => {
    // 待ちを確認する牌を追加し、14枚にする
    listOfCountOfPaiInPaishi[indexOfMachi]++;
    // 1枚追加した結果、5 枚以上になっている場合は false
    if (listOfCountOfPaiInPaishi[indexOfMachi] >= 5) {
        return false;
    }
    // 雀頭に指定する牌を 1~9 までループ
    for (let i = 0; i < 9; i++) {
        // この雀頭で進めた結果、true なら return(元の配列を破壊しないよう clone)
        if (isAbleToAgariInThisIndexOfJanto(structuredClone(listOfCountOfPaiInPaishi), i)) {
            return true;
        }
    }
    // いずれの雀頭でもダメだった(= for ループが正常に終了している)場合
    return false;
}
//
const isAbleToAgariInThisIndexOfJanto = (listOfCountOfPaiInPaishi, indexOfJanto) => {
    // 雀頭を抜く
    listOfCountOfPaiInPaishi[indexOfJanto] -= 2;
    // マイナスになっている場合(=そもそも雀頭として抜けない)場合は return
    if (listOfCountOfPaiInPaishi[indexOfJanto] < 0) {
        return false;
    }
    // 面子を抜く。4面子それぞれに順子と刻子の2通りがあるので、2 ** 4 で全16パターン分ループ。
    for (let i = 0; i < 16; i++) {
        // この面子パターンで進めた結果、true なら return
        if (isAbleToAgariInThisNumberOfPatternOfMentsu(structuredClone(listOfCountOfPaiInPaishi), i)) {
            return true;
        }
    }
    // ここまで到達するということは、16パターンのいずれでも面子を除外しきれなかったということなので、false を return
    return false;
}
//
const isAbleToAgariInThisNumberOfPatternOfMentsu = (listOfCountOfPaiInPaishi, numberOfPatternOfMentsu) => {
    // 商
    let sho = numberOfPatternOfMentsu;
    // 4回(= 4面子分)繰り返す
    for (let _ = 0; _ < 4; _++) {
        // 順子 - 剰余が0か1かで順子を抜くか刻子を抜くかを決める、0なら順子
        if (sho % 2 == 0) {
            // 牌姿を更新
            listOfCountOfPaiInPaishi = excludeShuntsu(listOfCountOfPaiInPaishi);
            // null なら処理終了、16通りの次の抜き方へ
            if (listOfCountOfPaiInPaishi == null) {
                return false;
            }
        }
        // 刻子 - 剰余が0か1かで順子を抜くか刻子を抜くかを決める、0でないなら刻子
        else {
            // 牌姿を更新
            listOfCountOfPaiInPaishi = excludeKotsu(listOfCountOfPaiInPaishi);
            // null なら処理終了、16通りの次の抜き方へ
            if (listOfCountOfPaiInPaishi == null) {
                return false;
            }
        }
        // 商を更新 // java と異なるので注意
        sho = Math.floor(sho / 2);
    }
    // ここまで到達できれば、4つの面子を除外することができたということなので、true を return
    return true;
}
// 最も数字の小さい順子を 1 つ除外する
const excludeShuntsu = (listOfCountOfPaiInPaishi) => {
    for (const shuntsu of listOfShuntsu) {
        if (listOfCountOfPaiInPaishi[shuntsu[0]] >= 1 && listOfCountOfPaiInPaishi[shuntsu[1]] >= 1 && listOfCountOfPaiInPaishi[shuntsu[2]] >= 1) {
            listOfCountOfPaiInPaishi[shuntsu[0]]--; // 除外 (= カウントを -1 する)
            listOfCountOfPaiInPaishi[shuntsu[1]]--; // 除外 (= カウントを -1 する)
            listOfCountOfPaiInPaishi[shuntsu[2]]--; // 除外 (= カウントを -1 する)
            return listOfCountOfPaiInPaishi;
        }
    }
    return null;
}
// 最も数字の小さい刻子を 1 つ除外する
const excludeKotsu = (listOfCountOfPaiInPaishi) => {
    for (let i = 0; i < 9; i++) {
        if (listOfCountOfPaiInPaishi[i] >= 3) {
            listOfCountOfPaiInPaishi[i] -= 3;
            return listOfCountOfPaiInPaishi;
        }
    }
    return null;
}
