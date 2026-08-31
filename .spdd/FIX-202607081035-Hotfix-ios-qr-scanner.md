# REASONS Canvas: iOS QR Scanner Hotfix

## R - Requirements
- **Problem**: iPhone (iOS) users are unable to read QR codes using the system's scanner.
- **Root Causes**:
  1. `jsQR` is explicitly preventing color inversion detection (`dontInvert`), making dark mode QR codes unreadable.
  2. The camera feed is downsampled too aggressively (`400px`), destroying the resolution of the QR code when captured by the iPhone's wide-angle lens.
  3. `getUserMedia` forces `exact: 'environment'` which causes iPhones Pro to use the ultra-wide lens instead of the main lens, resulting in lack of focus for close-up QR scanning.
- **Definition of Done**: 
  - Change `inversionAttempts` in `jsQR` to `attemptBoth`.
  - Increase `maxDimension` in the video processor from `400` to `800`.
  - Change `facingMode` from `exact` to `ideal` in `useCamera.ts`.
  - Ensure the changes are committed and the QR scanner reliably reads codes from iPhones.

## E - Entities
- **QRScanner**: The React component managing the UI for scanning.
- **useQRScanner (Hook)**: Manages the canvas and barcode detection logic (`BarcodeDetector` and `jsQR`).
- **useCamera (Hook)**: Manages `getUserMedia` permissions and constraints.
- **QR Validation**: The business logic determining if a scanned QR code is safe and valid.

## A - Approach
- Increase the fidelity of the frames passed to the QR decoder by bumping the `maxDimension` threshold.
- Allow `jsQR` to process both standard and inverted QR codes to account for dark mode displays.
- Keep the fallback structure (try `BarcodeDetector` first, then `jsQR`).
- Relax the `facingMode` camera constraints to `ideal` to let the OS pick the primary lens instead of the macro/ultra-wide lens.

## S - Structure
- `/lib/hooks/useQRScanner.ts`: Update parameters for canvas dimensions and jsQR configuration.
- `/lib/hooks/useCamera.ts`: Update `getUserMedia` constraints.

## O - Operations
1. Open `/lib/hooks/useQRScanner.ts`.
2. Locate `const maxDimension = 400` and change it to `const maxDimension = 800`.
3. Locate `inversionAttempts: 'dontInvert'` and change it to `inversionAttempts: 'attemptBoth'`.
4. Open `/lib/hooks/useCamera.ts`.
5. Remove the `{ video: { facingMode: { exact: mode } } }` object from the constraints array, keeping only `{ ideal: mode }`.

## N - Norms
- **Performance**: While increasing `maxDimension` to 800 adds more pixels to process, modern iOS devices can handle it efficiently at 500ms intervals.
- **Accessibility**: Ensure that scanning is resilient against different screen modes (light/dark).

## S - Safeguards
- Do not remove the `BarcodeDetector` try-catch block; it remains the preferred, high-performance option when available.
- Keep the `500ms` processing interval to prevent CPU throttling and battery drain.
