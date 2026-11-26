let bgImage; // 儲存背景圖片 bg/3.png
let bgOffsetX = 0; // 記錄背景水平捲動偏移量（負值代表背景往左移動）
let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖
let characterX; // 儲存角色一目前的水平中心位置
let isWalking = false; // 記錄角色是否已切換為走路動畫
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效

// 角色二相關變數
let char2StopSprite; // 儲存角色二的待機精靈圖 2/stop/stop.png
let char2ActionSprite; // 儲存角色二的動作精靈圖 2/action/action.png
let char2IsAction = false; // 記錄角色二目前是否處於接近動作狀態
let char2StateStartFrame = 0; // 記錄角色二狀態切換時的起始畫面計數

// 數學加法選擇題與按鈕相關變數
let currentQuiz = null; // 儲存目前題目物件 { question, options, answerIndex }
let selectedOptionIndex = -1; // 記錄玩家選擇的選項索引（-1 代表尚未作答）
let optionButtons = []; // 儲存四個實體按鈕 DOM 元素

// 三秒特效相關變數（煙火與閃電）
let activeFeedbackType = null; // 'fireworks' | 'lightning' | null
let feedbackStartTime = 0; // 特效開始時間（毫秒）
const FEEDBACK_DURATION = 3000; // 特效持續時間：3 秒（3000 毫秒）
let fireworkParticles = []; // 儲存煙火粒子陣列

const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度（1395 除以 10）
const frameHeight = 196; // 設定每個影格的高度
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度
const walkFrameHeight = 198; // 設定走路動畫每格的高度
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度
const magicFrameHeight = 146; // 設定施法動畫每格的高度
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度
const effectFrameHeight = 19; // 設定魔法特效每格的高度
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

// 角色二精靈圖規格常數
const char2StopFrameCount = 8; // 設定角色二待機精靈圖的影格數
const char2StopFrameWidth = 699 / char2StopFrameCount; // 計算角色二待機每格寬度（699 除以 8）
const char2StopFrameHeight = 190; // 設定角色二待機精靈圖高度
const char2ActionFrameCount = 12; // 設定角色二動作精靈圖的影格數
const char2ActionFrameWidth = 1627 / char2ActionFrameCount; // 計算角色二動作每格寬度（1627 除以 12）
const char2ActionFrameHeight = 171; // 設定角色二動作精靈圖高度

function preload() { // 在畫布建立前載入圖片資源
  bgImage = loadImage("bg/3.png"); // 載入背景圖片 bg/3.png
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖
  char2StopSprite = loadImage("2/stop/stop.png"); // 載入角色二的八格待機精靈圖
  char2ActionSprite = loadImage("2/action/action.png"); // 載入角色二的十二格動作精靈圖
} // 結束圖片載入函式

function setup() { // 初始化畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布
  imageMode(CENTER); // 讓座標代表影格的中心點
  characterX = (width * 2) / 3; // 將角色初始位置設在畫布寬度的三分之二處
  frameRate(60); // 將動畫更新速率設定為每秒六十格
  createQuizButtons(); // 建立四個選項按鈕（預設隱藏）
  generateAdditionQuiz(); // 預先產生第一題數學加法選擇題
} // 結束初始化函式

// 建立四個選項按鈕
function createQuizButtons() {
  const labels = ["A", "B", "C", "D"];
  for (let i = 0; i < 4; i++) {
    const btn = createButton("");
    btn.style("font-weight", "bold");
    btn.style("border", "1.5px solid #555");
    btn.style("border-radius", "8px");
    btn.style("background-color", "rgba(255, 255, 255, 0.9)");
    btn.style("color", "#222");
    btn.style("cursor", "pointer");
    btn.style("transition", "background-color 0.2s");
    btn.mousePressed(() => handleOptionClick(i));
    btn.hide();
    optionButtons.push(btn);
  }
}

// 處理按鈕點擊作答與觸發 3 秒特效
function handleOptionClick(index) {
  if (!currentQuiz) return;
  selectedOptionIndex = index;

  // 更新按鈕顏色回饋
  for (let i = 0; i < optionButtons.length; i++) {
    if (i === currentQuiz.answerIndex) {
      optionButtons[i].style("background-color", "rgba(76, 175, 80, 0.95)");
      optionButtons[i].style("color", "#fff");
    } else if (i === index) {
      optionButtons[i].style("background-color", "rgba(244, 67, 54, 0.95)");
      optionButtons[i].style("color", "#fff");
    } else {
      optionButtons[i].style("background-color", "rgba(255, 255, 255, 0.7)");
      optionButtons[i].style("color", "#555");
    }
  }

  // 啟動對應的三秒特效
  feedbackStartTime = millis();
  if (index === currentQuiz.answerIndex) {
    activeFeedbackType = "fireworks";
    fireworkParticles = [];
    spawnFireworkBurst(width * 0.3, height * 0.35);
    spawnFireworkBurst(width * 0.7, height * 0.35);
  } else {
    activeFeedbackType = "lightning";
  }
}

