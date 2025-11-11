import { useRef, useState, useEffect } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  isAnalyzing: boolean;
}

export const CameraCapture = ({ onCapture, isAnalyzing }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setIsLoadingCamera(true);
    try {
      // First check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Seu navegador não suporta acesso à câmera. Use o upload de imagem.");
        setIsLoadingCamera(false);
        return;
      }

      console.log("Solicitando acesso à câmera...");
      toast.info("Solicitando acesso à câmera...");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      
      console.log("Câmera acessada com sucesso!");
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsCameraActive(true);
        toast.success("Câmera ativada!");
      }
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      
      if (error.name === "NotReadableError") {
        toast.error("Câmera em uso por outro aplicativo. Feche outros apps que usam a câmera ou use o upload de imagem.");
      } else if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        toast.error("Permissão negada. Permita o acesso à câmera nas configurações do navegador ou use o upload de imagem.");
      } else if (error.name === "NotFoundError") {
        toast.error("Nenhuma câmera encontrada. Use o upload de imagem.");
      } else {
        toast.error("Erro ao acessar a câmera. Tente o upload de imagem.");
      }
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    onCapture(imageData);

    // Stop camera after capture
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraActive(false);
      setStream(null);
    }
  };

  return (
    <Card className="overflow-hidden shadow-soft border-primary/20">
      <div className="relative aspect-video bg-muted">
        {!isCameraActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <Button
              onClick={startCamera}
              disabled={isAnalyzing || isLoadingCamera}
              size="lg"
              className="bg-gradient-primary shadow-glow hover:scale-105 transition-transform"
            >
              {isLoadingCamera ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Abrindo câmera...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-5 w-5" />
                  Ativar Câmera
                </>
              )}
            </Button>
            
            <div className="text-muted-foreground text-sm">ou</div>
            
            <label htmlFor="file-upload">
              <Button
                disabled={isAnalyzing || isLoadingCamera}
                size="lg"
                variant="secondary"
                className="cursor-pointer"
                asChild
              >
                <div>
                  <Upload className="mr-2 h-5 w-5" />
                  Enviar Foto
                </div>
              </Button>
            </label>
            <Input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isAnalyzing}
              className="hidden"
            />
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button
                onClick={capturePhoto}
                disabled={isAnalyzing}
                size="lg"
                className="bg-gradient-accent shadow-glow hover:scale-105 transition-transform"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-5 w-5" />
                    Capturar Foto
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
};
