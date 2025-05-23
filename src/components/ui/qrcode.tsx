"use client"

import { useEffect, useState } from 'react'
import * as QRCode from 'qrcode'

interface QRCodeGeneratorProps {
  panelId: string
  size?: number
}

export const QRCodeGenerator = ({ panelId, size = 200 }: QRCodeGeneratorProps) => {
  const [qrCode, setQrCode] = useState('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = `${window.location.origin}/panel/${panelId}`
        const code = await QRCode.toDataURL(url, { width: size })
        setQrCode(code)
      } catch (err) {
        console.error('QR Code generation failed:', err)
      }
    }

    generateQR()
  }, [panelId, size])

  return qrCode ? (
    <div className="flex flex-col items-center gap-2">
      <img src={qrCode} alt={`QR Code for Panel ${panelId}`} />
      <a 
        href={qrCode} 
        download={`panel-${panelId}-qrcode.png`}
        className="text-sm text-blue-600 hover:underline"
      >
        Télécharger QR Code
      </a>
    </div>
  ) : null
}
