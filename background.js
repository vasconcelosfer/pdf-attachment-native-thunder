/* background.js */
browser.messageDisplayAction.onClicked.addListener(async (tab) => {
  console.log("Iniciando exportación...");

  // 1. Obtener mensaje
  const messageList = await browser.mailTabs.getSelectedMessages(tab.id);
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
    
    const filename = (message.subject || "correo").replace(/[^a-z0-9ñáéíóúü \-_]/gi, '').trim() + ".pdf";

    await browser.downloads.download({
        url: url,
        filename: filename,
        saveAs: true 
    });

    console.log("Descarga iniciada.");

  } catch (err) {
    console.error("Error en proceso:", err);
  }
});