import { getFingerprint, getFingerprintData } from "@thumbmarkjs/thumbmarkjs";

export async function analyzeBrowser() {
  try {
    const fingerprint = await getFingerprint();
    const data = await getFingerprintData();
    data.fingerprint = fingerprint;
    return data;
  } catch (error) {
    console.error("Error analyzing browser:", error);
  }
}

export async function analyzeLocation() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching location:", error);
  }
}
