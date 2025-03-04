/**
 * 공동주택 가격 데이터 그룹화
 * @param {Array} items 공동주택 가격 데이터
 * @returns {Object} 동 이름을 키로 하는 객체
 */
function groupApartmentsByBuilding(items) {
  return items.reduce((acc, item) => {
    const dongName = item.dongNm || "동 명칭 없음";

    if (!acc[dongName]) acc[dongName] = [];

    acc[dongName].push({
      hoName: item.hoNm,
      area: item.prvuseAr,
      price: item.pblntfPc,
      updatedAt: item.lastUpdtDt,
    });

    return acc;
  }, {});
}

/**
 * 공동주택 가격 선택기 초기화
 * @param {string} pnu 공동주택 고유 코드
 */
async function initializeApartmentPriceSelector(pnu, year) {
  let selectedDong = null;
  let cleanup = null;

  try {
    await changePrice();

    const selectWrapper = await waitForElement("select-wrapper");
    const dongSelector = selectWrapper.querySelector("#dong-selector");
    const hoSelector = selectWrapper.querySelector("#ho-selector");

    // 셀렉터 초기화
    await Promise.all([
      clearSelector(dongSelector, { value: "", label: "(동 선택)" }),
      clearSelector(hoSelector, { value: "", label: "(호 선택)" }),
    ]);

    // 공동주택 가격 조회
    const results = await fetchApartmentPrice(pnu, year);
    const apartmentUnits = results.data.apartHousingPrices?.field;
    if (!apartmentUnits) return;

    const apartmentsByDong = groupApartmentsByBuilding(apartmentUnits);

    // 동 선택 옵션 추가
    const dongNames = sortedNames(Object.keys(apartmentsByDong));
    const dongOptions = dongNames.map((item) => ({
      value: item,
      label: item,
    }));

    insertSelectOptions(dongSelector, dongOptions);

    const handleDongChange = async (e) => {
      selectedDong = e.target.value;

      await Promise.all([
        changePrice(),
        clearSelector(hoSelector, { value: "", label: "(호 선택)" }),
      ]);

      const hoList = sortedObjectsByKey(
        apartmentsByDong[selectedDong],
        "hoName"
      );
      const hoOptions = hoList.map((item) => ({
        value: item.hoName,
        label: `${item.hoName} (${item.area}㎡)`,
      }));

      insertSelectOptions(hoSelector, hoOptions);
    };

    const handleHoChange = async (e) => {
      const selectedHo = apartmentsByDong[selectedDong]?.find(
        (item) => item.hoName === e.target.value
      );

      if (selectedHo) {
        await changePrice(selectedHo.price);
      }
    };

    dongSelector.addEventListener("change", handleDongChange);
    hoSelector.addEventListener("change", handleHoChange);

    cleanup = () => {
      dongSelector.removeEventListener("change", handleDongChange);
      hoSelector.removeEventListener("change", handleHoChange);
    };
  } catch (error) {
    throw error;
  }

  return cleanup;
}

/**
 * 단독주택 가격 초기화
 * @param {string} pnu 단독주택 고유 코드
 */
async function initializeHousePriceSelector(pnu, year) {
  try {
    const results = await fetchHousePrice(pnu, year);
    const house = results.data.indvdHousingPrices?.field[0];

    await changePrice(house?.housePc || null);
  } catch (error) {
    throw error;
  }
}
