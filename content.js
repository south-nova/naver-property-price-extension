let prevArticleNo = null;

// URL 변경 감지 및 스크립트 실행
async function handleURLChange() {
  const url = new URL(window.location.href);
  const currentArticleNo = url.searchParams.get("articleNo");

  // 이전 매물 번호와 같다면 리턴
  if (!currentArticleNo || currentArticleNo === prevArticleNo) return;

  prevArticleNo = currentArticleNo;

  try {
    const [yearSelector, property] = await Promise.all([
      renderYearSelector(), // 연도 선택기 렌더링
      getPropertyDetails(), // PNU, 건물 유형 조회
      renderPriceSection(), // 공시가격 섹션 렌더링
    ]);

    if (!property) {
      await changePrice(); // 주소 데이터가 없을 경우 주택 가격 초기화
      return;
    }

    // 공동주택일 경우 동, 호 Selector 렌더링
    if (property.buildingType === "1") await renderSelector();

    const handleYearChange = async (e) => {
      const year = e.target.value;
      const priceInitializer =
        property.buildingType === "1"
          ? initializeApartmentPriceSelector
          : initializeHousePriceSelector;

      await priceInitializer(property.pnu, year);
    };

    yearSelector.addEventListener("change", handleYearChange);
    yearSelector.dispatchEvent(new Event("change"));
  } catch (error) {
    console.error(error);
  }
}

// DOM 변경 감지
const observer = new MutationObserver(handleURLChange);
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