// 產生隨機數學加法選擇題
function generateAdditionQuiz() {
  const numA = floor(random(1, 50));
  const numB = floor(random(1, 50));
  const correctAnswer = numA + numB;

  const optionsSet = new Set([correctAnswer]);
  while (optionsSet.size < 4) {
    const offset = floor(random(-10, 11));
    const candidate = correctAnswer + offset;
    if (candidate > 0 && candidate !== correctAnswer) {
      optionsSet.add(candidate);
    }
  }

  const options = shuffle(Array.from(optionsSet));
  currentQuiz = {
    question: `${numA} + ${numB} = ?`,
    options: options,
    answerIndex: options.indexOf(correctAnswer)
  };
  selectedOptionIndex = -1;

  // 重置按鈕文字與預設樣式
  const labels = ["A", "B", "C", "D"];
  for (let i = 0; i < optionButtons.length; i++) {
    optionButtons[i].html(`${labels[i]}.  ${options[i]}`);
    optionButtons[i].style("background-color", "rgba(255, 255, 255, 0.9)");
    optionButtons[i].style("color", "#222");
  }
}

function draw() { // 每個畫面更新一次背景與角色
  background("#87CEEB"); // 預設底色避免圖片載入前空白

  // 計算單張背景圖片依畫布高度等比例縮放後的寬度（確保至少與畫布同寬以完整覆蓋畫面）
  const bgAspect = bgImage && bgImage.height > 0 ? bgImage.width / bgImage.height : 1;
  const singleBgWidth = max(width, height * bgAspect);
  const singleBgHeight = height;

  // 計算三張背景串接後的可捲動範圍
  const minBgOffset = width - singleBgWidth * 2;
  const maxBgOffset = singleBgWidth;
  const anchorX = (width * 2) / 3; // 角色在捲動模式下的基準水平位置

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  isWalking = movingRight || movingLeft; // 沒有按住左右鍵時切回站立動畫
  const movementStep = constrain(width * 0.004, 2, 8); // 依畫布寬度計算適合不同裝置的移動速度

  // 維持角色高度為畫布高度的 1/3，寬度依原圖寬高比等比例縮放
  const characterScale = (height / 3) / frameHeight;
  const characterWidth = frameWidth * characterScale; // 計算角色基本顯示寬度
  const characterHeight = height / 3;

  if (movingRight) { // 按住右方向鍵
    isWalking = true;
    facingDirection = 1;
    if (characterX < anchorX) {
      characterX = min(anchorX, characterX + movementStep);
    } else if (bgOffsetX > minBgOffset) {
      bgOffsetX = max(minBgOffset, bgOffsetX - movementStep);
    } else {
      characterX += movementStep;
    }
  } else if (movingLeft) { // 按住左方向鍵
    isWalking = true;
    facingDirection = -1;
    if (characterX > anchorX) {
      characterX = max(anchorX, characterX - movementStep);
    } else if (bgOffsetX < maxBgOffset) {
      bgOffsetX = min(maxBgOffset, bgOffsetX + movementStep);
    } else {
      characterX -= movementStep;
    }
  }

  // 限制角色中心避免超出畫布左右邊界
  characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2);

  // 繪製三張左右串接的背景圖片（左、中、右）
  if (bgImage) {
    push();
    imageMode(CORNER);
    for (let i = -1; i <= 1; i++) {
      const drawX = bgOffsetX + i * singleBgWidth;
      image(bgImage, drawX, 0, singleBgWidth, singleBgHeight);
    }
    pop();
  }

  // --- 角色二邏輯與繪製（位於最左邊背景圖的中間） ---
  const char2X = bgOffsetX - singleBgWidth / 2;
  const triggerDistance = (characterWidth + char2StopFrameWidth * characterScale) * 1.2;
  const isNearChar2 = abs(characterX - char2X) <= triggerDistance;

  if (isNearChar2 !== char2IsAction) {
    char2IsAction = isNearChar2;
    char2StateStartFrame = frameCount;
    if (char2IsAction) {
      generateAdditionQuiz(); // 每次重新接近角色二時產生新題目
    }
  }

  const char2Sprite = char2IsAction ? char2ActionSprite : char2StopSprite;
  const char2FrameCount = char2IsAction ? char2ActionFrameCount : char2StopFrameCount;
  const char2FrameWidth = char2IsAction ? char2ActionFrameWidth : char2StopFrameWidth;
  const char2FrameHeight = char2IsAction ? char2ActionFrameHeight : char2StopFrameHeight;
  const char2FrameIndex = floor((frameCount - char2StateStartFrame) / framesPerStep) % char2FrameCount;
  const char2SourceX = char2FrameIndex * char2FrameWidth;
  const char2DisplayWidth = char2FrameWidth * characterScale;
  const char2DisplayHeight = char2FrameHeight * characterScale;
  const char2Y = height - char2DisplayHeight / 2;

  if (char2Sprite) {
    push();
    translate(char2X, char2Y);
    image(char2Sprite, 0, 0, char2DisplayWidth, char2DisplayHeight, char2SourceX, 0, char2FrameWidth, char2FrameHeight);
    pop();
  }
  // ------------------------------------------------

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) {
    isCasting = false;
    activeEffects.push({ x: characterX + magicDirection * characterWidth / 2, y: height - characterHeight * 0.58, direction: magicDirection });
  }

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite;
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite;
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth;
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight;
  const elapsedMagicFrames = frameCount - magicStartFrame;
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount;
  const sourceX = frameIndex * activeFrameWidth;
  const activeWidth = activeFrameWidth * characterScale;
  const activeHeight = activeFrameHeight * characterScale;
  const characterY = height - activeHeight / 2;

  push();
  translate(characterX, characterY);
  scale(isCasting ? magicDirection : facingDirection, 1);
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight);
  pop();

  const effectScale = characterScale;
  const effectWidth = effectFrameWidth * effectScale;
  const effectHeight = effectFrameHeight * effectScale;
  const effectSpeed = max(6, width * 0.008);
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) {
    const effect = activeEffects[effectIndex];
    effect.x += effect.direction * effectSpeed;
    if (effect.x > width || effect.x < 0) {
      activeEffects.splice(effectIndex, 1);
      continue;
    }
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount;
    push();
    translate(effect.x, effect.y);
    scale(effect.direction, 1);
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight);
    pop();
  }

  // --- 當角色1接近角色2時，顯示上方透明度90黃色方框與按鈕 ---
  if (isNearChar2 && currentQuiz) {
    drawQuizBoxAndButtons();
  } else {
    hideQuizButtons();
  }

  // --- 更新並繪製 3 秒煙火或閃電特效 ---
  updateAndDrawFeedbackEffects();
} // 結束繪圖函式

