function compareWithNumbers(a, b) {
  // 숫자 추출
  const numA = a.match(/\d+/)?.[0] || "";
  const numB = b.match(/\d+/)?.[0] || "";

  // 둘 다 숫자를 포함하면 숫자로 비교
  if (numA && numB) {
    return parseInt(numA) - parseInt(numB);
  }

  // 그 외에는 일반 문자열 비교
  return a.localeCompare(b, "ko");
}

// 배열 정렬용
function sortedNames(names) {
  return names.sort(compareWithNumbers);
}

// 객체 배열 정렬용
function sortedObjectsByKey(items, key) {
  return [...items].sort((a, b) => compareWithNumbers(a[key], b[key]));
}
