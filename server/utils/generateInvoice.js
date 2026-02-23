const PDFDocument = require("pdfkit");

const generateInvoice = (res, payment, lead) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${payment._id}.pdf`
  );

  doc.pipe(res);

  // Company Info
  doc
    .fontSize(20)
    .text("Travel CRM Pvt Ltd", { align: "center" })
    .moveDown();

  doc.fontSize(12).text("Email: support@travelcrm.com");
  doc.text("Phone: +91 9876543210");
  doc.moveDown();

  doc.fontSize(16).text("INVOICE", { align: "center" });
  doc.moveDown();

  // Invoice Details
  doc.fontSize(12);
  doc.text(`Invoice ID: ${payment._id}`);
  doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  // Customer Info
  doc.text("Bill To:");
  doc.text(`Name: ${lead.name}`);
  doc.text(`Email: ${lead.email}`);
  doc.text(`Phone: ${lead.phone}`);
  doc.moveDown();

  // Payment Details
  doc.text("Payment Details:");
  doc.text(`Amount Paid: ₹${payment.amount}`);
  doc.text(`Payment Method: ${payment.method}`);
  doc.text(`Status: ${payment.status}`);
  doc.moveDown();

  doc.text("Thank you for your business!", { align: "center" });

  doc.end();
};

module.exports = generateInvoice;