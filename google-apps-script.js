/**
 * =========================================================================
 * PLASH PILATES | Google Sheet Form Webhook (Google Apps Script)
 * =========================================================================
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.new) and create a new sheet.
 * 2. Name your spreadsheet: "Plash Pilates - Trial Bookings & Leads"
 * 3. Go to: Extensions > Apps Script
 * 4. Delete any default code in 'Code.gs' and paste this ENTIRE file.
 * 5. Click the "Save" icon (Ctrl + S).
 * 6. Click "Deploy" (top right) > "New deployment".
 * 7. Select type: "Web app" (click gear icon next to 'Select type').
 *    - Description: Plash Pilates Webhook
 *    - Execute as: Me (your Google account)
 *    - Who has access: Anyone  <-- (CRITICAL: Must be "Anyone")
 * 8. Click "Deploy", authorize access with your Google account.
 * 9. Copy the generated "Web App URL" (starts with https://script.google.com/macros/s/.../exec).
 * 10. Paste the Web App URL into index.html in the GOOGLE_SCRIPT_WEB_APP_URL variable.
 * =========================================================================
 */

// Optional: Enter your email here if you want an instant email alert on every new booking!
var NOTIFICATION_EMAIL = "plashpilates@gmail.com"; // Change or leave blank ("") to disable

/**
 * Handle incoming POST requests from the website form
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for other processes to finish
  lock.tryLock(30000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Leads") || ss.getActiveSheet();
    
    // Set sheet tab name to "Leads" if it's default "Sheet1"
    if (sheet.getName() === "Sheet1") {
      sheet.setName("Leads");
    }

    // Parse incoming data (supports both JSON and form-urlencoded)
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

    // Initialize headers if sheet is empty
    if (sheet.getLastRow() === 0) {
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
      
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#5D0703"); // Plash Brand Dark Cherry
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

    // Append new lead row
    sheet.appendRow([
      timestamp,
      name,
      email,
      phone,
      age,
      discipline,
      slot,
      status,
      notes
    ]);

    var lastRow = sheet.getLastRow();
    // Style the new row for readability
    var rowRange = sheet.getRange(lastRow, 1, 1, 9);
    rowRange.setVerticalAlignment("middle");
    rowRange.setFontFamily("Outfit");
    if (lastRow % 2 === 0) {
      rowRange.setBackground("#FAF8F5"); // Subtle alternating row tint
    }
    
    // Auto-fit column widths
    for (var col = 1; col <= 9; col++) {
      sheet.autoResizeColumn(col);
    }

    // Send optional email notification to studio manager
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
          "📅 Submitted: " + timestamp + "\n\n" +
          "View all bookings in your Google Sheet: " + ss.getUrl();
        
        MailApp.sendEmail(NOTIFICATION_EMAIL, emailSubject, emailBody);
      } catch (mailErr) {
        Logger.log("Email notification error: " + mailErr);
      }
    }

    // Return success JSON
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Lead recorded successfully",
      row: lastRow
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
 * Handle GET requests to test if the web app is working
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "Plash Pilates Google Sheet Webhook is active and running perfectly!"
  })).setMimeType(ContentService.MimeType.JSON);
}