// 繪製透明度90的黃色方框並定位四個作答按鈕
function drawQuizBoxAndButtons() {
  const boxW = width / 3; // 寬為整個畫布寬的 1/3
  const boxH = height / 2; // 高為整個畫布高的 1/2
  const boxX = (width - boxW) / 2; // 方框的中間對準畫布的中間
  const boxY = 10; // 方框上方靠近畫布上方

  push();
  rectMode(CORNER);
  // 透明度為 90 的黃色方框
  fill(255, 235, 59, 90);
  stroke(200, 160, 0, 180);
  strokeWeight(2);
  rect(boxX, boxY, boxW, boxH, 12);

  // 標題與題目文字
  noStroke();
  fill(20);
  textAlign(CENTER, CENTER);

  const titleSize = constrain(boxH * 0.08, 14, 24);
  textSize(titleSize);
  textStyle(BOLD);
  text("數學加法挑戰", boxX + boxW / 2, boxY + boxH * 0.12);

  const questionSize = constrain(boxH * 0.13, 18, 36);
  textSize(questionSize);
  text(currentQuiz.question, boxX + boxW / 2, boxY + boxH * 0.26);

  // 定位並顯示四個實體作答按鈕
  const optionW = boxW * 0.8;
  const optionH = boxH * 0.11;
  const optionX = boxX + (boxW - optionW) / 2;
  const startY = boxY + boxH * 0.38;
  const gapY = boxH * 0.132;
  const btnFontSize = constrain(boxH * 0.065, 13, 20);

  for (let i = 0; i < optionButtons.length; i++) {
    const btn = optionButtons[i];
    const optY = startY + i * gapY;
    btn.position(optionX, optY);
    btn.size(optionW, optionH);
    btn.style("font-size", `${btnFontSize}px`);
    btn.show();
  }

  // 顯示作答結果回饋文字
  if (selectedOptionIndex !== -1) {
    textSize(constrain(boxH * 0.065, 12, 18));
    textStyle(BOLD);
    if (selectedOptionIndex === currentQuiz.answerIndex) {
      fill(20, 110, 30);
      text("答對了！放煙火慶祝！", boxX + boxW / 2, boxY + boxH * 0.94);
    } else {
      fill(180, 20, 20);
      text(`答錯了！正確答案是 ${currentQuiz.options[currentQuiz.answerIndex]}`, boxX + boxW / 2, boxY + boxH * 0.94);
    }
  }
  pop();
}

