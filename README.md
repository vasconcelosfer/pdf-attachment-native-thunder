# 📧 Native PDF Export for Thunderbird

An advanced extension for **Mozilla Thunderbird** that allows exporting emails to PDF using the native rendering engine, with the unique capability of **embedding email attachments directly inside the generated PDF file**.

![Version](https://img.shields.io/badge/version-1.5-blue)
![Thunderbird](https://img.shields.io/badge/Thunderbird-115%2B-orange)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Key Features

* **Native Rendering:** Uses Thunderbird's internal printing engine (XPCOM), ensuring the PDF looks identical to the original email (images, tables, styles).
* **Embedded Attachments:** Automatically detects email attachments and embeds them inside the resulting PDF file (as PDF file attachments).
* **Multi-Tab Support:** Works seamlessly on both the main mail list and individual message tabs/windows.
* **Visual Feedback:** Displays an hourglass status indicator "⏳" on the button while processing.
* **Internationalization (i18n):** Fully localized in **English** and **Spanish**. Automatically detects the browser language.

---

## 💻 Compatibility

This extension is **Cross-Platform**. It runs natively on:
* ✅ Windows (10/11)
* ✅ Linux
* ✅ macOS

---

## ⚙️ Installation (Developer / Internal Mode)

Since this extension uses experimental APIs to access the native printing engine, it requires a one-time configuration step in Thunderbird to allow unsigned installations (until it is officially signed).

### 1. Prepare Thunderbird
1.  Open Thunderbird and go to **Settings** ⚙️.
2.  Scroll down to the bottom of the "General" tab and click on **Config Editor...**.
3.  Accept the risk warning.
4.  Search for the preference: `xpinstall.signatures.required`.
5.  Toggle it to **`false`** (double-click or use the toggle button).

### 2. Install the XPI File
1.  Download the `native-pdf-export.xpi` file from the `dist/` folder.
2.  In Thunderbird, go to **Tools > Add-ons and Themes**.
3.  Click the gear icon ⚙️ and select **Install Add-on From File...**.
4.  Select the `.xpi` file.
5.  Accept the permissions (Read messages, Downloads, Notifications).

---

## 🚀 Usage

1.  Open any email.
2.  Click the **"Save PDF"** button in the message header toolbar.
3.  You will see an hourglass **⏳** badge indicating the file is being generated.
4.  The PDF will be automatically saved to your **Downloads** folder, using the email subject as the filename.
5.  You will receive a system notification upon completion.

---

## 🛠️ Development & Build

If you want to modify the source code or generate a new version, the project includes an automated script.

### Build Requirements
* To run the automated `build.sh` script, you need a **Bash** terminal (Linux, macOS, or Git Bash/WSL on Windows).
* If you don't have Bash, you can manually create the ZIP file by selecting the folder contents (excluding hidden files).

### Generate the Package (.xpi)
Run the build script from your terminal:

```bash
./build.sh