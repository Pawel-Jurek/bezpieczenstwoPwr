export function createOverlay(): HTMLDivElement {
  const testOverlay = document.createElement("div");
  testOverlay.innerHTML = `<input type="checkbox">`;

  const styles: Partial<CSSStyleDeclaration> = {
    display: "none",
    position: "fixed",
    inset: "0",
    backgroundColor: "red",
  };

  Object.assign(testOverlay.style, styles);

  document.body.appendChild(testOverlay);

  return testOverlay;
}
