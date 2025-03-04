/** 공동주택 가격 조회 API */
async function fetchApartmentPrice(pnu, year) {
  const url = "https://api.vworld.kr/ned/data/getApartHousingPriceAttr?";
  const keys = await getSecretKey();

  const params = {
    key: keys.dataApiKey,
    pnu: pnu,
    stdrYear: year,
    numOfRows: "1000",
    pageNo: "1",
  };

  return await chrome.runtime.sendMessage({
    type: "API_CALL",
    url: url + new URLSearchParams(params).toString(),
  });
}

/** 단독주택 가격 조회 API */
async function fetchHousePrice(pnu, year) {
  const url = "https://api.vworld.kr/ned/data/getIndvdHousingPriceAttr?";
  const keys = await getSecretKey();

  const params = {
    key: keys.dataApiKey,
    pnu: pnu,
    stdrYear: year,
    numOfRows: "1000",
    pageNo: "1",
  };

  return await chrome.runtime.sendMessage({
    type: "API_CALL",
    url: url + new URLSearchParams(params).toString(),
  });
}
