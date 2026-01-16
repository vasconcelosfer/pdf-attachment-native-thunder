/* background.js */

// FUNCIONES DE ESTADO VISUAL

let animationTimers = {}; // Guardar timers por pestaña

// --- LOGICA DE ANIMACIÓN ---

async function setLoading(tabId, isLoading) {
  if (isLoading) {
    // 1. Mostrar "..." en el botón
    // await browser.messageDisplayAction.setBadgeText({ tabId: tabId, text: "..." });
    await browser.messageDisplayAction.setBadgeText({ tabId: tabId, text: "⏳" });
    await browser.messageDisplayAction.setBadgeBackgroundColor({ tabId: tabId, color: "#FFA500" }); // Naranja
    
    // 2. Notificación de inicio
    browser.notifications.create({
      "type": "basic",
      "iconUrl": "icons/icon.svg", // Asegúrate que este icono exista o usa "icons/icon-48.png"
      "title": browser.i18n.getMessage("extensionName"),
      "message": browser.i18n.getMessage("statusGenerating") || "Generando..."
    });
  } else {
    // Limpiar botón
    await browser.messageDisplayAction.setBadgeText({ tabId: tabId, text: "" });
  }
}

async function showNotification(titleKey, messageStr, isError = false) {
  browser.notifications.create({
    "type": "basic",
    "iconUrl": "icons/icon.svg",
    "title": browser.i18n.getMessage(titleKey) || (isError ? "Error" : "Info"),
    "message": messageStr || ""
  });
}

browser.messageDisplayAction.onClicked.addListener(async (tab) => {
  console.log("Iniciando exportación...");

  await setLoading(tab.id, true);
  // 1. Obtener mensaje
  // const messageList = await browser.mailTabs.getSelectedMessages(tab.id);
  // if (!messageList.messages.length) return;
  //const message = messageList.messages[0];
  const messageList = await browser.messageDisplay.getDisplayedMessages(tab.id);
  if (!messageList.messages.length) return;
  const message = messageList.messages[0];

  try {
    // 2. LLAMADA A LA API NATIVA
    console.log("Llamando a NativePdf.generate...");
    const pdfDataArray = await browser.NativePdf.generate(tab.id);
    const pdfUint8 = new Uint8Array(pdfDataArray);

    // 3. PROCESAMIENTO CON PDF-LIB (Adjuntos)
    const { PDFDocument } = PDFLib;
    const pdfDoc = await PDFDocument.load(pdfUint8);

    const attachments = await browser.messages.listAttachments(message.id);
    for (let att of attachments) {
      if (att.contentType.startsWith('image/')) continue; // Ignorar imágenes inline si quieres

      const file = await browser.messages.getAttachmentFile(message.id, att.partName);
      const arrayBuffer = await file.arrayBuffer();
      
      await pdfDoc.attach(arrayBuffer, att.name, {
        mimeType: att.contentType,
        description: att.name,
        creationDate: new Date(),
        modificationDate: new Date()
      });
    }

    // 4. GUARDAR
    const finalPdfBytes = await pdfDoc.save();
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Obtener traducción para el nombre por defecto ("email" o "correo")
    const defaultName = browser.i18n.getMessage("defaultFileName");
    
    // Usar la traducción si no hay asunto
    const cleanSubject = (message.subject || defaultName).replace(/[^a-z0-9ñáéíóúü \-_]/gi, '').trim();
    const filename = cleanSubject + ".pdf";

    await browser.downloads.download({
        url: url,
        filename: filename,
        saveAs: true 
    });
    showNotification("statusSaved", filename);
    console.log("Descarga iniciada.");

  } catch (err) {
    showNotification("statusError", err.message, true);
    console.error("Error en proceso:", err);
  } finally {
    setLoading(tab.id, false);
  }
});