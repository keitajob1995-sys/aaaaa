/* ------------------------------
   保存処理
------------------------------ */
function saveData() {
  const sets = Array.from(document.querySelectorAll(".qa-set")).map((set) => {
    const q = set.querySelector(".question");
    const ua = set.querySelector(".user-answer");
    const a = set.querySelector(".answer-text");

    return {
      question: q ? q.value : "",
      userAnswer: ua ? ua.value : "",
      answer: a ? a.value : "",
    };
  });

  localStorage.setItem("qaData", JSON.stringify(sets));
}

/* ------------------------------
   復元処理
------------------------------ */
function loadData() {
  const data = JSON.parse(localStorage.getItem("qaData") || "[]");
  data.forEach((item) => addSet(item.question, item.userAnswer, item.answer));
}

/* ------------------------------
   セット追加
------------------------------ */
function addSet(questionText = "", userAnswerText = "", answerText = "") {
  const template = document.getElementById("qa-template");
  const clone = template.content.cloneNode(true);

  const set = clone.querySelector(".qa-set");

  // 各欄に値をセット
  set.querySelector(".question").value = questionText;
  set.querySelector(".user-answer").value = userAnswerText;
  set.querySelector(".answer-text").value = answerText;

  // イベント設定
  const question = set.querySelector(".question");
  const userAnswer = set.querySelector(".user-answer");
  const answer = set.querySelector(".answer-text");
  const hideBtn = set.querySelector(".hide-answer-btn");
  const showBtn = set.querySelector(".show-answer-btn");
  const deleteBtn = set.querySelector(".delete-set-btn");
  const markCorrectBtn = set.querySelector(".mark-correct-btn");
  const markWrongBtn = set.querySelector(".mark-wrong-btn");

  // 〇 → 水色
  markCorrectBtn.addEventListener("click", () => {
    userAnswer.classList.remove("wrong");
    userAnswer.classList.add("correct");
    updateScore();
  });

  // × → 薄い赤
  markWrongBtn.addEventListener("click", () => {
    userAnswer.classList.remove("correct");
    userAnswer.classList.add("wrong");
    updateScore();
  });

  hideBtn.addEventListener("click", () => {
    answer.style.display = "none";
  });

  showBtn.addEventListener("click", () => {
    answer.style.display = "block";
  });

  deleteBtn.addEventListener("click", () => {
    set.remove();
    saveData();
    updateScore();
    updateNumbers();
  });

  question.addEventListener("input", saveData);
  userAnswer.addEventListener("input", saveData);
  answer.addEventListener("input", saveData);

  document.getElementById("container").appendChild(set);

  saveData();
  updateScore();
  updateNumbers();
}

/* ------------------------------
   ランダム並び替え
------------------------------ */
function shuffleSets() {
  const container = document.getElementById("container");
  const sets = Array.from(container.querySelectorAll(".qa-set"));

  sets.sort(() => Math.random() - 0.5);
  sets.forEach((set) => container.appendChild(set));

  sets.forEach((set) => {
    const answer = set.querySelector(".answer-text");
    answer.style.display = "none";
  });

  sets.forEach((set) => {
    const userAnswer = set.querySelector(".user-answer");
    userAnswer.value = "";
    userAnswer.classList.remove("correct", "wrong");
  });

  updateScore();
  saveData();
  updateNumbers();
}

/* ------------------------------
   回答欄クリア
------------------------------ */
function clearUserAnswers() {
  const userAnswers = document.querySelectorAll(".user-answer");
  userAnswers.forEach((ua) => {
    ua.value = "";
    ua.classList.remove("correct", "wrong");
  });
  updateScore();
  saveData();
}

/* ------------------------------
   答えを全て表示
------------------------------ */
function showAllAnswers() {
  const sets = document.querySelectorAll(".qa-set");

  sets.forEach((set) => {
    const answer = set.querySelector(".answer-text");
    if (answer) {
      answer.style.display = "block";
    }
  });
}

