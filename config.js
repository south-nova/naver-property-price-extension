async function getSecretKey() {
  const response = await fetch(chrome.runtime.getURL("secret.json"));
  const keys = await response.json();
  console.log("🚀 ~ getSecretKey ~ keys:", keys);

  return {
    addressApiKey: keys.addressApiKey,
    dataApiKey: keys.dataApiKey,
  };
}
