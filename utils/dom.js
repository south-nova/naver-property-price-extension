const link = document.createElement("link");
link.href = whale.runtime.getURL("../styles.css");
link.type = "text/css";
link.rel = "stylesheet";

document.head.appendChild(link);

/**
 * 돔 랜더링 대기
 * @param {string} selector 돔 선택자
 * @param {number} maxWait 최대 대기 시간 (Default: 5000ms)
 * @returns {Promise<Element>} 돔 요소
 */
function waitForElement(selector, options = {}) {
  const { maxWait = 5000, type = "id" } = options;

  const findElement = () => {
    switch (type) {
      case "id":
        return document.getElementById(selector);
      case "selector":
        return document.querySelector(selector);
      default:
        return null;
    }
  };

  return new Promise((resolve, reject) => {
    try {
      const element = findElement();

      if (element) {
        resolve(element);
        return;
      }

      // DOM 변화 감지
      const observer = new MutationObserver(() => {
        const element = findElement();
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // 타임아웃
      setTimeout(() => {
        observer.disconnect();
        reject(new Error("Timeout waiting for element"));
      }, maxWait);
    } catch (error) {
      reject(error);
    }
  });
}

/** 공시가격 섹션 렌더링 */
async function renderPriceSection() {
  const container = await waitForElement("detailContents1");

  fetch(whale.runtime.getURL("../section.html"))
    .then((response) => response.text())
    .then((html) => {
      container.insertAdjacentHTML("afterbegin", html);
    });
}

/** 연도 Selector 렌더링 */
async function renderYearSelector() {
  const selectWrapper = await waitForElement("select-wrapper");
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - i,
    label: `${currentYear - i}년`,
  }));

  const yearSelector = document.createElement("select");
  yearSelector.name = "year";
  yearSelector.id = "year-selector";

  insertSelectOptions(yearSelector, years);
  yearSelector.selectedIndex = 0;
  selectWrapper.appendChild(yearSelector);

  return yearSelector;
}

/**
 * 동, 호 Selector 랜더링
 * @returns {Promise<{dongSelector: HTMLSelectElement, hoSelector: HTMLSelectElement}>} 동 Select Element, 호 Select Element
 */
async function renderSelector() {
  const selectWrapper = await waitForElement("select-wrapper");

  // 동 명칭 Selector
  const dongSelector = document.createElement("select");
  dongSelector.name = "dongName";
  dongSelector.id = "dong-selector";
  selectWrapper.appendChild(dongSelector);

  // 호 명칭 Selector
  const hoSelector = document.createElement("select");
  hoSelector.name = "hoName";
  hoSelector.id = "ho-selector";
  selectWrapper.appendChild(hoSelector);

  // 셀렉터 초기화
  await Promise.all([
    clearSelector(dongSelector, { value: "", label: "(동 선택)" }),
    clearSelector(hoSelector, { value: "", label: "(호 선택)" }),
  ]);

  return { dongSelector, hoSelector };
}

/**
 * 공시가격 값 변경
 * @param {string} price 공시가격
 */
async function changePrice(price) {
  const priceNum = price ? Number(price) : null;
  const priceStr = priceNum ? priceNum.toLocaleString("ko-KR") : "-";
  const price126Str = priceNum
    ? (priceNum * 1.26).toLocaleString("ko-KR")
    : "-";

  const [priceValue, price126Value] = await Promise.all([
    waitForElement("price-value"),
    waitForElement("price-126-value"),
  ]);

  priceValue.textContent = priceStr;
  price126Value.textContent = price126Str;
}

/**
 * Selector 초기화
 * @param {Element} selectorElement Selector 요소
 * @param {{value: string, label: string}[]} defaultOption 기본 옵션
 */
async function clearSelector(selectorElement, defaultOption) {
  selectorElement.options.length = 0;

  if (defaultOption) {
    const { value, label } = defaultOption;
    const option = new Option(label, value, true, true);

    option.disabled = true;
    selectorElement.appendChild(option);
  }
}

/**
 * Select 옵션 추가
 * @param {Element} selectElement Select 요소
 * @param {{value: string, label: string}[]} options 추가할 옵션 목록
 */
function insertSelectOptions(selectElement, options) {
  const fragment = document.createDocumentFragment();

  options.forEach(({ value, label }) => {
    const option = new Option(label, String(value), false, false);
    fragment.appendChild(option);
  });

  selectElement.appendChild(fragment);
}
