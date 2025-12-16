const MAX_EXECUTION_TIME = 330;
const MAX_BATCH_SIZE = 10;
const APP_NAMESPACE = 'gdocsAutomator';

const EMAIL_DELAY_MS = 500;

/**
 * Fungsi yang dijalankan saat menu dibuka. 
 */
function onOpen() {
  createAdvancedMenu();
}

/**
 * Membuat menu yang lebih terorganisir dengan submenu
 */
function createAdvancedMenu() {
  const ui = SpreadsheetApp.getUi();

  const pdfMenu = ui.createMenu('PDF Generator')
    .addSubMenu(ui.createMenu('Generate PDF')
      .addItem('Dari Google Slides', 'generatePDFsFromSlides')
      .addItem('Dari Google Docs', 'generatePDFsFromDocs'))
    .addSeparator()
    .addItem('Buat Template', 'createTemplate')
    .addItem('Pengaturan Lanjutan', 'showPDFGeneratorDialog')
    .addSeparator()
    .addSubMenu(ui.createMenu('Backup & Restore')
      .addItem('Backup Konfigurasi', 'backupConfiguration')
      .addItem('Restore Konfigurasi', 'restoreConfiguration'));

  const driveMenu = ui.createMenu('Drive Tools')
    .addSubMenu(ui.createMenu('Metadata File')
      .addItem('Ekstrak Nama dan Deskripsi', 'extractFileInfo')
      .addItem('Update Nama dan Deskripsi', 'updateFileInfo'))
    .addSeparator()
    .addItem('Ekstrak Gambar ke Cell', 'insertImages')
    .addItem('Ekstrak List Link File', 'generateFileList');

  const emailMenu = ui.createMenu('Email Tools')
    .addItem('Share File to Email', 'shareFilesByEmail')
    .addItem('Send Email Bulk', 'sendEmailBulk')
    .addSeparator()
    .addItem('Template Email', 'createEmailTemplate');

  const adminMenu = ui.createMenu('Admin')
    .addItem('View Logs', 'viewLogs')
    .addItem('Hapus Semua Trigger', 'deleteAllTriggers')
    .addItem('Reset State', 'resetApplicationState')
    .addItem('Tentang Aplikasi', 'showAboutDialog');

  ui.createMenu('GDocs Automator')
    .addSubMenu(pdfMenu)
    .addSubMenu(driveMenu)
    .addSubMenu(emailMenu)
    .addSubMenu(adminMenu)
    .addToUi();
}

/**
 * Menampilkan informasi tentang aplikasi
 */
function showAboutDialog() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    'GDocs Automator',
    'Aplikasi untuk mengotomatisasi tugas-tugas Google Docs, Slides, Drive dan Email.\n\n' +
    'Dibuat oleh:  GitHub Copilot\n\n',
    ui.ButtonSet.OK
  );
}

/**
 * Reset semua state aplikasi
 */
function resetApplicationState() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Reset Aplikasi',
    'Ini akan menghapus semua state dan cache aplikasi. Lanjutkan? ',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  deleteAllTriggers();

  const cache = CacheService.getScriptCache();
  const cacheKeys = ['currentIndex', 'templateType', 'processedCount', 'dialogProgress'];
  cacheKeys.forEach(key => {
    try {
      cache.remove(key);
    } catch (e) {
    }
  });

  const namespaces = [APP_NAMESPACE, 'pdfGeneration', 'backups', 'triggers'];
  namespaces.forEach(ns => {
    const appState = new AppState(ns);
    appState.clear();
  });

  ui.alert('Reset Selesai', 'Semua state aplikasi telah direset. ', ui.ButtonSet.OK);
}


/**
 * Memulai proses pembuatan PDF dari template Slides. 
 */
function generatePDFsFromSlides() {
  return ErrorHandler.execute(
    () => generatePDFs('slides', false),
    {
      context: 'Membuat PDF dari Google Slides',
      showAlert: true,
      logError: true
    }
  );
}

/**
 * Memulai proses pembuatan PDF dari template Docs. 
 */
function generatePDFsFromDocs() {
  return ErrorHandler.execute(
    () => generatePDFs('docs', false),
    {
      context: 'Membuat PDF dari Google Docs',
      showAlert: true,
      logError: true
    }
  );
}

/**
 * Membuat template pada baris pertama jika belum ada. 
 */
function createTemplate() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const firstRow = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getValues()[0];
  const ui = SpreadsheetApp.getUi();
  const logger = new Logger('createTemplate');

  const templateData = [
    ['Template', '<<masukan id atau url template>>',
      'Folder Hasil', '<<masukan id atau url folder hasil>>',
      'Jumlah Kolom Data', 3,
      'Posisi Hasil', 4,
      'Keterangan Judul', '']
  ];

  logger.info('Membuat template konfigurasi');

  if (firstRow.every(cell => cell === '')) {
    sheet.getRange(1, 1, 1, templateData[0].length).setValues(templateData);
    logger.info('Template berhasil ditambahkan pada baris pertama yang kosong');
    ui.alert('Template berhasil ditambahkan.');
  } else {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, templateData[0].length).setValues(templateData);
    logger.info('Template berhasil ditambahkan pada baris baru');
    ui.alert('Baris baru telah ditambahkan dan template berhasil ditambahkan.');
  }

  logToSheet(logger);
}

/**
 * Menampilkan dialog HTML untuk pengaturan PDF generator
 */
function showPDFGeneratorDialog() {
  const html = HtmlService.createHtmlOutputFromFile('dialog')
    .setWidth(500)
    .setHeight(600)
    .setTitle('PDF Generator');

  SpreadsheetApp.getUi().showModalDialog(html, 'PDF Generator');
}

/**
 * Mengambil pengaturan template dari spreadsheet
 * @returns {Object} Objek berisi pengaturan template
 */
function getTemplateSettings() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  try {
    const templateIdRaw = sheet.getRange('B1').getValue();
    const folderIdRaw = sheet.getRange('D1').getValue();
    const dataRangeRaw = sheet.getRange('F1').getValue();
    const pdfColumnRaw = sheet.getRange('H1').getValue();
    const titleSuffixRaw = sheet.getRange('J1').getValue();

    return {
      templateId: templateIdRaw ? templateIdRaw.toString().trim() : '',
      folderId: folderIdRaw ? folderIdRaw.toString().trim() : '',
      dataRange: validateNumeric(dataRangeRaw, 3),
      pdfColumn: validateNumeric(pdfColumnRaw, 4),
      titleSuffix: titleSuffixRaw ? titleSuffixRaw.toString().trim() : ''
    };
  } catch (e) {
    console.error('Error getting template settings:', e);
    return {
      templateId: '',
      folderId: '',
      dataRange: 3,
      pdfColumn: 4,
      titleSuffix: ''
    };
  }
}

/**
 * Menyimpan pengaturan template ke spreadsheet
 * @param {Object} settings - Objek berisi pengaturan
 */
function saveTemplateSettings(settings) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  sheet.getRange('B1').setValue(settings.templateId || '');
  sheet.getRange('D1').setValue(settings.folderId || '');
  sheet.getRange('F1').setValue(settings.dataRange || 3);
  sheet.getRange('H1').setValue(settings.pdfColumn || 4);
  sheet.getRange('J1').setValue(settings.titleSuffix || '');
}

/**
 * Fungsi untuk melanjutkan pembuatan PDF setelah waktu eksekusi habis. 
 */
function continuePDFGeneration() {
  const appState = new AppState('pdfGeneration');
  const templateType = appState.get('templateType');
  const logger = new Logger('continuePDFGeneration');

  logger.info(`Melanjutkan proses pembuatan PDF dengan template ${templateType}`);

  if (templateType) {
    logToSheet(logger);
    generatePDFs(templateType, true);
  } else {
    logger.warn('Template type tidak ditemukan di state, menggunakan default (slides)');
    logToSheet(logger);
    generatePDFs('slides', true);
  }
}

/**
 * Membuat PDF dari template Slides. 
 *
 * @param {string} templateId - ID template Slides. 
 * @param {Array} row - Data baris dari Google Sheets.
 * @param {string} ketJudul - Judul tambahan untuk PDF. 
 * @param {Folder} folder - Folder tempat menyimpan PDF. 
 * @param {Range} pdfUrlCell - Sel tempat menyimpan URL PDF.
 * @returns {string} - Judul PDF yang dibuat.
 */
function generatePDFfromSlides(templateId, row, ketJudul, folder, pdfUrlCell) {
  return withRetry(() => createPDFfromTemplate({
    templateId: templateId,
    row: row,
    ketJudul: ketJudul,
    folder: folder,
    pdfUrlCell: pdfUrlCell,
    processTemplate: (fileId, data) => {
      const slide = SlidesApp.openById(fileId);
      const slides = slide.getSlides();

      slides.forEach(slideContent => {
        const shapes = slideContent.getShapes();
        shapes.forEach(shape => {
          const textRange = shape.getText();
          data.forEach((value, j) => {
            const placeholder = `<<${j + 1}>>`;
            const safeValue = sanitizeTextValue(value);
            textRange.replaceAllText(placeholder, safeValue);
          });
        });
      });

      slide.saveAndClose();
    }
  }), 3, 1000);
}

/**
 * Membuat PDF dari template Docs.
 *
 * @param {string} templateId - ID template Docs.
 * @param {Array} row - Data baris dari Google Sheets. 
 * @param {string} ketJudul - Judul tambahan untuk PDF.
 * @param {Folder} folder - Folder tempat menyimpan PDF.
 * @param {Range} pdfUrlCell - Sel tempat menyimpan URL PDF.
 * @returns {string} - Judul PDF yang dibuat.
 */
function generatePDFfromDocs(templateId, row, ketJudul, folder, pdfUrlCell) {
  return withRetry(() => createPDFfromTemplate({
    templateId: templateId,
    row: row,
    ketJudul: ketJudul,
    folder: folder,
    pdfUrlCell: pdfUrlCell,
    processTemplate: (fileId, data) => {
      const doc = DocumentApp.openById(fileId);
      const body = doc.getBody();

      data.forEach((value, j) => {
        const placeholder = `<<${j + 1}>>`;
        const safeValue = sanitizeTextValue(value);
        body.replaceText(escapeRegex(placeholder), safeValue);
      });

      doc.saveAndClose();
    }
  }), 3, 1000);
}

/**
 * Escape karakter khusus regex
 * @param {string} string - String yang akan di-escape
 * @returns {string} - String yang sudah di-escape
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitasi nilai text untuk template replacement
 * @param {*} value - Nilai yang akan disanitasi
 * @returns {string} - Nilai yang sudah disanitasi
 */
function sanitizeTextValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return value.toString()
    .replace(/\$/g, '$$$$');
}

/**
 * Fungsi generik untuk membuat PDF dari template (pola template)
 *
 * @param {Object} config - Konfigurasi untuk pembuatan PDF
 * @returns {string} - Judul PDF yang dibuat
 */
