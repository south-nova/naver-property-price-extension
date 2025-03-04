/**
 * 페이지에서 매물 주소 추출
 * @returns {Promise<string | null>} 주소
 */
async function extractAddressFromPage() {
  try {
    const table = await waitForElement(
      "#detailContents1 > div.detail_box--summary > table",
      { type: "selector" }
    );

    if (!table) return null;

    const rows = table.querySelector("tbody").querySelectorAll("tr");
    for (const row of rows) {
      const th = row.querySelector(".table_th");

      if (th?.textContent.includes("소재지")) {
        const address = row.querySelector(".table_td").textContent;
        const hasBunji = /\d+(-\d+)?$/.test(address.trim()); // 주소 끝에 숫자 또는 숫자-숫자 패턴 체크

        return hasBunji ? address : null;
      }
    }

    return null;
  } catch (error) {
    throw error;
  }
}

/**
 * 건물의 PNU와 건물 타입 조회
 * @returns {Promise<{buildingType: string, pnu: string} | null>} 건물 유형, 행정동 코드
 */
async function getPropertyDetails() {
  try {
    const address = await extractAddressFromPage();
    if (!address) return null;

    const response = await fetchAddress(address);

    const results = response.data.results.juso;
    if (results?.length > 0) {
      const exactMatch = results.find((result) => {
        const address = result.jibunAddr.split(" ").slice(-2).join(" ");
        const inputAddress = address.split(" ").slice(-2).join(" ");

        return address === inputAddress;
      });

      if (exactMatch) {
        const buildingType = exactMatch.bdKdcd;
        const ji = exactMatch.lnbrMnnm.padStart(4, "0");
        const bun = exactMatch.lnbrSlno.padStart(4, "0");
        const pnu = `${exactMatch.admCd}1${ji}${bun}`;

        return { buildingType, pnu };
      }
    }

    return null;
  } catch (error) {
    throw error;
  }
}
