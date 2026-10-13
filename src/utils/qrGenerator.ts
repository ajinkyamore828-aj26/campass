import QRCode from 'qrcode';

export async function renderQrToCanvas(
  canvas: HTMLCanvasElement, 
  text: string, 
  options: { width?: number; margin?: number; colorDark?: string; colorLight?: string } = {}
): Promise<void> {
  const { 
    width = 240, 
    margin = 2, 
    colorDark = '#0f172a', 
    colorLight = '#ffffff' 
  } = options;

  await QRCode.toCanvas(canvas, text, {
    width,
    margin,
    color: {
      dark: colorDark,
      light: colorLight
    },
    errorCorrectionLevel: 'H'
  });
}

export async function generateQrDataUrl(
  text: string,
  options: { width?: number; margin?: number; colorDark?: string; colorLight?: string } = {}
): Promise<string> {
  const { 
    width = 260, 
    margin = 2, 
    colorDark = '#0f172a', 
    colorLight = '#ffffff' 
  } = options;

  return QRCode.toDataURL(text, {
    width,
    margin,
    color: {
      dark: colorDark,
      light: colorLight
    },
    errorCorrectionLevel: 'H'
  });
}
