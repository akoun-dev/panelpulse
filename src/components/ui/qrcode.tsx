"use client"

import { useEffect, useState } from 'react'
import * as QRCode from 'qrcode'
import { Copy, Download, QrCode } from 'lucide-react'
import { useToast } from './use-toast'

interface QRCodeGeneratorProps {
  panelId: string
  size?: number
  urlPrefix?: string
}

export const QRCodeGenerator = ({ panelId, size = 200, urlPrefix = 'panel/' }: QRCodeGeneratorProps) => {
  const [qrCode, setQrCode] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Utiliser l'URL publique pour le QR code
        const url = `${window.location.origin}/${urlPrefix}${panelId}`
        console.log('Génération du QR code pour l\'URL:', url)
        const code = await QRCode.toDataURL(url, {
          width: size,
          margin: 1, // Réduire les marges pour un QR code plus compact
          errorCorrectionLevel: 'M' // Niveau de correction d'erreur moyen (L, M, Q, H)
        })
        setQrCode(code)
      } catch (err) {
        console.error('QR Code generation failed:', err)
      }
    }

    generateQR()
  }, [panelId, size, urlPrefix])

  // URL publique pour le panel
  const publicUrl = `${window.location.origin}/${urlPrefix}${panelId}`;

  // Fonction pour copier l'URL dans le presse-papiers
  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl)
      .then(() => {
        // Afficher un message de confirmation avec toast
        toast({
          title: "URL copiée",
          description: "L'URL d'accès public a été copiée dans le presse-papiers",
        });
      })
      .catch(err => {
        console.error('Erreur lors de la copie de l\'URL:', err);
        toast({
          title: "Erreur",
          description: "Impossible de copier l'URL"
        });
      });
  };

  return qrCode ? (
    <div className="flex flex-col items-center gap-3 p-3 bg-muted/10 rounded-md">
      <div className="text-center mb-1 flex items-center gap-1 justify-center">
        <QrCode className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">QR Code d'accès public</h3>
      </div>

      <div className="bg-white p-2 rounded-md">
        <img
          src={qrCode}
          alt={`QR Code pour le panel ${panelId}`}
          className="max-w-full h-auto"
        />
      </div>

      <div className="flex flex-col w-full gap-2">
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={publicUrl}
            readOnly
            className="text-xs p-1 border rounded w-full bg-background"
          />
          <button
            onClick={copyToClipboard}
            className="p-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 text-xs flex items-center gap-1"
            title="Copier l'URL"
          >
            <Copy className="h-3 w-3" />
            <span className="sr-only md:not-sr-only md:inline">Copier</span>
          </button>
        </div>

        <a
          href={qrCode}
          download={`panel-${panelId}-qrcode.png`}
          className="text-xs text-center text-primary hover:underline flex items-center justify-center gap-1"
        >
          <Download className="h-3 w-3" />
          <span>Télécharger le QR Code</span>
        </a>
      </div>
    </div>
  ) : null
}
