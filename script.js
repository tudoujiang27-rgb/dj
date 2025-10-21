const themeConfigs = {
  general: {
    label: "喜庆吉祥",
    hint: "适用于节日、庆典等场景，突出祥瑞与喜庆氛围。",
    fallbackKeyword: "春辉",
    defaultName: "贵宾",
    upperPatterns: [
      ({ keyword, lead, name }) => `${name}喜纳${keyword}开瑞境`,
      ({ keyword, lead, name }) => `${lead || keyword}春光伴${name}添锦绣`,
      ({ keyword, lead, name }) => `${name}引${keyword}和气满堂`
    ],
    lowerPatterns: [
      ({ keyword, lead, name }) => `${keyword}瑞气照${name}门`,
      ({ keyword, lead, name }) => `${name}拥${keyword}福祉盈`,
      ({ keyword, lead, name }) => `${keyword}彩绕${name}家`
    ],
    horizontalTemplates: [
      ({ keyword, name }) => `${keyword}纳福`,
      ({ keyword, name }) => `${name}门瑞`,
      ({ keyword, name }) => `喜满${name}`
    ]
  },
  career: {
    label: "事业腾飞",
    hint: "强调发展壮大、开拓进取，适合企业或职场祝福。",
    fallbackKeyword: "宏图",
    defaultName: "英贤",
    upperPatterns: [
      ({ keyword, lead, name }) => `${name}志定${keyword}开新局`,
      ({ keyword, lead, name }) => `砺炼${keyword}${name}展雄风`,
      ({ keyword, lead, name }) => `${name}乘${keyword}劲破长空`
    ],
    lowerPatterns: [
      ({ keyword, lead, name }) => `${keyword}伟业与${name}同辉`,
      ({ keyword, lead, name }) => `${name}携${keyword}力创优`,
      ({ keyword, lead, name }) => `${keyword}宏图随${name}起`
    ],
    horizontalTemplates: [
      ({ keyword, name }) => `${name}创辉`,
      ({ keyword, name }) => `${keyword}宏业`,
      ({ keyword, name }) => `事业长青`
    ]
  },
  family: {
    label: "阖家幸福",
    hint: "突出家庭和美、亲情温暖，适用于乔迁、团圆祝福。",
    fallbackKeyword: "福泽",
    defaultName: "吉居",
    upperPatterns: [
      ({ keyword, lead, name }) => `${name}庭迎${keyword}添喜色`,
      ({ keyword, lead, name }) => `${keyword}春暖${name}家声`,
      ({ keyword, lead, name }) => `${name}笑纳${keyword}满堂香`
    ],
    lowerPatterns: [
      ({ keyword, lead, name }) => `${keyword}福旺${name}阖府安`,
      ({ keyword, lead, name }) => `${name}家和${keyword}景常开`,
      ({ keyword, lead, name }) => `${keyword}祥绕${name}堂`
    ],
    horizontalTemplates: [
      ({ keyword, name }) => `${name}家和`,
      ({ keyword, name }) => `${keyword}永宁`,
      ({ keyword, name }) => `阖府同欢`
    ]
  },
  study: {
    label: "书房雅趣",
    hint: "突出书香气息与学问精进，适用于书房与学业场景。",
    fallbackKeyword: "翰墨",
    defaultName: "清雅",
    upperPatterns: [
      ({ keyword, lead, name }) => `${name}挥${keyword}墨香满室`,
      ({ keyword, lead, name }) => `${keyword}典藏${name}品雅风`,
      ({ keyword, lead, name }) => `${name}品${keyword}书声朗`
    ],
    lowerPatterns: [
      ({ keyword, lead, name }) => `${keyword}卷润${name}心更静`,
      ({ keyword, lead, name }) => `${name}伴${keyword}笔耕勤`,
      ({ keyword, lead, name }) => `${keyword}墨映${name}窗`
    ],
    horizontalTemplates: [
      ({ keyword, name }) => `${name}书香`,
      ({ keyword, name }) => `${keyword}雅室`,
      ({ keyword, name }) => `学海常新`
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("couplet-form");
  const lineInput = document.getElementById("lineInput");
  const themeSelect = document.getElementById("theme");
  const nameInput = document.getElementById("userName");
  const messageEl = document.getElementById("formMessage");
  const resultSection = document.getElementById("result");
  const upperLineEl = document.getElementById("upperLine");
  const lowerLineEl = document.getElementById("lowerLine");
  const horizontalEl = document.getElementById("horizontalText");
  const themeHintEl = document.getElementById("themeHint");
  const downloadButton = document.getElementById("downloadButton");
  const downloadActions = document.getElementById("downloadActions");

  const downloadState = {
    content: "",
    filename: ""
  };

  const updateHint = () => {
    const config = themeConfigs[themeSelect.value] || themeConfigs.general;
    themeHintEl.textContent = config.hint;
  };

  updateHint();
  themeSelect.addEventListener("change", updateHint);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    messageEl.textContent = "";

    const rawLine = lineInput.value.trim();
    if (!rawLine) {
      messageEl.textContent = "请先输入上联或下联内容。";
      lineInput.focus();
      return;
    }

    const selectedType = form.querySelector('input[name="lineType"]:checked')?.value || "upper";
    const themeKey = themeSelect.value;
    const name = nameInput.value;

    const { upperLine, lowerLine, horizontal, nameUsed, themeLabel } = buildCouplet({
      inputLine: rawLine,
      orientation: selectedType,
      name,
      themeKey
    });

    upperLineEl.textContent = upperLine;
    lowerLineEl.textContent = lowerLine;
    horizontalEl.textContent = horizontal;
    resultSection.classList.remove("hidden");

    downloadState.content = composeDownloadContent({
      upperLine,
      lowerLine,
      horizontal,
      themeLabel,
      nameUsed,
      orientation: selectedType
    });
    downloadState.filename = buildDownloadFilename({
      nameUsed,
      themeLabel
    });

    downloadButton.disabled = false;
    downloadActions.classList.remove("hidden");
  });

  downloadButton.addEventListener("click", () => {
    if (!downloadState.content) {
      return;
    }

    const blob = new Blob([downloadState.content], {
      type: "text/plain;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = downloadState.filename || "对联.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  });
});

function buildCouplet({ inputLine, orientation, name, themeKey }) {
  const config = themeConfigs[themeKey] || themeConfigs.general;
  const safeName = sanitizeName(name, config.defaultName);
  const keywords = extractKeywords(inputLine, config.fallbackKeyword);

  const counterpartPatterns =
    orientation === "upper" ? config.lowerPatterns : config.upperPatterns;
  const counterpartGenerator = selectWithSeed(
    counterpartPatterns,
    `${inputLine}-${orientation}-${safeName}`
  );

  const horizontalGenerator = selectWithSeed(
    config.horizontalTemplates,
    `${safeName}-${keywords.main}`
  );

  const counterpartLine = counterpartGenerator({
    keyword: keywords.main,
    lead: keywords.lead,
    name: safeName
  });

  const horizontal = horizontalGenerator({
    keyword: keywords.main,
    lead: keywords.lead,
    name: safeName
  });

  if (orientation === "upper") {
    return {
      upperLine: inputLine,
      lowerLine: counterpartLine,
      horizontal,
      nameUsed: safeName,
      themeLabel: config.label
    };
  }

  return {
    upperLine: counterpartLine,
    lowerLine: inputLine,
    horizontal,
    nameUsed: safeName,
    themeLabel: config.label
  };
}

function sanitizeName(name, fallback) {
  if (!name) return fallback;
  const trimmed = name.trim();
  if (!trimmed) return fallback;
  const clean = trimmed.replace(/[^\u4e00-\u9fa5a-zA-Z]/g, "");
  return clean || fallback;
}

function extractKeywords(line, fallback) {
  const onlyChinese = line.replace(/[^\u4e00-\u9fa5]/g, "");
  if (!onlyChinese) {
    return {
      main: fallback,
      lead: fallback
    };
  }

  if (onlyChinese.length === 1) {
    const doubled = onlyChinese.repeat(2);
    return {
      main: doubled,
      lead: doubled
    };
  }

  return {
    main: onlyChinese.slice(-2),
    lead: onlyChinese.slice(0, 2)
  };
}

function selectWithSeed(patterns, seedText) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    return () => "";
  }
  const seed = computeSeed(seedText);
  const index = seed % patterns.length;
  return patterns[index];
}

