const PDFDocument = require("pdfkit");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const path = require("path");
const Order = require("../models/Order");

const InvoiceService = {
  
  generateAndUploadInvoice: async (order) => {
    try {
      const invoicesDir = path.join(__dirname, "..", "invoices");
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const filePath = path.join(invoicesDir, `invoice_${order._id}.pdf`);
 
      const populatedOrder = await Order.findById(order._id).populate({
        path: "items.product",
        select: "name",
      });

      await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40, size: "A4" });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header Section
        doc
          .font("Helvetica-Bold")
          .fontSize(20)
          .text("TAX INVOICE", { align: "center" });
        doc.moveDown(1);
        doc
          .fontSize(12)
          .text(`Invoice No: ${order.invoiceNo}`, { align: "left" });
        doc.text(
          `Invoice Date: ${order.createdAt.toString().split("GMT")[0].trim()}`,
          { align: "left" }
        );

        doc.text(`Order ID: ${order.orderId}`, { align: "left" });
        doc.moveDown(1);

        // Seller Details
        doc.font("Helvetica-Bold").text("Sold By:");
        doc.font("Helvetica").text("Fritha Cosmetic");
        doc.text("Nawada, Delhi");
        doc.text("GSTIN: ABC12345");
        doc.moveDown(1);

        // Set page width for positioning
        const pageWidths = doc.page.width;
        const margin = 50;
        const columnGap = 20;
        const columnWidth = (pageWidths - margin * 2 - columnGap) / 2;

        // Billing Details (Left Column)
        let yPosition = doc.y;
        doc.font("Helvetica-Bold").text("Billing Address:", margin, yPosition);
        doc
          .font("Helvetica")
          .text(
            `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
            margin
          );
        doc.text(order.billingAddress.address, margin);
        doc.text(
          `${order.billingAddress.city}, ${order.billingAddress.state} - ${order.billingAddress.zip}`,
          margin
        );
        doc.text(`Phone: ${order.billingAddress.phoneNumber}`, margin);

        // Shipping Details (Right Column)
        doc.y = yPosition; // Reset Y position to align with billing address
        doc
          .font("Helvetica-Bold")
          .text(
            "Shipping Address:",
            margin + columnWidth + columnGap,
            yPosition
          );
        doc
          .font("Helvetica")
          .text(
            `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            margin + columnWidth + columnGap
          );
        doc.text(
          order.shippingAddress.address,
          margin + columnWidth + columnGap
        );
        doc.text(
          `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}`,
          margin + columnWidth + columnGap
        );
        doc.text(
          `Phone: ${order.shippingAddress.phoneNumber}`,
          margin + columnWidth + columnGap
        );

        doc.moveDown(2); 

        

        const colWidths = [130, 50, 80, 80, 90, 80, 90];

        const drawText = (text, x, width, align = "left") => {
          if (typeof doc.text === "function") {
            doc.text(text, x, doc.y, { width, align });
          }
        };
        // Set table headers
        doc.font("Helvetica-Bold");

        const headers = [
          "Product",
          "Qty",
          "MRP",
          "Discount",
          "Taxable Value",
          "IGST(12%)",
          "Total",
        ];

        const alignments = [
          "left",
          "center",
          "right",
          "right",
          "right",
          "right",
          "right",
        ]; // Alignment for each column

        let startX = 50; // Initial X position
        let startY = doc.y;

        headers.forEach((header, index) => {
          doc.text(header, startX, startY, {
            width: colWidths[index],
            align: alignments[index],
          });
          startX += colWidths[index]; // Move to the next column
        });

        doc.moveDown(0.5);
        doc
          .moveTo(50, doc.y)
          .lineTo(50 + colWidths.reduce((a, b) => a + b), doc.y)
          .stroke();
        startY = doc.y + 5;

        // Reset font for table values
        doc.font("Helvetica").fontSize(10);

        // Loop through order items
        order.items.forEach((item) => {
          if (doc.y > 720) {
            doc.addPage();
            startY = doc.y;
          }

          // Populate the product details
          populatedOrder.items.forEach((item) => {
            const productName =
              item.product && item.product.name ? item.product.name : "N/A";

            let x = 50;

            const igst = item.mrp * 0.12;
            const taxableValue = item.mrp - igst;

            const rowValues = [
              productName,
              item.quantity.toString(),
              `₹${item.mrp.toFixed(2)}`,
              `₹${item.discount.toFixed(2)}`,
              `₹${taxableValue.toFixed(2)}`,

              `₹${igst.toFixed(2)}`,

              `₹${(taxableValue + igst).toFixed(2)}`,
            ];

            rowValues.forEach((value, index) => {
              doc.text(value, x, startY, {
                width: colWidths[index],
                align: alignments[index],
              });
              x += colWidths[index]; // Move to the next column
            });
            
            const lineY = doc.y + 35; 
            doc
              .moveTo(50, lineY)
              .lineTo(50 + colWidths.reduce((a, b) => a + b), lineY)
              .strokeColor("#CCCCCC") 
              .lineWidth(0.5) 
              .stroke();

            doc.moveDown(4);
            startY = doc.y;
          });
        });

        // Draw Bottom Border
        doc
          .moveTo(50, doc.y)
          .lineTo(50 + colWidths.reduce((a, b) => a + b), doc.y)
          .stroke();
        doc.moveDown(8);

        const pageWidth = doc.page.width - 80; // Adjust width for margins
        const yOffset = -30;

        // Total Quantity, Price, and Payment Status
        doc.font("Helvetica-Bold").text(
          `Total Quantity: ${order.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          )}`,
          40,  
          doc.y+ yOffset, // Y position (continue from the last text)
          { width: pageWidth, align: "left" }
        );

        doc.text(`Total Price: ₹${order.totalAmount.toFixed(2)}`, 40, doc.y+ yOffset, {
          width: pageWidth,
          align: "left",
        });

        doc.text(`Payment Status: ${order.paymentStatus}`, 40, doc.y+ yOffset, {
          width: pageWidth,
          align: "left",
        });
        doc.moveDown(0);

        // Thank You Message Centered
        doc.font("Helvetica").text("Thank you for your purchase!", {
          align: "center",
          width: pageWidth,
        });

        // Logo Placement (Move Left if Needed)
        const imagePath = path.join(__dirname, "..", "assets", "FRITHA.png");
        doc.image(imagePath, doc.page.width - 160, doc.page.height - 100, {
          width: 120,
          height: 50,
        });

        // Signature Text (Move Left to Fit)
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(
            "Ordered Through FRITHA COSMATIC PRIVATE LIMITED",
            doc.page.width - 160,
            doc.page.height - 260,
            { width: 150, align: "left" } // Limit width and align left
          );

        // Add the signature image at the top
        const imagePath2 = path.join(
          __dirname,
          "..",
          "assets",
          "new Signature.png"
        );
        doc.image(imagePath2, doc.page.width - 160, doc.page.height - 180, {
          width: 150,
          height: 50,
        });

        // Add the text below the image
        doc.text(
          "Authorized Signature",
          doc.page.width - 160,
          doc.page.height - 130, // Adjusted for better placement
          {
            width: 150,
            align: "left",
          }
        );

        // End the document
        doc.end();

        // Handle stream events
        stream.on("finish", resolve);
        stream.on("error", reject);
      });

      // Upload to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(filePath, {
        folder: "invoices",
        resource_type: "auto",
        access_mode: "public",
      });

      fs.unlinkSync(filePath); // Remove local file after upload
      return uploadResponse.secure_url;
    } catch (error) {
      console.error("Error generating invoice:", error.message);
      throw new Error("Failed to generate invoice.");
    }
  },
};

module.exports = InvoiceService;
