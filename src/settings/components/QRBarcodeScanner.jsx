import React, { useRef, useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import Webcam from "react-webcam";
import { Button } from "@mui/material";

const QRBarcodeScanner = ({ onScanComplete, resetQrCode }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [detectedBarcode, setDetectedBarcode] = useState(null);

  let codeReader;
  let scanInterval;
  // Function to handle the barcode scanning process
  const handleScan = async () => {
    codeReader = new BrowserMultiFormatReader();

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const scanInterval = setInterval(async () => {
        const video = webcamRef.current?.video;

        if (!video || !canvas) return;

        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        const captureWidth = 200; // Reduced width for scanning
        const captureHeight = 200; // Reduced height for scanning
        const x = (videoWidth - captureWidth) / 2; // Center horizontally
        const y = (videoHeight - captureHeight) / 2; // Center vertically

        // Draw the cropped region on the canvas
        ctx.drawImage(
          video,
          x,
          y,
          captureWidth,
          captureHeight,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Create an image element from the canvas
        const image = new Image();
        image.src = canvas.toDataURL("image/png");

        // Wait for the image to load
        image.onload = async () => {
          try {
            const result = await codeReader.decodeFromImageElement(image);
            if (result) {
              clearInterval(scanInterval); // Stop scanning loop
              setDetectedBarcode(result.getText());
              onScanComplete(result.getText());
            }
          } catch (err) {
            // Handle decoding errors
            console.warn("Decode error:", err.message);
          }
        };
      }, 100); // Scan every 100ms
    } catch (error) {
      console.error("Error during scan:", error);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    handleScan();
    return () => {
      if (codeReader) {
        codeReader.reset();
      }
      if (scanInterval) {
        clearInterval(scanInterval);
      }
    };
  }, []);

  const videoConstraints = {
    facingMode: "environment",
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
      <div style={{ position: "relative" }}>
        <Webcam
          ref={webcamRef}
          videoConstraints={videoConstraints}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
          }}
        />
        {/* Visual Scanning Area */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "200px",
            height: "200px",
            border: "2px solid red",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}
        >
          <canvas
            ref={canvasRef}
            // style={{ display: "none" }}
            width={200}
            height={200}
          />
        </div>
      </div>
      {detectedBarcode ? (
        <div style={{ marginTop: "10px" }}>
          <h3>Scanned Barcode: {detectedBarcode}</h3>
          <Button
            type="button"
            color="primary"
            variant="text"
            onClick={() => {
              setDetectedBarcode(null);
              resetQrCode();
              handleScan();
            }}
          >
            Re Scan
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default QRBarcodeScanner;
