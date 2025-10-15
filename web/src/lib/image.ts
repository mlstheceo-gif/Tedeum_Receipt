import fs from "fs";

export function fileToDataUrl(filePath: string): string {
  const data = fs.readFileSync(filePath);
  const base64 = data.toString("base64");
  // 기본값은 jpeg로 가정. 확장자 판별이 필요하면 확장자에 따라 바꾸세요.
  return `data:image/jpeg;base64,${base64}`;
}