function createPDFfromTemplate(config) {
  const { templateId, row, ketJudul, folder, pdfUrlCell, processTemplate } = config;
  let newFile = null;
  let newFileId = null;
  let pdfFile = null;

  try {
    const baseFileName = row[0] ? row[0].toString() : 'untitled';
    const suffix = ketJudul ? `_${ketJudul}` : '';
    const safeFileName = sanitizeFileName(baseFileName + suffix);

    let templateFile;
    try {
      templateFile = DriveApp.getFileById(templateId);
    } catch (e) {
      throw new Error(`Template tidak ditemukan atau tidak dapat diakses: ${e.message}`);
    }

    newFile = templateFile.makeCopy(safeFileName);
    newFileId = newFile.getId();

    try {
      processTemplate(newFileId, row);
    } catch (e) {
      throw new Error(`Error saat memproses template: ${e.message}`);
    }

    const pdfBlob = newFile.getAs('application/pdf');
    pdfFile = folder.createFile(pdfBlob);

    const pdfUrl = pdfFile.getUrl();
    pdfUrlCell.setValue(pdfUrl);

    newFile.setTrashed(true);

    return safeFileName;
  } catch (error) {
    if (newFileId) {
      try {
        DriveApp.getFileById(newFileId).setTrashed(true);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
    throw error;
  }
}

/**
 * Memulai proses pembuatan PDF dengan pelaporan progress (dipanggil dari dialog)
 *
 * @param {Object} params - Parameter untuk pembuatan PDF
 * @returns {Object} - Status awal proses
 */
function generatePDFsWithProgress(params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const logger = new Logger('generatePDFsWithProgress');

  logger.info('Memulai inisialisasi proses PDF dengan dialog');

  saveTemplateSettings({
    templateId: params.templateId,
    folderId: params.folderId,
    dataRange: params.dataRange,
    pdfColumn: params.pdfColumn,
    titleSuffix: params.titleSuffix
  });

  const lastRow = sheet.getLastRow();
  if (lastRow < 3) {
    logger.warn('Tidak ada data untuk diproses (baris data dimulai dari baris 3)');
    return {
      current: 0,
      total: 0,
      message: 'Tidak ada data untuk diproses',
      complete: true
    };
  }

  const data = sheet.getRange(3, 1, lastRow - 2, params.dataRange).getValues();

  const filteredData = data.filter(row => row[0] !== '' && row[0] !== null && row[0] !== undefined);
  const totalItems = filteredData.length;

  logger.info(`Total item yang akan diproses: ${totalItems}`);

  const appState = new AppState('pdfGeneration');
  appState.set('totalItems', totalItems);
  appState.set('templateType', params.templateType);
  appState.set('dialogMode', true);
  appState.set('currentIndex', 0);
  appState.set('processedCount', 0);

  const indexMapping = [];
  data.forEach((row, originalIndex) => {
    if (row[0] !== '' && row[0] !== null && row[0] !== undefined) {
      indexMapping.push(originalIndex);
    }
  });
  appState.set('indexMapping', indexMapping);

  logToSheet(logger);

  return {
    current: 0,
    total: totalItems,
    message: 'Inisialisasi selesai, memulai proses.. .',
    complete: false
  };
}

/**
 * Fungsi helper untuk memeriksa apakah waktu hampir habis
 *
 * @param {Date} startTime - Waktu mulai operasi
 * @param {number} safetyMargin - Margin keamanan dalam detik
 * @returns {boolean} - True jika waktu hampir habis
 */
function isTimeRunningOut(startTime, safetyMargin = 30) {
  const elapsedTime = (new Date() - startTime) / 1000;
  return elapsedTime > (MAX_EXECUTION_TIME - safetyMargin);
}

/**
 * Memproses pembuatan PDF berdasarkan tipe template. 
 *
 * @param {string} templateType - Tipe template, bisa 'slides' atau 'docs'. 
 * @param {boolean} isTriggered - Apakah fungsi dipanggil dari trigger
 */
function generatePDFs(templateType, isTriggered = false) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const logger = new Logger('generatePDFs');
  const benchmark = new Benchmark('PDF Generation').start();
  const appState = new AppState('pdfGeneration');

  const dialogMode = appState.get('dialogMode', false);

  logger.info(`Memulai proses pembuatan PDF dengan template ${templateType}`);
  logger.info(`Mode:  isTriggered=${isTriggered}, dialogMode=${dialogMode}`);

  const settings = getTemplateSettings();
  const templateIdOrUrl = settings.templateId;
  const folderIdOrUrl = settings.folderId;
  const dataRange = settings.dataRange;
  const pdfColumn = settings.pdfColumn;
  const ketJudul = settings.titleSuffix;

  if (!templateIdOrUrl || !folderIdOrUrl) {
    logger.error('Template ID atau Folder ID tidak valid');

    if (!isTriggered && !dialogMode) {
      SpreadsheetApp.getUi().alert(
        'Error',
        'Template ID dan Folder ID harus diisi pada baris pertama.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }

    logToSheet(logger);
    return;
  }

  if (dataRange <= 0 || pdfColumn <= 0) {
    logger.error('Jumlah kolom data atau posisi hasil tidak valid');

    if (!isTriggered && !dialogMode) {
      SpreadsheetApp.getUi().alert(
        'Error',
        'Jumlah kolom data dan posisi hasil harus berupa angka positif.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }

    logToSheet(logger);
    return;
  }

  const templateId = extractFileId(templateIdOrUrl);
  const folderId = extractFileId(folderIdOrUrl);

  if (!templateId || !folderId) {
    logger.error('Tidak dapat mengekstrak ID dari URL/ID yang diberikan');

    if (!isTriggered && !dialogMode) {
      SpreadsheetApp.getUi().alert(
        'Error',
        'Format Template ID atau Folder ID tidak valid.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    }

    logToSheet(logger);
    return;
  }

  try {
    benchmark.checkpoint('Validasi input selesai');

    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
      logger.info(`Folder hasil ditemukan: ${folder.getName()}`);
    } catch (error) {
      logger.error(`Folder tidak ditemukan atau tidak dapat diakses: ${error.message}`);
      if (!isTriggered && !dialogMode) {
        SpreadsheetApp.getUi().alert(
          'Error',
          `Folder hasil tidak ditemukan atau tidak dapat diakses:  ${error.message}`,
          SpreadsheetApp.getUi().ButtonSet.OK
        );
      }
      logToSheet(logger);
      return;
    }

    const lastRow = sheet.getLastRow();
    if (lastRow < 3) {
      logger.warn('Tidak ada data untuk diproses');
      if (!isTriggered && !dialogMode) {
        SpreadsheetApp.getUi().alert('Info', 'Tidak ada data untuk diproses. ', SpreadsheetApp.getUi().ButtonSet.OK);
      }
      logToSheet(logger);
      return;
    }

    const allData = sheet.getRange(3, 1, lastRow - 2, Math.max(dataRange, pdfColumn)).getValues();

    benchmark.checkpoint('Data diambil dari sheet');

    const dataWithIndex = allData.map((row, idx) => ({
      sheetRowIndex: idx,
      data: row,
      hasData: row[0] !== '' && row[0] !== null && row[0] !== undefined,
      hasPdf: row[pdfColumn - 1] !== '' && row[pdfColumn - 1] !== null && row[pdfColumn - 1] !== undefined
    }));

    const toProcess = dataWithIndex.filter(item => item.hasData && !item.hasPdf);

    logger.info(`Total baris dengan data: ${dataWithIndex.filter(i => i.hasData).length}`);
    logger.info(`Baris yang perlu diproses (belum ada PDF): ${toProcess.length}`);

    if (toProcess.length === 0) {
      logger.info('Semua data sudah memiliki PDF atau tidak ada data');
      if (!isTriggered && !dialogMode) {
        SpreadsheetApp.getUi().alert('Info', 'Semua data sudah diproses atau tidak ada data baru.', SpreadsheetApp.getUi().ButtonSet.OK);
      }
      logToSheet(logger);
      return;
    }

    let templateName;
    try {
      templateName = templateType === 'slides'
        ? SlidesApp.openById(templateId).getName()
        : DocumentApp.openById(templateId).getName();
      logger.info(`Template berhasil dimuat: ${templateName}`);
    } catch (error) {
      logger.error(`Gagal membuka template: ${error.message}`);

      if (!isTriggered && !dialogMode) {
        SpreadsheetApp.getUi().alert(
          'Error',
          `Tidak dapat mengakses template: ${error.message}`,
          SpreadsheetApp.getUi().ButtonSet.OK
        );
      }

      logToSheet(logger);
      return;
    }

    benchmark.checkpoint('Template diakses');

    if (!isTriggered && !dialogMode) {
      const estimatedTime = Math.ceil(toProcess.length * 7);
      const estimatedMinutes = Math.ceil(estimatedTime / 60);

      const confirmMessage = `Anda akan generate PDF sebanyak ${toProcess.length} file.\n\n` +
        `Lokasi folder hasil: "${folder.getName()}"\n` +
        `Template: "${templateName}"\n` +
        `Estimasi waktu: ${estimatedMinutes} menit\n\n` +
        `Catatan: Jika melebihi batas waktu eksekusi (~6 menit), proses akan dilanjutkan secara otomatis.\n\n` +
        `Apakah Anda ingin melanjutkan?`;

      const confirmation = SpreadsheetApp.getUi().alert(
        'Konfirmasi',
        confirmMessage,
        SpreadsheetApp.getUi().ButtonSet.YES_NO
      );

      if (confirmation !== SpreadsheetApp.getUi().Button.YES) {
        logger.info('Proses dibatalkan oleh pengguna');
        SpreadsheetApp.getUi().alert('Terima kasih! ');
        logToSheet(logger);
        return;
      }
    } else if (dialogMode) {
      logger.info('Berjalan dalam mode dialog, melewati konfirmasi');
    } else {
      logger.info('Melanjutkan proses dari trigger, melewati konfirmasi');
    }

    benchmark.checkpoint('Konfirmasi user selesai atau dilewati');

    let processIndex = parseInt(appState.get('currentIndex', 0)) || 0;
    let processedCount = parseInt(appState.get('processedCount', 0)) || 0;

    appState.set('templateType', templateType);
    appState.set('totalItems', toProcess.length);

    const startTime = new Date();
    let lastPdfTitle = appState.get('lastPdfTitle', '');

    benchmark.checkpoint('Mulai pemrosesan file');
    logger.info(`Melanjutkan dari process index: ${processIndex}, total diproses sebelumnya: ${processedCount}`);

    for (; processIndex < toProcess.length; processIndex++) {
      if (isTimeRunningOut(startTime, 45)) {
        appState.set('currentIndex', processIndex);
        appState.set('processedCount', processedCount);
        appState.set('lastPdfTitle', lastPdfTitle);

        const triggerId = scheduleResumeOperation('continuePDFGeneration', 2);
        logger.info(`Waktu hampir habis, menjadwalkan lanjutan dengan trigger: ${triggerId}`);

        const progressPercent = Math.round(processIndex * 100 / toProcess.length);
        logger.info(`Timeout preventif.  Progres: ${progressPercent}% (${processIndex}/${toProcess.length})`);

        if (!isTriggered && !dialogMode) {
          SpreadsheetApp.getUi().alert(
            'Batas Waktu',
            `Proses telah mencapai ${progressPercent}% (${processIndex} dari ${toProcess.length} file).\n` +
            `Proses akan dilanjutkan secara otomatis dalam beberapa detik.\n` +
            `Harap jangan menutup spreadsheet ini. `,
            SpreadsheetApp.getUi().ButtonSet.OK
          );
        }

        logToSheet(logger);
        return;
      }

      const item = toProcess[processIndex];
      const row = item.data.slice(0, dataRange);
      const actualSheetRow = 3 + item.sheetRowIndex;
      const pdfUrlCell = sheet.getRange(actualSheetRow, pdfColumn);

      try {
        if (templateType === 'slides') {
          lastPdfTitle = generatePDFfromSlides(templateId, row, ketJudul, folder, pdfUrlCell);
        } else if (templateType === 'docs') {
          lastPdfTitle = generatePDFfromDocs(templateId, row, ketJudul, folder, pdfUrlCell);
        }
        processedCount++;
        logger.info(`Berhasil memproses baris ${actualSheetRow}:  ${lastPdfTitle}`);
      } catch (error) {
        logger.error(`Error pada baris ${actualSheetRow}: ${error.message}`);

        pdfUrlCell.setValue(`Error: ${error.message}`);

        if (!isTriggered && !dialogMode) {
          const continueChoice = SpreadsheetApp.getUi().alert(
            'Error',
            `Error pada baris ${actualSheetRow}:  ${error.message}\n\nLanjutkan ke baris berikutnya?`,
            SpreadsheetApp.getUi().ButtonSet.YES_NO
          );

          if (continueChoice !== SpreadsheetApp.getUi().Button.YES) {
            appState.set('currentIndex', processIndex);
            appState.set('processedCount', processedCount);
            logToSheet(logger);
            return;
          }
        }
      }

      if (dialogMode && processIndex % 2 === 0) {
        try {
          const progressData = {
            current: processIndex + 1,
            total: toProcess.length,
            message: `Memproses ${lastPdfTitle}... `,
            complete: false
          };
          CacheService.getScriptCache().put('dialogProgress', JSON.stringify(progressData), 600);
        } catch (e) {
          logger.warn(`Error updating dialog progress: ${e.message}`);
        }
      }

      if (processIndex % 5 === 0) {
        appState.set('currentIndex', processIndex);
        appState.set('processedCount', processedCount);
        appState.set('lastPdfTitle', lastPdfTitle);
      }
    }

    benchmark.checkpoint(`Pemrosesan file selesai, total ${processedCount} file`);

    appState.clear();

    const endTime = new Date();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    sheet.getRange(2, 1, 1, sheet.getMaxColumns()).setBackground('#b7e1cd');

    logger.info(`Proses selesai dalam ${duration} detik.  Total PDF dibuat:  ${processedCount}`);

    const benchmarkResult = benchmark.end();
    logger.info(`Benchmark: ${JSON.stringify(benchmarkResult)}`);

    if (dialogMode) {
      const progressData = {
        current: toProcess.length,
        total: toProcess.length,
        message: `Selesai!  ${processedCount} file diproses dalam ${duration} detik`,
        complete: true
      };
      CacheService.getScriptCache().put('dialogProgress', JSON.stringify(progressData), 600);
    }

    if (!isTriggered && !dialogMode) {
      SpreadsheetApp.getUi().alert(
        'Proses pembuatan PDF selesai!',
        `PDF yang dibuat: ${processedCount}\n` +
        `PDF terakhir: "${lastPdfTitle}"\n\n` +
        `Waktu mulai: ${formatDate(startTime)}\n` +
        `Waktu selesai: ${formatDate(endTime)}\n` +
        `Durasi: ${duration} detik.\n\n` +
        `Terima kasih! `,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
    } else if (isTriggered) {
      const statusCol = pdfColumn + 1;
      sheet.getRange(1, statusCol).setValue(`Proses selesai:  ${formatDate(endTime)}`);
      sheet.getRange(2, statusCol).setValue(`PDF dibuat: ${processedCount}`);
    }

    deleteAllTriggers();

    logToSheet(logger);
  } catch (error) {
    logger.error(`Kesalahan tidak terduga: ${error.message}`, { stack: error.stack });

    if (!isTriggered && !dialogMode) {
      SpreadsheetApp.getUi().alert('Error', `Terjadi kesalahan: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    }

    console.error(error);

    logToSheet(logger);
  }
}

/**
 * Membuat cadangan konfigurasi
 */
function backupConfiguration() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const logger = new Logger('backupConfiguration');

  logger.info('Memulai proses backup konfigurasi');

  const maxCols = sheet.getLastColumn() || 10;
  const configData = sheet.getRange(1, 1, 2, maxCols).getValues();

  const backup = {
    timestamp: new Date().toISOString(),
    sheetName: sheet.getName(),
    configData: configData,
  };

  logger.info(`Backup dibuat untuk sheet: ${sheet.getName()}`);

  const appState = new AppState('backups');
  let backups = appState.get('configurations', []);

  if (!Array.isArray(backups)) {
    backups = [];
  }

  if (backups.length >= 5) {
    backups.shift();
    logger.info('Menghapus backup tertua karena sudah mencapai batas 5 backup');
  }

  backups.push(backup);
  appState.set('configurations', backups);

  logger.info(`Backup berhasil disimpan.  Total backup: ${backups.length}`);

  ui.alert('Backup berhasil', `Konfigurasi telah dicadangkan pada ${formatDate(new Date())}`, ui.ButtonSet.OK);

  logToSheet(logger);
}

/**
 * Memulihkan konfigurasi dari cadangan
 */
function restoreConfiguration() {
  const ui = SpreadsheetApp.getUi();
  const appState = new AppState('backups');
  let backups = appState.get('configurations', []);
  const logger = new Logger('restoreConfiguration');

  logger.info('Memulai proses restore konfigurasi');

  if (!Array.isArray(backups)) {
    backups = [];
  }

  if (backups.length === 0) {
    logger.warn('Tidak ada backup yang tersedia');
    ui.alert('Tidak ada backup', 'Tidak ditemukan backup konfigurasi. ', ui.ButtonSet.OK);
    return;
  }

  let message = 'Pilih backup untuk dipulihkan (masukkan nomor):\n\n';
  backups.forEach((backup, index) => {
    const date = formatDate(new Date(backup.timestamp));
    message += `${index + 1}. ${date} - Sheet: ${backup.sheetName}\n`;
  });

  const response = ui.prompt('Restore Backup', message, ui.ButtonSet.OK_CANCEL);
  if (response.getSelectedButton() !== ui.Button.OK) {
    logger.info('Proses restore dibatalkan oleh pengguna');
    return;
  }

  const choice = parseInt(response.getResponseText());
  if (isNaN(choice) || choice < 1 || choice > backups.length) {
    logger.warn(`Pilihan tidak valid: ${response.getResponseText()}`);
    ui.alert('Pilihan tidak valid', 'Mohon masukkan angka yang valid.', ui.ButtonSet.OK);
    return;
  }

  const backup = backups[choice - 1];
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  const confirm = ui.alert(
    'Konfirmasi Restore',
    `Ini akan mengganti konfigurasi saat ini dengan konfigurasi dari ${formatDate(new Date(backup.timestamp))}.\n\nLanjutkan?`,
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) {
    logger.info('Konfirmasi restore dibatalkan oleh pengguna');
    return;
  }

  logger.info(`Memulihkan konfigurasi dari backup:  ${formatDate(new Date(backup.timestamp))}`);

  const configData = backup.configData;
  if (configData && configData.length > 0 && configData[0].length > 0) {
    sheet.getRange(1, 1, configData.length, configData[0].length).setValues(configData);
  }

  logger.info('Proses restore berhasil');
  ui.alert(
    'Restore selesai',
    `Konfigurasi berhasil dipulihkan dari ${formatDate(new Date(backup.timestamp))}. `,
    ui.ButtonSet.OK
  );

  logToSheet(logger);
}


/**
 * Ekstrak informasi file (nama dan deskripsi) dari link
 */
function extractFileInfo() {
  return ErrorHandler.execute(() => {
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const logger = new Logger('extractFileInfo');

    logger.info('Memulai proses ekstraksi info file');

    const responseFileCol = ui.prompt(
      'Ekstrak Nama dan Deskripsi',
      'Masukkan nomor kolom untuk file link (misal: 1 untuk kolom A):',
      ui.ButtonSet.OK_CANCEL
    );

    if (responseFileCol.getSelectedButton() !== ui.Button.OK) {
      logger.info('Proses dibatalkan oleh pengguna');
      return;
    }

    const fileCol = validateNumeric(responseFileCol.getResponseText(), 0);
    if (fileCol === 0) {
      logger.warn(`Input kolom tidak valid: ${responseFileCol.getResponseText()}`);
      ui.alert('Error', 'Kolom file harus berupa angka positif. ', ui.ButtonSet.OK);
      return;
    }

    logger.info(`Kolom file: ${fileCol}`);

    const nameCol = fileCol + 1;
    const descCol = fileCol + 2;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      logger.warn('Tidak ada data');
      ui.alert('Tidak ada data', 'Sheet tidak memiliki data. ', ui.ButtonSet.OK);
      return;
    }

    const dataRange = sheet.getRange(2, fileCol, lastRow - 1, 1);
    const values = dataRange.getValues();
    const validRows = values.map((row, idx) => ({
      value: row[0],
      rowIndex: idx + 2,
      isValid: row[0] && row[0].toString().trim() !== ''
    })).filter(r => r.isValid);

    const fileCount = validRows.length;

    logger.info(`Jumlah file yang akan diproses: ${fileCount}`);

    if (fileCount === 0) {
      logger.warn('Tidak ada data yang ditemukan');
      ui.alert('Tidak ada data', 'Tidak ditemukan link file di kolom yang ditentukan.', ui.ButtonSet.OK);
      return;
    }

    const confirm = ui.alert(
      'Konfirmasi',
      `Apakah Anda ingin mengambil nama dan deskripsi sebanyak ${fileCount} file? `,
      ui.ButtonSet.YES_NO
    );

    if (confirm !== ui.Button.YES) {
      logger.info('Proses dibatalkan oleh pengguna pada konfirmasi');
      return;
    }

    if (sheet.getRange(1, nameCol).getValue() === '') {
      sheet.getRange(1, nameCol).setValue('Nama File');
    }
    if (sheet.getRange(1, descCol).getValue() === '') {
      sheet.getRange(1, descCol).setValue('Deskripsi');
    }

    const benchmark = new Benchmark('Extract File Info').start();
    let processedCount = 0;
    let errorCount = 0;

    const results = [];

    for (const item of validRows) {
      const fileIdOrUrl = item.value.toString();
      const fileId = extractFileId(fileIdOrUrl);

      if (fileId) {
        try {
          const file = DriveApp.getFileById(fileId);
          results.push({
            rowIndex: item.rowIndex,
            name: file.getName(),
            desc: file.getDescription() || ''
          });
          processedCount++;
        } catch (error) {
          results.push({
            rowIndex: item.rowIndex,
            name: 'Error',
            desc: error.message
          });
          errorCount++;
        }
      }
    }

    results.forEach(result => {
      sheet.getRange(result.rowIndex, nameCol).setValue(result.name);
      sheet.getRange(result.rowIndex, descCol).setValue(result.desc);
    });

    const duration = benchmark.end().totalTime.toFixed(2);

    logger.info(`Proses selesai.  Berhasil:  ${processedCount}, Gagal: ${errorCount}, Durasi: ${duration} detik`);

    ui.alert(
      'Proses selesai',
      `Berhasil memproses ${processedCount} dari ${fileCount} file dalam ${duration} detik.`,
      ui.ButtonSet.OK
    );

    logToSheet(logger);
  }, {
    context: 'mengekstrak informasi file',
    showAlert: true,
    logError: true
  });
}

/**
 * Update nama dan deskripsi file berdasarkan data di spreadsheet
 */
function updateFileInfo() {
  return ErrorHandler.execute(() => {
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const logger = new Logger('updateFileInfo');

    logger.info('Memulai proses update info file');

    const responseFileCol = ui.prompt(
      'Update Nama dan Deskripsi File',
      'Masukkan nomor kolom untuk file link (misal: 1 untuk kolom A):',
      ui.ButtonSet.OK_CANCEL
    );

    if (responseFileCol.getSelectedButton() !== ui.Button.OK) {
      logger.info('Proses dibatalkan oleh pengguna');
      return;
    }

    const fileCol = validateNumeric(responseFileCol.getResponseText(), 0);
    if (fileCol === 0) {
      logger.warn(`Input kolom tidak valid: ${responseFileCol.getResponseText()}`);
      ui.alert('Error', 'Kolom file harus berupa angka positif. ', ui.ButtonSet.OK);
      return;
    }

    logger.info(`Kolom file: ${fileCol}`);

    const nameCol = fileCol + 1;
    const descCol = fileCol + 2;

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      ui.alert('Tidak ada data', 'Sheet tidak memiliki data.', ui.ButtonSet.OK);
      return;
    }

    const dataRange = sheet.getRange(2, fileCol, lastRow - 1, 3);
    const values = dataRange.getValues();

    const validRows = values.map((row, idx) => ({
      fileIdOrUrl: row[0],
      newName: row[1] ? row[1].toString() : '',
      newDesc: row[2] ? row[2].toString() : '',
      rowIndex: idx + 2,
      isValid: row[0] && row[0].toString().trim() !== '' && (row[1] || row[2])
    })).filter(r => r.isValid);

    const fileCount = validRows.length;

    logger.info(`Jumlah file yang akan diproses: ${fileCount}`);

    if (fileCount === 0) {
      logger.warn('Tidak ada data yang ditemukan');
      ui.alert('Tidak ada data', 'Tidak ditemukan link file di kolom yang ditentukan atau tidak ada data nama/deskripsi untuk diupdate.', ui.ButtonSet.OK);
      return;
    }

    const confirm = ui.alert(
      'Konfirmasi',
      `Apakah Anda ingin mengubah nama file dan deskripsi sebanyak ${fileCount} file?`,
      ui.ButtonSet.YES_NO
    );

    if (confirm !== ui.Button.YES) {
      logger.info('Proses dibatalkan oleh pengguna pada konfirmasi');
      return;
    }

    const benchmark = new Benchmark('Update File Info').start();
    let successCount = 0;
    let errorCount = 0;

    const statusCol = descCol + 1;
    if (sheet.getRange(1, statusCol).getValue() === '') {
      sheet.getRange(1, statusCol).setValue('Status Update');
    }

    for (const item of validRows) {
      const fileId = extractFileId(item.fileIdOrUrl.toString());

      if (fileId) {
        try {
          const file = DriveApp.getFileById(fileId);
          if (item.newName) file.setName(item.newName);
          if (item.newDesc) file.setDescription(item.newDesc);
          sheet.getRange(item.rowIndex, statusCol).setValue('OK');
          successCount++;
        } catch (error) {
          sheet.getRange(item.rowIndex, statusCol).setValue(`Error: ${error.message}`);
          errorCount++;
        }
      }
    }

    const duration = benchmark.end().totalTime.toFixed(2);

    logger.info(`Proses selesai.  Berhasil:  ${successCount}, Gagal: ${errorCount}, Durasi: ${duration} detik`);

    ui.alert(
      'Proses selesai',
      `Berhasil mengupdate ${successCount} file, gagal ${errorCount} file dalam ${duration} detik.`,
      ui.ButtonSet.OK
    );

    logToSheet(logger);
  }, {
    context: 'mengupdate informasi file',
    showAlert: true,
    logError: true
  });
}

/**
 * Memasukkan gambar thumbnail dari Google Drive ke dalam spreadsheet
 */
function insertImages() {
  return ErrorHandler.execute(() => {
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const logger = new Logger('insertImages');

    logger.info('Memulai proses memasukkan gambar ke cell');

    const responseFileCol = ui.prompt(
      'Ekstrak Gambar ke Cell',
      'Masukkan nomor kolom untuk file link (misal:  1 untuk kolom A):',
      ui.ButtonSet.OK_CANCEL
    );

    if (responseFileCol.getSelectedButton() !== ui.Button.OK) {
      logger.info('Proses dibatalkan oleh pengguna');
      return;
    }

    const fileCol = validateNumeric(responseFileCol.getResponseText(), 0);
    if (fileCol === 0) {
      logger.warn(`Input kolom tidak valid: ${responseFileCol.getResponseText()}`);
      ui.alert('Error', 'Kolom file harus berupa angka positif. ', ui.ButtonSet.OK);
      return;
    }

    const responseImgCol = ui.prompt(
      'Ekstrak Gambar ke Cell',
      'Masukkan nomor kolom untuk gambar (misal:  2 untuk kolom B):',
      ui.ButtonSet.OK_CANCEL
    );

    if (responseImgCol.getSelectedButton() !== ui.Button.OK) {
      logger.info('Proses dibatalkan oleh pengguna');
      return;
    }

    const imgCol = validateNumeric(responseImgCol.getResponseText(), 0);
    if (imgCol === 0) {
      logger.warn(`Input kolom gambar tidak valid: ${responseImgCol.getResponseText()}`);
      ui.alert('Error', 'Kolom gambar harus berupa angka positif. ', ui.ButtonSet.OK);
      return;
    }

    logger.info(`Kolom file: ${fileCol}, Kolom gambar: ${imgCol}`);

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      ui.alert('Tidak ada data', 'Sheet tidak memiliki data.', ui.ButtonSet.OK);
      return;
    }

    const dataRange = sheet.getRange(2, fileCol, lastRow - 1, 1);
    const values = dataRange.getValues();

    const validRows = values.map((row, idx) => ({
      value: row[0],
      rowIndex: idx + 2,
      isValid: row[0] && row[0].toString().trim() !== ''
    })).filter(r => r.isValid);

    const fileCount = validRows.length;

    logger.info(`Jumlah file yang akan diproses: ${fileCount}`);

    if (fileCount === 0) {
      logger.warn('Tidak ada data yang ditemukan');
      ui.alert('Tidak ada data', 'Tidak ditemukan link file di kolom yang ditentukan. ', ui.ButtonSet.OK);
      return;
    }

    const confirm = ui.alert(
      'Konfirmasi',
      `Apakah Anda ingin memasukkan gambar sebanyak ${fileCount} file?`,
      ui.ButtonSet.YES_NO
    );

    if (confirm !== ui.Button.YES) {
      logger.info('Proses dibatalkan oleh pengguna pada konfirmasi');
      return;
    }

    if (sheet.getRange(1, imgCol).getValue() === '') {
      sheet.getRange(1, imgCol).setValue('Thumbnail');
    }

    const benchmark = new Benchmark('Insert Images').start();
    let successCount = 0;
    let noAccessCount = 0;
    let errorCount = 0;

    for (const item of validRows) {
      const fileIdOrUrl = item.value.toString();
      const fileId = extractFileId(fileIdOrUrl);
      const imgCell = sheet.getRange(item.rowIndex, imgCol);

      if (fileId) {
        try {
          const file = DriveApp.getFileById(fileId);
          const permissions = file.getSharingAccess();

          if (permissions === DriveApp.Access.ANYONE ||
            permissions === DriveApp.Access.ANYONE_WITH_LINK) {
            const imgUrl = `https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${fileId}`;
            imgCell.setFormula(`=IMAGE("${imgUrl}")`);
            successCount++;
          } else {
            imgCell.setValue('Atur akses file menjadi "Anyone with the link" agar bisa menampilkan gambar');
            noAccessCount++;
          }
        } catch (error) {
          imgCell.setValue(`Error: ${error.message}`);
          errorCount++;
        }
      }
    }

    const duration = benchmark.end().totalTime.toFixed(2);

    logger.info(`Proses selesai. Berhasil: ${successCount}, Perlu sharing: ${noAccessCount}, Error: ${errorCount}, Durasi: ${duration} detik`);

    ui.alert(
      'Proses selesai',
      `Berhasil:  ${successCount}, Perlu sharing:  ${noAccessCount}, Error: ${errorCount}\nDurasi:  ${duration} detik. `,
      ui.ButtonSet.OK
    );

    logToSheet(logger);
  }, {
    context: 'memasukkan gambar ke cell',
    showAlert: true,
    logError: true
  });
}

/**
 * Membuat daftar file dari folder Google Drive (termasuk subfolder)
 */
function generateFileList() {
  return ErrorHandler.execute(() => {
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const logger = new Logger('generateFileList');

    logger.info('Memulai proses membuat daftar file');

    const responseFolderLink = ui.prompt(
      'Ekstrak List Link File',
      'Masukkan link folder Google Drive: ',
      ui.ButtonSet.OK_CANCEL
    );

    if (responseFolderLink.getSelectedButton() !== ui.Button.OK) {
      logger.info('Proses dibatalkan oleh pengguna');
      return;
    }

    const folderLink = responseFolderLink.getResponseText();

    const folderId = extractFileId(folderLink);
    if (!folderId) {
      logger.warn(`ID folder tidak ditemukan: ${folderLink}`);
      ui.alert('Error', 'Link folder tidak valid.  Pastikan Anda memasukkan link yang benar.', ui.ButtonSet.OK);
      return;
    }

    logger.info(`ID folder: ${folderId}`);

    let folder;
    try {
      folder = DriveApp.getFolderById(folderId);
      logger.info(`Folder ditemukan: ${folder.getName()}`);
    } catch (error) {
      logger.error(`Gagal mengakses folder: ${error.message}`);
      ui.alert('Error', `Tidak dapat mengakses folder: ${error.message}`, ui.ButtonSet.OK);
      return;
    }

    const responseResultCol = ui.prompt(
      'Ekstrak List Link File',
      'Masukkan nomor kolom untuk menyimpan hasil (misal: 1 untuk kolom A):',
      ui.ButtonSet.OK_CANCEL
    );

    if (responseResultCol.getSelectedButton() !== ui.Button.OK) {
      logger.info('Proses dibatalkan oleh pengguna');
      return;
    }

    const resultCol = validateNumeric(responseResultCol.getResponseText(), 0);
    if (resultCol === 0) {
      logger.warn(`Input kolom hasil tidak valid: ${responseResultCol.getResponseText()}`);
      ui.alert('Error', 'Kolom hasil harus berupa angka positif.', ui.ButtonSet.OK);
      return;
    }

    logger.info(`Kolom hasil: ${resultCol}`);

    const confirm = ui.alert(
      'Konfirmasi',
      `Akan mengekstrak daftar file dari folder "${folder.getName()}" dan semua subfoldernya.  Proses ini mungkin membutuhkan waktu untuk folder besar. Lanjutkan?`,
      ui.ButtonSet.YES_NO
    );

    if (confirm !== ui.Button.YES) {
      logger.info('Proses dibatalkan oleh pengguna pada konfirmasi');
      return;
    }

    const statusCol = resultCol + 3;
    const statusCell = sheet.getRange(1, statusCol);
    statusCell.setValue("Memproses.. .");

    sheet.getRange(1, resultCol).setValue('Link');
    sheet.getRange(1, resultCol + 1).setValue('Judul File');
    sheet.getRange(1, resultCol + 2).setValue('Nama Folder Parent');

    const benchmark = new Benchmark('Generate File List').start();
    const files = [];

    logger.info(`Mulai proses folder:  ${folder.getName()}`);
    processFolder(folder, '', files, logger);

    benchmark.checkpoint(`Total file ditemukan: ${files.length}`);
    logger.info(`Menemukan total ${files.length} file`);

    if (files.length === 0) {
      statusCell.setValue('Tidak ada file ditemukan');
      ui.alert('Info', 'Tidak ada file ditemukan di folder tersebut.', ui.ButtonSet.OK);
      logToSheet(logger);
      return;
    }

    const batchSize = 100;
    for (let i = 0; i < files.length; i += batchSize) {
      const chunk = files.slice(i, i + batchSize);
      const data = chunk.map(file => [file.url, file.title, file.parentName]);
      sheet.getRange(i + 2, resultCol, chunk.length, 3).setValues(data);

      statusCell.setValue(`Menulis ${Math.min(i + batchSize, files.length)}/${files.length} file... `);

      if ((i + batchSize) < files.length && benchmark.getElapsedTime() > MAX_EXECUTION_TIME - 60) {
        logger.warn(`Waktu eksekusi mendekati batas, menyimpan progres di baris ${i + chunk.length}`);
        statusCell.setValue(`Timeout setelah ${i + chunk.length} file.  Jalankan lagi untuk melanjutkan. `);

        const duration = benchmark.end().totalTime.toFixed(2);

        ui.alert(
          'Batas waktu',
          `Sudah berhasil menulis ${i + chunk.length} dari ${files.length} file (${Math.round((i + chunk.length) * 100 / files.length)}%).\nSilakan jalankan fungsi ini lagi untuk melanjutkan. `,
          ui.ButtonSet.OK
        );

        logToSheet(logger);
        return;
      }
    }

    const duration = benchmark.end().totalTime.toFixed(2);

    statusCell.setValue(`Selesai dalam ${duration} detik, total ${files.length} file`);
    logger.info(`Proses selesai.  Durasi: ${duration} detik`);

    ui.alert(
      'Proses selesai',
      `Berhasil mengekstrak ${files.length} file dalam ${duration} detik.`,
      ui.ButtonSet.OK
    );

    logToSheet(logger);
  }, {
    context: 'mengekstrak daftar file',
    showAlert: true,
    logError: true
  });
}

/**
 * Fungsi iteratif untuk memproses folder dan subfoldernya (menghindari stack overflow)
 *
 * @param {Folder} folder - Folder yang akan diproses
 * @param {string} parentName - Nama folder induk
 * @param {Array} files - Array untuk menyimpan hasil
 * @param {Logger} logger - Logger untuk mencatat aktivitas
 */
function processFolder(folder, parentName, files, logger) {
  const maxDepth = 10;
  const maxFiles = 5000;

  const folderQueue = [{
    folder: folder,
    parentName: parentName,
    depth: 0
  }];

  while (folderQueue.length > 0 && files.length < maxFiles) {
    const current = folderQueue.shift();
    const currentFolder = current.folder;
    const currentParent = current.parentName;
    const currentDepth = current.depth;

    if (currentDepth > maxDepth) {
      logger.warn(`Mencapai kedalaman maksimum ${maxDepth} di folder ${currentFolder.getName()}, melewati subfolder`);
      continue;
    }

    try {
      const fileIterator = currentFolder.getFiles();
      let fileCount = 0;

      while (fileIterator.hasNext() && files.length < maxFiles) {
        const file = fileIterator.next();
        const fileId = file.getId();
        const fileTitle = file.getName();
        const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;

        files.push({
          url: fileUrl,
          title: fileTitle,
          parentName: currentParent || currentFolder.getName()
        });

        fileCount++;
      }

      if (fileCount > 0) {
        logger.info(`Menemukan ${fileCount} file di folder ${currentFolder.getName()}`);
      }

      const subfolderIterator = currentFolder.getFolders();
      let subfolderCount = 0;

      while (subfolderIterator.hasNext()) {
        const subfolder = subfolderIterator.next();
        folderQueue.push({
          folder: subfolder,
          parentName: currentFolder.getName(),
          depth: currentDepth + 1
        });
        subfolderCount++;
      }

      if (subfolderCount > 0) {
        logger.info(`Menambahkan ${subfolderCount} subfolder dari ${currentFolder.getName()} ke antrian`);
      }
    } catch (error) {
      logger.error(`Error memproses folder ${currentFolder.getName()}: ${error.message}`);
    }
  }

  if (files.length >= maxFiles) {
    logger.warn(`Mencapai batas maksimum ${maxFiles} file`);
  }
}


/**
 * Berbagi file dengan email
 */
function shareFilesByEmail() {
  return ErrorHandler.execute(() => {
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const logger = new Logger('shareFilesByEmail');

    logger.info('Memulai proses berbagi file melalui email');

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let emailColIndex = headers.indexOf("Email");
    let linkColIndex = headers.indexOf("Link");
    let statusColIndex = headers.indexOf("Status");

    if (emailColIndex === -1 || linkColIndex === -1) {
      logger.info('Header kolom tidak ditemukan, meminta input user');

      const responseEmailCol = ui.prompt(
        'Share File to Email',
        'Kolom "Email" tidak ditemukan. Masukkan nomor kolom untuk email (misal: 1 untuk kolom A):',
        ui.ButtonSet.OK_CANCEL
      );

      if (responseEmailCol.getSelectedButton() !== ui.Button.OK) {
        logger.info('Proses dibatalkan oleh pengguna');
        return;
      }

      const emailCol = validateNumeric(responseEmailCol.getResponseText(), 0);
      if (emailCol === 0) {
        logger.warn(`Input kolom email tidak valid: ${responseEmailCol.getResponseText()}`);
        ui.alert('Error', 'Kolom email harus berupa angka positif. ', ui.ButtonSet.OK);
        return;
      }

      const responseLinkCol = ui.prompt(
        'Share File to Email',
        'Kolom "Link" tidak ditemukan.  Masukkan nomor kolom untuk link file (misal: 2 untuk kolom B):',
        ui.ButtonSet.OK_CANCEL
      );

      if (responseLinkCol.getSelectedButton() !== ui.Button.OK) {
        logger.info('Proses dibatalkan oleh pengguna');
        return;
      }

      const linkCol = validateNumeric(responseLinkCol.getResponseText(), 0);
      if (linkCol === 0) {
        logger.warn(`Input kolom link tidak valid: ${responseLinkCol.getResponseText()}`);
        ui.alert('Error', 'Kolom link harus berupa angka positif.', ui.ButtonSet.OK);
        return;
      }

      emailColIndex = emailCol - 1;
      linkColIndex = linkCol - 1;
      statusColIndex = Math.max(emailColIndex, linkColIndex) + 1;

      sheet.getRange(1, emailCol).setValue("Email");
      sheet.getRange(1, linkCol).setValue("Link");
      sheet.getRange(1, statusColIndex + 1).setValue("Status");

      logger.info(`Kolom yang digunakan - Email: ${emailCol}, Link: ${linkCol}, Status: ${statusColIndex + 1}`);
    } else {
      if (statusColIndex === -1) {
        statusColIndex = Math.max(emailColIndex, linkColIndex) + 1;
        sheet.getRange(1, statusColIndex + 1).setValue("Status");
      }
      logger.info(`Kolom yang ditemukan - Email:  ${emailColIndex + 1}, Link:  ${linkColIndex + 1}, Status: ${statusColIndex + 1}`);
    }

    processSharing(sheet, emailColIndex, linkColIndex, statusColIndex, logger);

    logToSheet(logger);
  }, {
    context: 'berbagi file melalui email',
    showAlert: true,
    logError: true
  });
}

/**
 * Proses berbagi file dengan email
 *
 * @param {Sheet} sheet - Sheet yang diproses
 * @param {number} emailColIndex - Index kolom email (0-based)
 * @param {number} linkColIndex - Index kolom link (0-based)
 * @param {number} statusColIndex - Index kolom status (0-based)
 * @param {Logger} logger - Logger untuk mencatat aktivitas
 */
function processSharing(sheet, emailColIndex, linkColIndex, statusColIndex, logger) {
  const ui = SpreadsheetApp.getUi();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    ui.alert('Tidak ada data', 'Sheet tidak memiliki data. ', ui.ButtonSet.OK);
    return;
  }

  const maxCol = Math.max(emailColIndex, linkColIndex, statusColIndex) + 2;
  const data = sheet.getRange(2, 1, lastRow - 1, maxCol).getValues();

  const rowsToProcess = data
    .map((row, index) => ({
      rowIndex: index + 2,
      email: row[emailColIndex] ? row[emailColIndex].toString().trim() : '',
      link: row[linkColIndex] ? row[linkColIndex].toString() : '',
      status: row[statusColIndex] ? row[statusColIndex].toString().toUpperCase() : ''
    }))
    .filter(item =>
      item.email &&
      validateEmail(item.email) &&
      item.link &&
      item.status !== "TRUE" &&
      !item.status.startsWith("OK")
    );

  const filesToShare = rowsToProcess.length;

  logger.info(`Ditemukan ${filesToShare} file yang akan dibagikan`);

  if (filesToShare === 0) {
    ui.alert('Tidak ada data', 'Tidak ditemukan data yang perlu diproses (sudah di-share atau email/link tidak valid).', ui.ButtonSet.OK);
    return;
  }

  const response = ui.alert(
    "Konfirmasi",
    `Akan membagikan akses ke ${filesToShare} file.  Lanjutkan?`,
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    logger.info('Proses dibatalkan oleh pengguna pada konfirmasi');
    return;
  }

  const benchmark = new Benchmark('Share Files by Email').start();
  let successCount = 0;
  let errorCount = 0;

  logger.info('Memulai proses berbagi file');

  for (const row of rowsToProcess) {
    try {
      const email = row.email;
      const link = row.link;
      const fileId = extractFileId(link);

      if (!fileId) {
        throw new Error("ID file tidak ditemukan dari link");
      }

      const file = DriveApp.getFileById(fileId);

      file.addViewer(email);

      sheet.getRange(row.rowIndex, statusColIndex + 1).setValue("TRUE");
      successCount++;
      logger.info(`Berhasil share file ke ${email}`);

      Utilities.sleep(200);
    } catch (error) {
      sheet.getRange(row.rowIndex, statusColIndex + 1).setValue("Error:  " + error.message);
      errorCount++;
      logger.error(`Gagal share ke ${row.email}: ${error.message}`);
    }
  }

  const duration = benchmark.end().totalTime.toFixed(2);

  logger.info(`Proses berbagi selesai. Berhasil: ${successCount}, Gagal: ${errorCount}, Durasi: ${duration} detik`);

  ui.alert(
    "Proses selesai",
    `Berhasil membagikan ${successCount} file, gagal ${errorCount} file dalam ${duration} detik.`,
    ui.ButtonSet.OK
  );
}

/**
 * Membuat template email untuk pengiriman massal
 */
function createEmailTemplate() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName('Email Template');

  if (!sheet) {
    sheet = ss.insertSheet('Email Template');

    sheet.getRange(1, 1, 1, 4).setValues([['Email', 'Subject', 'Body', 'Status']]);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold');

    sheet.getRange(2, 1, 1, 3).setValues([
      ['contoh@email.com', 'Subjek email', 'Halo,\n\nIni adalah contoh isi email.\n\nSalam,\nTim GDocs Automator']
    ]);

    sheet.setColumnWidth(1, 200);
    sheet.setColumnWidth(2, 250);
    sheet.setColumnWidth(3, 400);
    sheet.setColumnWidth(4, 100);

    ui.alert(
      'Template Email Dibuat',
      'Sheet "Email Template" telah dibuat.  Silakan isi data email yang akan dikirim.',
      ui.ButtonSet.OK
    );
  } else {
    ui.alert(
      'Template Sudah Ada',
      'Sheet "Email Template" sudah ada. Anda dapat menggunakannya untuk mengirim email massal.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Kirim email secara massal
 */
function sendEmailBulk() {
  return ErrorHandler.execute(() => {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    let sheet = ss.getSheetByName('Email Template');
    if (!sheet) {
      const response = ui.alert(
        'Email Template',
        'Sheet "Email Template" belum dibuat.  Buat sekarang? ',
        ui.ButtonSet.YES_NO
      );

      if (response === ui.Button.YES) {
        createEmailTemplate();
        return;
      } else {
        sheet = ss.getActiveSheet();
      }
    }

    const logger = new Logger('sendEmailBulk');
    logger.info('Memulai proses pengiriman email massal');

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const expectedHeaders = ['Email', 'Subject', 'Body', 'Status'];
    const missingHeaders = expectedHeaders.filter(header => headers.indexOf(header) === -1);

    if (missingHeaders.length > 0) {
      logger.warn(`Header yang diperlukan tidak ditemukan: ${missingHeaders.join(', ')}`);

      const response = ui.alert(
        'Template Email Bulk',
        `Kolom ${missingHeaders.join(', ')} tidak ditemukan.  Apakah Anda ingin membuat template? `,
        ui.ButtonSet.YES_NO
      );

      if (response === ui.Button.YES) {
        sheet.clear();
        sheet.getRange(1, 1, 1, 4).setValues([['Email', 'Subject', 'Body', 'Status']]);
        sheet.getRange(2, 1, 1, 4).setValues([['contoh@email. com', 'Subjek email', 'Isi email', '']]);
        sheet.getRange(1, 1, 1, 4).setFontWeight('bold');

        logger.info('Template email dibuat');
        ui.alert('Template dibuat', 'Silakan isi data email dan jalankan kembali fungsi ini.', ui.ButtonSet.OK);

        logToSheet(logger);
        return;
      } else {
        logger.info('Pembuatan template dibatalkan oleh pengguna');
        return;
      }
    }

    const emailColIndex = headers.indexOf('Email');
    const subjectColIndex = headers.indexOf('Subject');
    const bodyColIndex = headers.indexOf('Body');
    const statusColIndex = headers.indexOf('Status');

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      ui.alert('Tidak ada data', 'Tidak ada email untuk dikirim.', ui.ButtonSet.OK);
      return;
    }

    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

    const dailyQuotaRemaining = MailApp.getRemainingDailyQuota();
    logger.info(`Sisa kuota email harian: ${dailyQuotaRemaining}`);

    const unsentMessages = data.filter(row =>
      row[emailColIndex] &&
      validateEmail(row[emailColIndex].toString()) &&
      row[statusColIndex] !== "Terkirim" &&
      row[statusColIndex]?.toString().toLowerCase() !== "terkirim"
    ).length;

    logger.info(`Jumlah email yang akan dikirim: ${unsentMessages}`);

    if (unsentMessages === 0) {
      logger.info('Tidak ada email untuk dikirim');
      ui.alert('Tidak ada email', 'Tidak ada email yang perlu dikirim atau semua email sudah terkirim.', ui.ButtonSet.OK);
      return;
    }

    if (unsentMessages > dailyQuotaRemaining) {
      logger.warn(`Jumlah email (${unsentMessages}) melebihi kuota tersisa (${dailyQuotaRemaining})`);
      const proceed = ui.alert(
        'Peringatan Kuota',
        `Jumlah email yang akan dikirim (${unsentMessages}) melebihi kuota tersisa (${dailyQuotaRemaining}). Lanjutkan dengan mengirim ${dailyQuotaRemaining} email pertama?`,
        ui.ButtonSet.YES_NO
      );

      if (proceed !== ui.Button.YES) {
        return;
      }
    }

    const message = `Sisa pengiriman email hari ini: ${dailyQuotaRemaining}\nJumlah pesan yang akan dikirim: ${unsentMessages}\n\nLanjutkan pengiriman? `;
    const response = ui.alert('Konfirmasi', message, ui.ButtonSet.OK_CANCEL);

    if (response !== ui.Button.OK) {
      logger.info('Proses dibatalkan oleh pengguna');
      return;
    }

    const benchmark = new Benchmark('Send Email Bulk').start();
    let successCount = 0;
    let errorCount = 0;
    let quotaExhausted = false;

    for (let i = 0; i < data.length && !quotaExhausted; i++) {
      const row = data[i];
      const emailAddress = row[emailColIndex] ? row[emailColIndex].toString().trim() : '';
      const subject = row[subjectColIndex] ? row[subjectColIndex].toString() : '';
      const body = row[bodyColIndex] ? row[bodyColIndex].toString() : '';
      const sentStatus = row[statusColIndex] ? row[statusColIndex].toString().toLowerCase() : '';

      if (!emailAddress) continue;

      if (!validateEmail(emailAddress)) {
        logger.warn(`Email tidak valid pada baris ${i + 2}: ${emailAddress}`);
        sheet.getRange(i + 2, statusColIndex + 1).setValue("Error: Email tidak valid");
        errorCount++;
        continue;
      }

      if (sentStatus !== "terkirim") {
        try {
          if (MailApp.getRemainingDailyQuota() <= 0) {
            logger.warn('Kuota email harian habis');
            quotaExhausted = true;
            break;
          }

          const safeBody = sanitizeEmailBody(body);

          MailApp.sendEmail(emailAddress, subject, safeBody);
          sheet.getRange(i + 2, statusColIndex + 1).setValue("Terkirim");
          logger.info(`Email berhasil dikirim ke: ${emailAddress}`);
          successCount++;

          Utilities.sleep(EMAIL_DELAY_MS);
        } catch (error) {
          logger.error(`Gagal mengirim email ke ${emailAddress}: ${error.message}`);
          sheet.getRange(i + 2, statusColIndex + 1).setValue("Error: " + error.message);
          errorCount++;
        }
      }
    }

    const duration = benchmark.end().totalTime.toFixed(2);

    const summaryRow = sheet.getLastRow() + 2;
    sheet.getRange(summaryRow, 1).setValue("=== Ringkasan ===");
    sheet.getRange(summaryRow + 1, 1).setValue(`Email terkirim: ${successCount}`);
    sheet.getRange(summaryRow + 2, 1).setValue(`Email gagal: ${errorCount}`);
    sheet.getRange(summaryRow + 3, 1).setValue(`Waktu proses: ${duration} detik`);
    sheet.getRange(summaryRow + 4, 1).setValue(`Diproses pada: ${formatDate(new Date())}`);

    if (quotaExhausted) {
      sheet.getRange(summaryRow + 5, 1).setValue("PERINGATAN: Kuota email harian habis!");
    }

    logger.info(`Proses selesai.  Berhasil:  ${successCount}, Gagal: ${errorCount}, Durasi: ${duration} detik`);

    let alertMessage = `Berhasil mengirim ${successCount} email, gagal ${errorCount} email dalam ${duration} detik.`;
    if (quotaExhausted) {
      alertMessage += "\n\nPERINGATAN:  Kuota email harian habis.  Sisa email akan dikirim besok.";
    }

    ui.alert("Proses selesai", alertMessage, ui.ButtonSet.OK);

    logToSheet(logger);
  }, {
    context: 'mengirim email massal',
    showAlert: true,
    logError: true
  });
}

/**
 * Sanitasi body email untuk keamanan
 * @param {string} body - Body email
 * @returns {string} - Body yang sudah disanitasi
 */
function sanitizeEmailBody(body) {
  if (!body) return '';

  return body.toString()
    .replace(/<script\b[^<]*(?:(?! <\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}


/**
 * Format tanggal dan waktu untuk output yang lebih mudah dibaca
 *
 * @param {Date} date - Objek tanggal yang akan diformat
 * @returns {string} - String tanggal dan waktu terformat
 */
function formatDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "Invalid Date";
  }
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm: ss");
}

/**
 * Sanitasi nama file untuk menghindari karakter yang tidak valid
 *
 * @param {string} filename - Nama file yang akan disanitasi
 * @returns {string} - Nama file yang sudah disanitasi
 */
function sanitizeFileName(filename) {
  if (!filename) return 'untitled';

  return filename.toString()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);
}

/**
 * Ekstraksi ID dari URL atau mengembalikan string asli jika itu adalah ID. 
 *
 * @param {string} idOrUrl - ID atau URL untuk diekstraksi. 
 * @returns {string} - ID yang diekstraksi atau string kosong jika tidak valid.
 */
function extractFileId(idOrUrl) {
  if (!idOrUrl) return '';

  const input = idOrUrl.toString().trim();

  const patterns = [
    /\/d\/([a-zA-Z0-9_-]{25,})/,
    /\/folders\/([a-zA-Z0-9_-]{25,})/,
    /id=([a-zA-Z0-9_-]{25,})/,
    /^([a-zA-Z0-9_-]{25,})$/
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  const generalMatch = input.match(/[a-zA-Z0-9_-]{25,}/);
  return generalMatch ? generalMatch[0] : '';
}

/**
 * Fungsi untuk memvalidasi input numerik
 *
 * @param {string|number} input - Input yang akan divalidasi
 * @param {number} defaultValue - Nilai default jika input tidak valid
 * @returns {number} - Nilai numerik yang valid atau default
 */
function validateNumeric(input, defaultValue = 1) {
  if (input === null || input === undefined || input === '') {
    return defaultValue;
  }

  const value = parseInt(input, 10);
  return isNaN(value) || value <= 0 ? defaultValue : value;
}

/**
 * Validasi format email dengan regex yang lebih ketat
 *
 * @param {string} email - Email yang akan divalidasi
 * @returns {boolean} - True jika email valid
 */
function validateEmail(email) {
  if (!email) return false;

  const emailStr = email.toString().trim();
  const emailRegex = /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

  if (emailStr.length > 254) return false;
  if (emailStr.includes('..')) return false;
  if (emailStr.startsWith('.') || emailStr.endsWith('.')) return false;

  return emailRegex.test(emailStr);
}

/**
 * Fungsi untuk menampilkan logs
 */
function viewLogs() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let logSheet = ss.getSheetByName('Logs');

  if (!logSheet) {
    ui.alert('Logs', 'Tidak ada log yang tersedia. ', ui.ButtonSet.OK);
    return;
  }

  logSheet.activate();

  const response = ui.alert(
    'Logs',
    'Log berhasil ditampilkan.  Apakah Anda ingin menghapus log? ',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    const lastRow = logSheet.getLastRow();
    if (lastRow > 1) {
      logSheet.deleteRows(2, lastRow - 1);
    }
    ui.alert('Logs', 'Log berhasil dihapus.', ui.ButtonSet.OK);
  }
}

/**
 * Menyimpan log ke sheet Logs
 *
 * @param {Logger} logger - Logger yang berisi log
 */
function logToSheet(logger) {
  if (!logger) return;
  if (typeof logger.getLogs !== 'function') return;

  const logs = logger.getLogs();
  if (!Array.isArray(logs) || logs.length === 0) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName('Logs');

  if (!logSheet) {
    logSheet = ss.insertSheet('Logs');
    logSheet.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Module', 'Level', 'Message', 'Data']]);
    logSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    logSheet.setFrozenRows(1);

    logSheet.setColumnWidth(1, 180);
    logSheet.setColumnWidth(2, 120);
    logSheet.setColumnWidth(3, 80);
    logSheet.setColumnWidth(4, 400);
    logSheet.setColumnWidth(5, 250);
  }

  const lastRow = logSheet.getLastRow();
  const logData = logs.map(log => [
    log.timestamp,
    log.module,
    log.level,
    log.message,
    log.data || ''
  ]);

  logSheet.getRange(lastRow + 1, 1, logData.length, 5).setValues(logData);

  for (let i = 0; i < logData.length; i++) {
    const cell = logSheet.getRange(lastRow + 1 + i, 3);
    const level = logData[i][2];

    switch (level) {
      case 'ERROR':
        cell.setBackground('#f4cccc');
        break;
      case 'WARNING':
        cell.setBackground('#fff2cc');
        break;
      case 'INFO':
        cell.setBackground('#d9ead3');
        break;
    }
  }
}

//==============================================================================
// UTILITY
//==============================================================================

/**
 * Kelas untuk mengelola state/status aplikasi
 */
class AppState {
  /**
   * @param {string} namespace - Namespace untuk property
   */
  constructor(namespace) {
    this.namespace = namespace;
    this.props = PropertiesService.getScriptProperties();
  }

  /**
   * Menyimpan nilai dengan key tertentu
   *
   * @param {string} key - Kunci property
   * @param {*} value - Nilai yang akan disimpan
   */
  set(key, value) {
    const fullKey = `${this.namespace}.${key}`;
    let valueToStore;

    if (value === null || value === undefined) {
      valueToStore = '';
    } else if (typeof value === 'object') {
      valueToStore = JSON.stringify(value);
    } else {
      valueToStore = value.toString();
    }

    this.props.setProperty(fullKey, valueToStore);
  }

  /**
   * Mengambil nilai dari key tertentu
   *
   * @param {string} key - Kunci property
   * @param {*} defaultValue - Nilai default jika key tidak ditemukan
   * @returns {*} - Nilai yang disimpan
   */
  get(key, defaultValue = null) {
    const fullKey = `${this.namespace}.${key}`;
    const value = this.props.getProperty(fullKey);

    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }

    if ((value.startsWith('{') && value.endsWith('}')) ||
      (value.startsWith('[') && value.endsWith(']'))) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }

    if (/^-?\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^-?\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }

    if (value === 'true') return true;
    if (value === 'false') return false;

    return value;
  }

  /**
   * Menghapus key tertentu
   *
   * @param {string} key - Kunci property
   */
  remove(key) {
    const fullKey = `${this.namespace}.${key}`;
    this.props.deleteProperty(fullKey);
  }

  /**
   * Menghapus semua key di namespace ini
   */
  clear() {
    const allProps = this.props.getProperties();
    const prefix = `${this.namespace}.`;

    Object.keys(allProps).forEach(key => {
      if (key.startsWith(prefix)) {
        this.props.deleteProperty(key);
      }
    });
  }
}

/**
 * Kelas untuk menangani error dengan lebih baik
 */
class ErrorHandler {
  /**
   * Menjalankan fungsi dengan penanganan error
   *
   * @param {Function} fn - Fungsi yang akan dijalankan
   * @param {Object} options - Opsi penanganan error
   * @returns {*} - Hasil dari fungsi atau null jika error
   */
  static execute(fn, options = {}) {
    const defaultOptions = {
      showAlert: true,
      logError: true,
      rethrow: false,
      context: 'Operasi'
    };

    const config = { ...defaultOptions, ...options };

    try {
      return fn();
    } catch (error) {
      if (config.logError) {
        console.error(`Error in ${config.context}:`, error);

        const logger = new Logger('ErrorHandler');
        logger.error(`Error saat ${config.context.toLowerCase()}: ${error.message}`, {
          stack: error.stack,
          context: config.context
        });
        logToSheet(logger);
      }

      if (config.showAlert) {
        try {
          const ui = SpreadsheetApp.getUi();
          ui.alert(
            'Error',
            `Terjadi kesalahan saat ${config.context.toLowerCase()}:  ${error.message}`,
            ui.ButtonSet.OK
          );
        } catch (uiError) {
          console.error('Cannot show UI alert:', uiError);
        }
      }

      if (config.rethrow) {
        throw error;
      }

      return null;
    }
  }
}

/**
 * Sistem logging sederhana untuk tracking dan debugging
 */
class Logger {
  /**
   * @param {string} module - Nama modul yang menggunakan logger
   */
  constructor(module) {
    this.logs = [];
    this.module = module;
    this.startTime = new Date();
    this.lastLogTime = this.startTime;
  }

  /**
   * Mencatat pesan log dengan level tertentu
   *
   * @param {string} level - Level log (INFO, WARNING, ERROR)
   * @param {string} message - Pesan log
   * @param {Object} [data] - Data tambahan (opsional)
   */
  log(level, message, data = null) {
    const now = new Date();
    const elapsedMs = now - this.lastLogTime;
    this.lastLogTime = now;

    const entry = {
      timestamp: formatDate(now),
      module: this.module,
      level: level,
      message: message,
      data: data ? JSON.stringify(data) : null,
      elapsedMs: elapsedMs
    };

    this.logs.push(entry);

    console.log(`${entry.timestamp} [${this.module}] [${level}] ${message}`);
  }

  /**
   * Log level INFO
   *
   * @param {string} message - Pesan log
   * @param {Object} [data] - Data tambahan (opsional)
   */
  info(message, data = null) {
    this.log('INFO', message, data);
  }

  /**
   * Log level WARNING
   *
   * @param {string} message - Pesan log
   * @param {Object} [data] - Data tambahan (opsional)
   */
  warn(message, data = null) {
    this.log('WARNING', message, data);
  }

  /**
   * Log level ERROR
   *
   * @param {string} message - Pesan log
   * @param {Object} [data] - Data tambahan (opsional)
   */
  error(message, data = null) {
    this.log('ERROR', message, data);
  }

  /**
   * Mendapatkan semua log
   *
   * @returns {Array} - Array berisi entri log
   */
  getLogs() {
    return this.logs;
  }
}

/**
 * Kelas untuk melakukan benchmark kinerja
 */
class Benchmark {
  /**
   * @param {string} name - Nama benchmark
   */
  constructor(name) {
    this.name = name;
    this.startTime = null;
    this.checkpoints = [];
  }

  /**
   * Memulai benchmark
   *
   * @returns {Benchmark} - Instance benchmark untuk chaining
   */
  start() {
    this.startTime = new Date();
    console.log(`[${this.name}] Started at ${formatDate(this.startTime)}`);
    return this;
  }

  /**
   * Mendapatkan waktu yang telah berlalu sejak start
   *
   * @returns {number} - Waktu dalam detik
   */
  getElapsedTime() {
    if (!this.startTime) return 0;
    return (new Date() - this.startTime) / 1000;
  }

  /**
   * Menandai checkpoint dalam benchmark
   *
   * @param {string} label - Label checkpoint
   * @returns {Benchmark} - Instance benchmark untuk chaining
   */
  checkpoint(label) {
    if (!this.startTime) this.start();

    const now = new Date();
    const elapsed = (now - this.startTime) / 1000;
    const lastCheckpoint = this.checkpoints.length > 0
      ? this.checkpoints[this.checkpoints.length - 1].time
      : 0;
    const sinceLast = elapsed - lastCheckpoint;

    this.checkpoints.push({
      label: label,
      time: elapsed,
      sinceLast: sinceLast
    });

    console.log(`[${this.name}] ${label}:  ${elapsed.toFixed(2)}s (+${sinceLast.toFixed(2)}s)`);

    return this;
  }

  /**
   * Mengakhiri benchmark dan menampilkan hasil
   *
   * @returns {Object} - Hasil benchmark
   */
  end() {
    if (!this.startTime) {
      return { name: this.name, totalTime: 0, checkpoints: [] };
    }

    const endTime = new Date();
    const totalTime = (endTime - this.startTime) / 1000;

    console.log(`[${this.name}] Finished - Total: ${totalTime.toFixed(2)}s`);

    return {
      name: this.name,
      startTime: formatDate(this.startTime),
      endTime: formatDate(endTime),
      totalTime: totalTime,
      checkpoints: this.checkpoints
    };
  }
}

/**
 * Fungsi untuk melakukan operasi dengan mekanisme retry
 *
 * @param {Function} operation - Fungsi yang akan dijalankan
 * @param {number} maxRetries - Jumlah maksimum percobaan (default: 3)
 * @param {number} delayMs - Delay antara percobaan dalam milidetik (default: 1000)
 * @returns {*} - Hasil dari operasi
 */
function withRetry(operation, maxRetries = 3, delayMs = 1000) {
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1}/${maxRetries} failed: ${error.message}`);

      if (attempt < maxRetries - 1) {
        const waitTime = delayMs * Math.pow(2, attempt);
        Utilities.sleep(waitTime);
      }
    }
  }

  throw lastError;
}

/**
 * Fungsi untuk mengoptimalkan operasi batch pada DriveApp
 *
 * @param {Array} operations - Array operasi yang akan dilakukan
 * @param {number} batchSize - Ukuran batch (default: 10)
 */
function batchProcessDriveOperations(operations, batchSize = MAX_BATCH_SIZE) {
  if (!Array.isArray(operations)) {
    console.error("Operations harus berupa array");
    return { success: 0, failure: 0 };
  }

  if (operations.length === 0) {
    console.log("Tidak ada operasi untuk diproses");
    return { success: 0, failure: 0 };
  }

  const validOperations = operations.filter(op => op && typeof op.execute === 'function');

  if (validOperations.length === 0) {
    console.error("Tidak ada operasi valid untuk diproses");
    return { success: 0, failure: 0 };
  }

  const totalOperations = validOperations.length;
  const batches = Math.ceil(totalOperations / batchSize);

  console.log(`Processing ${totalOperations} operations in ${batches} batches`);

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < batches; i++) {
    const startIdx = i * batchSize;
    const endIdx = Math.min((i + 1) * batchSize, totalOperations);
    const currentBatch = validOperations.slice(startIdx, endIdx);

    console.log(`Batch ${i + 1}/${batches}: operations ${startIdx + 1}-${endIdx}`);

    currentBatch.forEach((op, index) => {
      try {
        const result = op.execute();
        if (result === true || result === undefined) {
          successCount++;
        }
      } catch (error) {
        console.error(`Error pada operasi ${startIdx + index + 1}:  ${error.message}`);
        failureCount++;
      }
    });

    if (i < batches - 1) {
      Utilities.sleep(100);
    }
  }

  console.log(`Batch complete: ${successCount} success, ${failureCount} failed`);

  return { success: successCount, failure: failureCount };
}

/**
 * Mengatur trigger untuk melanjutkan operasi yang terganggu
 *
 * @param {string} functionName - Nama fungsi yang akan dipanggil
 * @param {number} delaySeconds - Delay dalam detik (minimal 1)
 * @returns {string} - ID trigger
 */
function scheduleResumeOperation(functionName, delaySeconds = 1) {
  deleteTriggersByFunction(functionName);

  const actualDelay = Math.max(1, delaySeconds);
  const trigger = ScriptApp.newTrigger(functionName)
    .timeBased()
    .after(actualDelay * 1000)
    .create();

  const triggerId = trigger.getUniqueId();
  const appState = new AppState('triggers');
  appState.set(functionName, triggerId);

  console.log(`Scheduled ${functionName} to run in ${actualDelay} seconds, trigger ID: ${triggerId}`);

  return triggerId;
}

/**
 * Hapus trigger untuk fungsi tertentu
 *
 * @param {string} functionName - Nama fungsi
 */
function deleteTriggersByFunction(functionName) {
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(trigger);
      console.log(`Deleted trigger for ${functionName}`);
    }
  });

  const appState = new AppState('triggers');
  appState.remove(functionName);
}

/**
 * Hapus semua trigger yang ada
 */
function deleteAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();

  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });

  console.log(`Deleted ${triggers.length} triggers`);

  const appState = new AppState('triggers');
  appState.clear();
}

