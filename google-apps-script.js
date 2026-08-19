/**
 * =========================================================================
 * PLASH PILATES | Google Sheet Form Webhook (Google Apps Script) - v2.0
 * =========================================================================
 * 
 * FIXES IN THIS VERSION:
 * 1. Fixed "Blank Sheet" issue: Directly scans from Row 1 so data is never
 *    accidentally written at row 1001 below Google Sheet's empty default rows.
 * 2. Writes to the 1st sheet tab (ss.getSheets()[0]) so tab names never conflict.
 * 3. Uses SpreadsheetApp.flush() to instantly force Google Sheets to display the new row.
 * 4. Includes spreadsheet link in email notification so you can open the exact sheet.
 * =========================================================================
 */

// Optional: Studio notification email
var NOTIFICATION_EMAIL = "plashpilates@gmail.com"; 

// Optional: If this script is standalone (not bound to the sheet), paste your Google Sheet URL here.
// If you opened Apps Script via Extensions > Apps Script inside the sheet, leave this as "".
var SPREADSHEET_URL = ""; 

/**
 * Handle incoming POST requests from the website form
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var ss;
    if (SPREADSHEET_URL && SPREADSHEET_URL.trim() !== "") {
      ss = SpreadsheetApp.openByUrl(SPREADSHEET_URL.trim());
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!ss) {
      throw new Error("Could not find the Google Spreadsheet. Please ensure the script is attached to the sheet (Extensions > Apps Script) or set SPREADSHEET_URL.");
    }

    // Always use the first sheet tab
    var sheet = ss.getSheets()[0];

    // Parse incoming data
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var headers = [
      "Timestamp (IST)",
      "Full Name",
      "Email Address",
      "Phone / WhatsApp",
      "Age",
      "Preferred Discipline",
      "Preferred Slot",
      "Status",
      "Notes"
    ];

    // Check if Row 1 has headers; if not, create them
    var row1Values = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    var hasHeader = row1Values[0] && row1Values[0].toString().trim() !== "";

    if (!hasHeader) {
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#2E1019"); // Plash Brand Espresso Maroon
      headerRange.setFontColor("#FFFFFF");
      headerRange.setHorizontalAlignment("center");
      headerRange.setVerticalAlignment("middle");
      sheet.setRowHeight(1, 38);
      sheet.setFrozenRows(1);
    }

    // Extract fields
    var now = new Date();
    var timestamp = data.timestamp || Utilities.formatDate(now, "Asia/Kolkata", "dd/MM/yyyy, hh:mm:ss a");
    var name = data.name || "N/A";
    var email = data.email || "N/A";
    var phone = data.phone || "N/A";
    var age = data.age || "N/A";
    var discipline = data.discipline || "N/A";
    var slot = data.slot || "N/A";
    var status = "New Lead";
    var notes = "";

    var newRow = [
      timestamp,
      name,
      email,
      phone,
      age,
      discipline,
      slot,
      status,
      notes
    ];

    // Find the exact next empty row by inspecting column A values
    var colA = sheet.getRange("A:A").getValues();
    var targetRow = 2; // Start searching from row 2 (after header)
    for (var i = 1; i < colA.length; i++) {
      if (colA[i][0] === "" || colA[i][0] === null || colA[i][0] === undefined) {
        targetRow = i + 1;
        break;
      }
      targetRow = i + 2;
    }

    // Write the new row directly into targetRow
    var targetRange = sheet.getRange(targetRow, 1, 1, newRow.length);
    targetRange.setValues([newRow]);
    targetRange.setVerticalAlignment("middle");
    targetRange.setFontFamily("Outfit");
    if (targetRow % 2 === 0) {
      targetRange.setBackground("#FAF8F5"); // Alternating row color
    }

    // Auto-fit columns
    for (var c = 1; c <= headers.length; c++) {
      sheet.autoResizeColumn(c);
    }

    // Force Google Sheet to commit changes immediately
    SpreadsheetApp.flush();

    // Send instant email notification
    if (NOTIFICATION_EMAIL && NOTIFICATION_EMAIL.indexOf("@") !== -1) {
      try {
        var emailSubject = "🧘 New Trial Class Booking: " + name + " (" + discipline + ")";
        var emailBody = "✨ New Trial Reservation Received for Plash Pilates!\n\n" +
          "👤 Name: " + name + "\n" +
          "📧 Email: " + email + "\n" +
          "📱 Phone: " + phone + "\n" +
          "🎂 Age: " + age + "\n" +
          "🎯 Discipline: " + discipline + "\n" +
          "⏰ Preferred Slot: " + slot + "\n" +
          "📅 Submitted: " + timestamp + "\n" +
          "📍 Saved in Row: " + targetRow + "\n\n" +
          "👉 Click here to view your Google Sheet: " + ss.getUrl();
        
        MailApp.sendEmail(NOTIFICATION_EMAIL, emailSubject, emailBody);
      } catch (mailErr) {
        Logger.log("Email error: " + mailErr);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded successfully",
      row: targetRow
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Handle GET requests to test if webhook is alive
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Plash Pilates Google Sheet Webhook is active and running!"
  })).setMimeType(ContentService.MimeType.JSON);
}