/* ------------------------------
   正解数と正解率の計算
------------------------------ */
function updateScore() {
  const sets = document.querySelectorAll(".qa-set");
  const total = sets.length;

  let correctCount = 0;

  sets.forEach((set) => {
    const userAnswer = set.querySelector(".user-answer");
    if (userAnswer.classList.contains("correct")) {
      correctCount++;
    }
  });

  // ★ 正解率（％）を計算
  const rate = total > 0 ? Math.floor((correctCount / total) * 100) : 0;

  // ★ 表示を更新
  document.getElementById("score-display").textContent =
    `正解数：${correctCount} / ${total}（${rate}%）`;
}

/* ------------------------------
   ボタン
------------------------------ */
document.getElementById("addSetBtn").addEventListener("click", () => addSet());
document.getElementById("shuffleBtn").addEventListener("click", shuffleSets);
document
  .getElementById("clearUserAnswersBtn")
  .addEventListener("click", clearUserAnswers);
document
  .getElementById("showAllAnswersBtn")
  .addEventListener("click", showAllAnswers);
document
  .getElementById("reviewWrongBtn")
  .addEventListener("click", reviewWrong);
document
  .getElementById("showAllSetsBtn")
  .addEventListener("click", showAllSets);
document.getElementById("copyAllBtn").addEventListener("click", copyAllSets);

/* ------------------------------
   初期ロード
------------------------------ */
loadData();
if (document.querySelectorAll(".qa-set").length === 0) {
  addSet();
}
/* ------------------------------
   不正解だけ復習モード（答えを隠す）
------------------------------ */
function reviewWrong() {
  const sets = document.querySelectorAll(".qa-set");

  sets.forEach((set) => {
    const userAnswer = set.querySelector(".user-answer");
    const answer = set.querySelector(".answer-text");

    // 答えを隠す
    if (answer) {
      answer.style.display = "none";
    }

    // wrong のセットだけ表示
    if (userAnswer.classList.contains("wrong")) {
      set.style.display = "";
    } else {
      set.style.display = "none";
    }
  });

  // ★ 復習モードに入ったら「全セット再表示」ボタンを表示
  document.getElementById("showAllSetsBtn").style.display = "inline-block";
}

/* ------------------------------
   全セットを再表示
------------------------------ */
function showAllSets() {
  const sets = document.querySelectorAll(".qa-set");

  sets.forEach((set) => {
    set.style.display = ""; // 元の横並びレイアウトに戻す
  });

  // ★ 全セットが表示されたらボタンを非表示に戻す
  document.getElementById("showAllSetsBtn").style.display = "none";
}

/* ------------------------------
   全セットコピー（問題に〇×なし／回答にだけ〇×）
------------------------------ */
function copyAllSets() {
  const sets = document.querySelectorAll(".qa-set");

  let lines = [];

  sets.forEach((set) => {
    const q = set.querySelector(".question").value.trim();
    const ua = set.querySelector(".user-answer").value.trim();
    const a = set.querySelector(".answer-text").value.trim();
    const num = set.querySelector(".set-number").textContent;

    // 〇×判定（回答欄のみに付ける）
    let mark = "";
    const userAnswer = set.querySelector(".user-answer");
    if (userAnswer.classList.contains("correct")) mark = "〇";
    if (userAnswer.classList.contains("wrong")) mark = "×";

    // ★ 3段構成（問題には〇×を付けない）
    const block =
      `${num}\n` + // ★ ここを追加
      `問題：${q}\n\n` +
      `回答（${mark}）：${ua}｜\n\n` +
      `答え：${a}\n` +
      `--------------------------------`;

    lines.push(block);
  });

  const text = lines.join("\n");

  navigator.clipboard
    .writeText(text)
    .then(() => alert("全セットをコピーしました！"))
    .catch((err) => console.error("コピー失敗:", err));
}
// TOPへ戻るボタン
const backToTopBtn = document.getElementById("backToTopBtn");

// クリックでトップへ戻る
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

function updateNumbers() {
  const sets = document.querySelectorAll(".qa-set");
  sets.forEach((set, index) => {
    const numBox = set.querySelector(".set-number");
    numBox.textContent = `【${index + 1}】`;
  });
}