function computeSeed(text) {
  let total = 0;
  for (let i = 0; i < text.length; i += 1) {
    total += text.charCodeAt(i);
  }
  return total;
}

function composeDownloadContent({
  upperLine,
  lowerLine,
  horizontal,
  themeLabel,
  nameUsed,
  orientation
}) {
  const orientationLabel =
    orientation === "upper" ? "根据上联生成下联" : "根据下联生成上联";
  const timestamp = new Date();
  const formattedTime = `${timestamp.getFullYear()}-${String(
    timestamp.getMonth() + 1
  ).padStart(2, "0")}-${String(timestamp.getDate()).padStart(2, "0")}`;

  return [
    "AI智能对联生成器",
    `生成日期：${formattedTime}`,
    `主题：${themeLabel}`,
    `姓名：${nameUsed}`,
    `生成模式：${orientationLabel}`,
    "",
    `上联：${upperLine}`,
    `下联：${lowerLine}`,
    `横批：${horizontal}`,
    ""
  ].join("\n");
}

function buildDownloadFilename({ nameUsed, themeLabel }) {
  const safeTheme = sanitizeFileName(themeLabel);
  const safeName = sanitizeFileName(nameUsed);
  return `AI对联-${safeTheme}-${safeName}.txt`;
}

function sanitizeFileName(text) {
  if (!text) {
    return "对联";
  }
  return text.replace(/[\\/:*?"<>|]/g, "_");
}