/**
 * Cek status trigger
 *
 * @param {string} functionName - Nama fungsi
 * @returns {boolean} - True jika trigger ada
 */
function hasTrigger(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  return triggers.some(trigger => trigger.getHandlerFunction() === functionName);
}

/**
 * Mendapatkan progress terbaru untuk dialog
 *
 * @returns {Object} - Data progress terbaru
 */
function getProgressUpdate() {
  const cache = CacheService.getScriptCache();
  const progressJson = cache.get('dialogProgress');

  if (!progressJson) {
    return {
      current: 0,
      total: 1,
      message: 'Memulai.. .',
      complete: false
    };
  }

  try {
    return JSON.parse(progressJson);
  } catch (e) {
    return {
      current: 0,
      total: 1,
      message: 'Error parsing progress data',
      complete: false
    };
  }
}

/**
 * Memproses satu batch (satu file PDF) dan mengembalikan status progres. 
 * Fungsi ini dirancang untuk dipanggil berulang kali dari sisi klien (dialog).
 *
 * @param {number} index - Index item yang akan diproses (berdasarkan filtered data).
 * @returns {Object} - Objek status progres. 
 */
function processPDFBatch(index) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const logger = new Logger('processPDFBatch');
  const appState = new AppState('pdfGeneration');

  const settings = getTemplateSettings();

  if (!settings.templateId || !settings.folderId) {
    logger.error('Template ID atau Folder ID tidak tersedia di settings');
    return {
      current: index,
      total: appState.get('totalItems', 0),
      message: 'Error:  Konfigurasi tidak valid.  Pastikan Template ID dan Folder ID sudah diisi.',
      complete: false,
      error: 'Konfigurasi tidak valid'
    };
  }

  let templateId, folderId, folder;

  try {
    templateId = extractFileId(settings.templateId);
    folderId = extractFileId(settings.folderId);

    if (!templateId || !folderId) {
      throw new Error('Tidak dapat mengekstrak ID dari Template atau Folder');
    }

    folder = DriveApp.getFolderById(folderId);
  } catch (e) {
    logger.error(`Error saat mengakses template atau folder: ${e.message}`);
    logToSheet(logger);
    return {
      current: index,
      total: appState.get('totalItems', 0),
      message: `Error: ${e.message}`,
      complete: false,
      error: e.message
    };
  }

  const dataRange = settings.dataRange;
  const pdfColumn = settings.pdfColumn;
  const ketJudul = settings.titleSuffix;
  const templateType = appState.get('templateType', 'slides');
  const totalItems = appState.get('totalItems', 0);

  const indexMapping = appState.get('indexMapping', []);

  if (index < 0 || index >= totalItems) {
    logger.info(`Index ${index} di luar range (total: ${totalItems}), proses selesai`);
    appState.clear();
    return {
      current: totalItems,
      total: totalItems,
      message: 'Semua file telah diproses! ',
      complete: true,
      error: null
    };
  }

  const actualRowIndex = indexMapping[index];
  if (actualRowIndex === undefined || actualRowIndex === null) {
    logger.error(`Index mapping tidak ditemukan untuk index ${index}`);
    return {
      current: index,
      total: totalItems,
      message: `Error: Index mapping tidak valid`,
      complete: false,
      error: 'Index mapping tidak valid'
    };
  }

  const actualSheetRow = 3 + actualRowIndex;

  try {
    const row = sheet.getRange(actualSheetRow, 1, 1, dataRange).getValues()[0];
    const pdfUrlCell = sheet.getRange(actualSheetRow, pdfColumn);
    const existingPdfUrl = pdfUrlCell.getValue();

    let lastPdfTitle = '';
    let wasProcessed = false;

    if (existingPdfUrl && existingPdfUrl.toString().trim() !== '') {
      lastPdfTitle = `Baris ${actualSheetRow} dilewati (sudah ada PDF)`;
      logger.info(lastPdfTitle);
    } else if (!row[0] || row[0].toString().trim() === '') {
      lastPdfTitle = `Baris ${actualSheetRow} dilewati (data kosong)`;
      logger.info(lastPdfTitle);
    } else {
      if (templateType === 'slides') {
        lastPdfTitle = generatePDFfromSlides(templateId, row, ketJudul, folder, pdfUrlCell);
      } else {
        lastPdfTitle = generatePDFfromDocs(templateId, row, ketJudul, folder, pdfUrlCell);
      }
      wasProcessed = true;
      logger.info(`Berhasil memproses baris ${actualSheetRow}:  ${lastPdfTitle}`);
    }

    if (wasProcessed) {
      const currentProcessedCount = parseInt(appState.get('processedCount', 0)) || 0;
      appState.set('processedCount', currentProcessedCount + 1);
    }

    const isComplete = (index + 1) >= totalItems;

    const progressData = {
      current: index + 1,
      total: totalItems,
      message: isComplete ? `Selesai!  ${lastPdfTitle}` : `Memproses: ${lastPdfTitle}`,
      complete: isComplete,
      error: null
    };

    try {
      CacheService.getScriptCache().put('dialogProgress', JSON.stringify(progressData), 600);
    } catch (cacheError) {
      logger.warn(`Error updating cache: ${cacheError.message}`);
    }

    if (isComplete) {
      const processedCount = appState.get('processedCount', 0);
      appState.clear();
      deleteAllTriggers();
      logger.info(`Semua proses batch selesai.  Total diproses: ${processedCount}`);

      sheet.getRange(2, 1, 1, sheet.getMaxColumns()).setBackground('#b7e1cd');
    }

    logToSheet(logger);
    return progressData;

  } catch (e) {
    logger.error(`Error pada baris ${actualSheetRow}: ${e.message}`, { stack: e.stack });
    logToSheet(logger);

    try {
      sheet.getRange(actualSheetRow, pdfColumn).setValue(`Error: ${e.message}`);
    } catch (writeError) {
      logger.error(`Gagal menulis error ke cell: ${writeError.message}`);
    }

    return {
      current: index + 1,
      total: totalItems,
      message: `Error pada baris ${actualSheetRow}: ${e.message}.  Melanjutkan... `,
      complete: (index + 1) >= totalItems,
      error: e.message,
      continueOnError: true
    };
  }
}

/**
 * Fungsi untuk mendapatkan informasi status proses saat ini
 * Berguna untuk debugging dan monitoring
 *
 * @returns {Object} - Status proses saat ini
 */
function getProcessStatus() {
  const appState = new AppState('pdfGeneration');

  return {
    templateType: appState.get('templateType', null),
    totalItems: appState.get('totalItems', 0),
    currentIndex: appState.get('currentIndex', 0),
    processedCount: appState.get('processedCount', 0),
    dialogMode: appState.get('dialogMode', false),
    lastPdfTitle: appState.get('lastPdfTitle', ''),
    hasTrigger: hasTrigger('continuePDFGeneration'),
    settings: getTemplateSettings()
  };
}

/**
 * Fungsi untuk membatalkan proses yang sedang berjalan
 */
function cancelProcess() {
  const logger = new Logger('cancelProcess');
  logger.info('Membatalkan proses yang sedang berjalan');
  deleteAllTriggers();

  const appState = new AppState('pdfGeneration');
  appState.clear();

  try {
    CacheService.getScriptCache().remove('dialogProgress');
  } catch (e) {
  }

  logger.info('Proses dibatalkan');
  logToSheet(logger);

  return { success: true, message: 'Proses dibatalkan' };
}
