import { getFingerprint, getFingerprintData } from "@thumbmarkjs/thumbmarkjs";

export async function analyzeBrowser() {
  try {
    const fingerprint = await getFingerprint();
    const data = await getFingerprintData();
    data.fingerprint = fingerprint;
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error analyzing browser:", error);
  }
}

async function analyzeLocation() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching location:", error);
  }
}

// TODO Remove
analyzeBrowser();
analyzeLocation();
