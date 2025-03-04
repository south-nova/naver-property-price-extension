/** 주소 상세 정보 조회 API */
async function fetchAddress(address) {
  const url = "https://business.juso.go.kr/addrlink/addrLinkApi.do?";
  const keys = await getSecretKey();

  const params = {
    confmKey: keys.addressApiKey,
    currentPage: 1,
    countPerPage: 5,
    keyword: address,
    resultType: "json",
  };

  console.log(params);

  return await chrome.runtime.sendMessage({
    type: "API_CALL",
    url: url + new URLSearchParams(params).toString(),
  });
}
