/* api/nativePdf/implementation.js */

// Usamos la clausura que funcionó en tu prueba

// 1. Importaciones seguras
var ExtensionCommon;
var FileUtils;

try {
  // Thunderbird 115+ (ESM)
  ({ ExtensionCommon } = ChromeUtils.importESModule("resource://gre/modules/ExtensionCommon.sys.mjs"));
  ({ FileUtils } = ChromeUtils.importESModule("resource://gre/modules/FileUtils.sys.mjs"));
} catch (e) {
  // Fallback JSM
  ({ ExtensionCommon } = ChromeUtils.import("resource://gre/modules/ExtensionCommon.jsm"));
  ({ FileUtils } = ChromeUtils.import("resource://gre/modules/FileUtils.jsm"));
}

  // 2. Definición de la Clase
var NativePdf = class extends ExtensionCommon.ExtensionAPI {
    
    onStartup() {
      console.log(">>> [nativePdf] API Inicializada (Estructura Correcta).");
    }

    getAPI(context) {
      return {
        NativePdf: {
            async generate(tabId) {
            console.log(`>>> [nativePdf] Generando PDF para TabID: ${tabId}`);
            
            try {
              // --- A. OBTENER PESTAÑA ---
              const tabObject = context.extension.tabManager.get(tabId);
              if (!tabObject) throw new Error(`Tab ${tabId} no encontrada`);
              const nativeTab = tabObject.nativeTab;

              // --- B. BUSCAR BROWSER ---
              let browser = null;
              if (nativeTab.mode && nativeTab.mode.name === "mail3pane") {
                  if (nativeTab.ownerGlobal && nativeTab.ownerGlobal.gFolderDisplay) {
                      browser = nativeTab.ownerGlobal.gFolderDisplay.messageBrowser;
                  }
              } else if (nativeTab.mode && nativeTab.mode.name === "message") {
                  browser = nativeTab.linkedBrowser;
              }
              if (!browser && nativeTab.messageBrowser) browser = nativeTab.messageBrowser;
              if (!browser) browser = nativeTab.linkedBrowser;
              if (!browser) throw new Error("Browser no encontrado");

              // --- C. PREPARAR COMPONENTES (XPCOM) ---
              const Cc = Components.classes;
              const Ci = Components.interfaces;

              const printSettings = Cc["@mozilla.org/gfx/printsettings-service;1"]
                                      .getService(Ci.nsIPrintSettingsService)
                                      .createNewPrintSettings();
              
              // --- CONFIGURACIÓN MODERNA (SOLUCIÓN DEL ERROR) ---
              
              // 1. Definir que la salida es un ARCHIVO (Evita usar printToFile)
              // kOutputDestinationFile = 2
              printSettings.outputDestination = Ci.nsIPrintSettings.kOutputDestinationFile || 2;
              
              // 2. Definir formato PDF
              // kOutputFormatPDF = 2
              printSettings.outputFormat = Ci.nsIPrintSettings.kOutputFormatPDF || 2;

              // 3. Opciones visuales
              printSettings.printerName = ""; // Importante dejar vacío para imprimir a archivo
              printSettings.printBGColors = true;
              printSettings.printBGImages = true;

              // --- D. ARCHIVO TEMPORAL ---
              const dirService = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
              const tempFile = dirService.get("TmpD", Ci.nsIFile);
              
              tempFile.append("tb_native_export.pdf");
              tempFile.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0o600);

              console.log(">>> [nativePdf] Archivo destino:", tempFile.path);

              // Asignar la ruta del archivo
              printSettings.toFileName = tempFile.path;

              // --- E. IMPRIMIR ---
              if (!browser.browsingContext) throw new Error("Sin browsingContext");
              
              // print() devuelve una Promesa en versiones modernas
              await browser.browsingContext.print(printSettings);

              // --- F. LEER RESULTADO ---
              const buffer = await IOUtils.read(tempFile.path);
              await IOUtils.remove(tempFile.path);

              console.log(`>>> [nativePdf] PDF Generado OK: ${buffer.byteLength} bytes`);
              return Array.from(buffer);

            } catch (err) {
              console.error(">>> [nativePdf] ERROR:", err);
              throw new Error(err.message);
            }
          }
        }
      };
    }
}

