/** Canvas textures capture glyphs at draw time, so wait for the actual Cyrillic faces. */
export function readyCanvasFonts() {
  return Promise.allSettled([400,500,600,700].map(weight =>
    document.fonts.load(`${weight} 16px "Code Next"`, 'Телецентр ИНВИТРО 123')
  ));
}