function hideQuizButtons() {
  for (let btn of optionButtons) {
    btn.hide();
  }
}

// 更新與繪製三秒煙火或三秒閃電特效
function updateAndDrawFeedbackEffects() {
  if (!activeFeedbackType) return;

  const elapsed = millis() - feedbackStartTime;
  if (elapsed >= FEEDBACK_DURATION) {
    activeFeedbackType = null;
    fireworkParticles = [];
    return;
  }

  if (activeFeedbackType === "fireworks") {
    // 每隔約 18 幀在畫面上方兩側隨機產生新的煙火爆發
    if (frameCount % 18 === 0) {
      const burstX = random() < 0.5 ? random(width * 0.1, width * 0.32) : random(width * 0.68, width * 0.9);
      const burstY = random(height * 0.15, height * 0.55);
      spawnFireworkBurst(burstX, burstY);
    }
    updateAndDrawFireworks();
  } else if (activeFeedbackType === "lightning") {
    drawLightningEffect();
  }
}

// 產生單次煙火粒子爆發
function spawnFireworkBurst(cx, cy) {
  const palette = [
    [255, 82, 82],
    [255, 215, 64],
    [105, 240, 174],
    [64, 196, 255],
    [224, 64, 251],
    [255, 110, 64]
  ];
  const baseColor = random(palette);
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    const angle = random(TWO_PI);
    const speed = random(2, 7.5);
    fireworkParticles.push({
      x: cx,
      y: cy,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      alpha: 255,
      size: random(4, 8),
      color: baseColor
    });
  }
}

// 更新並繪製煙火粒子
function updateAndDrawFireworks() {
  push();
  noStroke();
  for (let i = fireworkParticles.length - 1; i >= 0; i--) {
    const p = fireworkParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12; // 模擬重力下墜
    p.vx *= 0.97; // 空氣阻力
    p.alpha -= 4.5;

    if (p.alpha <= 0) {
      fireworkParticles.splice(i, 1);
      continue;
    }

    fill(p.color[0], p.color[1], p.color[2], p.alpha);
    circle(p.x, p.y, p.size);
  }
  pop();
}

// 繪製三秒閃電特效
function drawLightningEffect() {
  push();
  // 偶發性全畫面微暗閃爍
  if (frameCount % 6 < 2) {
    noStroke();
    fill(255, 255, 255, 55);
    rectMode(CORNER);
    rect(0, 0, width, height);
  }

  // 每隔幾幀重新生成閃電鋸齒路徑
  if (frameCount % 4 === 0 || frameCount % 4 === 1) {
    const boltCount = 2; // 同時產生兩道閃電
    for (let b = 0; b < boltCount; b++) {
      let currX = random(width * 0.15, width * 0.85);
      let currY = 0;
      const targetY = height * 0.85;
      const segments = 14;
      const stepY = targetY / segments;

      const points = [{ x: currX, y: currY }];
      for (let s = 0; s < segments; s++) {
        currX += random(-45, 45);
        currY += stepY;
        points.push({ x: currX, y: currY });
      }

      // 外層藍紫色電光暈
      noFill();
      stroke(130, 180, 255, 160);
      strokeWeight(10);
      beginShape();
      for (let pt of points) vertex(pt.x, pt.y);
      endShape();

      // 內層高亮白光核心
      stroke(255, 255, 255, 245);
      strokeWeight(3.5);
      beginShape();
      for (let pt of points) vertex(pt.x, pt.y);
      endShape();
    }
  }
  pop();
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    isWalking = true;
    facingDirection = 1;
    return false;
  }
  if (keyCode === LEFT_ARROW) {
    isWalking = true;
    facingDirection = -1;
    return false;
  }
  if (keyCode === 32) {
    if (!spaceIsDown && !isCasting) {
      isCasting = true;
      magicStartFrame = frameCount;
      magicDirection = facingDirection;
    }
    spaceIsDown = true;
    return false;
  }
}

function keyReleased() {
  if (keyCode === 32) {
    spaceIsDown = false;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  characterX = constrain(characterX, 1, width - 1);
}