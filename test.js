const fs = require("fs");
const axios = require("axios");
const PDFDocument = require("pdfkit");

// Data for the table
const tableData = [
  {
    photo: "https://fakeimg.pl/350x200/ff0000/000",
    name: "Product 1",
    price: 10,
    quantity: 2,
    total: 20,
  },
  {
    photo: "https://fakeimg.pl/350x200/ff0000/000",
    name: "Product 2",
    price: 15,
    quantity: 1,
    total: 15,
  },
  {
    photo: "https://fakeimg.pl/350x200/ff0000/000",
    name: "Product 3",
    price: 8,
    quantity: 5,
    total: 40,
  },
];

// Function to fetch image as a buffer
const fetchImageBuffer = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
};

const createPDF = async () => {
  const doc = new PDFDocument();

  // Save the PDF to a file
  doc.pipe(fs.createWriteStream("table.pdf"));

  // Add title
  doc.fontSize(16).text("Product Table", { align: "center" });
  doc.moveDown();

  // Define table headers
  const headers = ["Photo", "Name", "Price", "Quantity", "Total"];
  const startX = 50;
  const startY = 100;
  const columnWidths = [100, 150, 100, 100, 100];

  // Draw headers
  let currentY = startY;
  headers.forEach((header, index) => {
    doc.text(
      header,
      startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0),
      currentY,
      {
        width: columnWidths[index],
        align: "center",
      }
    );
  });

  currentY += 30;

  // Draw table rows
  for (const row of tableData) {
    // Fetch image buffer
    const imageBuffer = await fetchImageBuffer(row.photo);

    // Add photo
    const imageX = startX;
    const imageY = currentY;
    const imageWidth = columnWidths[0];
    const imageHeight = 30;

    doc.image(imageBuffer, imageX, imageY, {
      width: imageWidth,
      height: imageHeight,
    });

    // Add other fields
    doc.text(row.name, startX + columnWidths[0], currentY, {
      width: columnWidths[1],
      align: "left",
    });
    doc.text(
      `$${row.price}`,
      startX + columnWidths[0] + columnWidths[1],
      currentY,
      {
        width: columnWidths[2],
        align: "center",
      }
    );
    doc.text(
      row.quantity,
      startX + columnWidths[0] + columnWidths[1] + columnWidths[2],
      currentY,
      {
        width: columnWidths[3],
        align: "center",
      }
    );
    doc.text(
      `$${row.total}`,
      startX +
        columnWidths[0] +
        columnWidths[1] +
        columnWidths[2] +
        columnWidths[3],
      currentY,
      {
        width: columnWidths[4],
        align: "center",
      }
    );

    currentY += 50; // Move to the next row
  }

  // Finalize the document
  doc.end();
};

createPDF().catch((err) => {
  console.error("Error creating PDF:", err);
});
