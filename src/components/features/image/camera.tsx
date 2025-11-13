import { Button } from '@/components/ui/button';
import { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { SwitchCamera } from 'lucide-react';

export default function WebcamCapture() {
  const webcamRef = useRef<Webcam | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    ...(deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: { ideal: 'environment' } }),
  };

  useEffect(() => {
    // Check if camera is available
    const checkCamera = async () => {
      try {
        // First request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        // Immediately stop the stream since we just want permission
        stream.getTracks().forEach(track => track.stop());

        // Now enumerate the devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          device => device.kind === 'videoinput'
        );

        setDevices(videoDevices);

        if (videoDevices.length === 0) {
          setHasCamera(false);
          setCameraError(
            'No camera found. Please connect a camera and try again.'
          );
        } else {
          // Set first device as default
          setDeviceId(videoDevices[0]?.deviceId || '');
        }
      } catch (error: unknown) {
        console.error('Camera access error:', error);
        setHasCamera(false);
        setCameraError(
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as { message: string }).message
            : 'Camera access denied. Please enable camera permissions in your browser settings.'
        );
      }
    };

    checkCamera();
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      // Create a canvas to crop the image to 1:1 ratio
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate the center crop area (1:1 ratio)
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        canvas.width = size;
        canvas.height = size;

        // Draw the cropped image
        ctx?.drawImage(img, x, y, size, size, 0, 0, size, size);

        // Convert canvas to data URL
        const croppedImageSrc = canvas.toDataURL('image/jpeg', 0.8);
        setImgSrc(croppedImageSrc);
      };

      img.src = imageSrc;
    }
  }, [webcamRef, setImgSrc]);

  const retake = () => {
    setImgSrc(null);
  };

  const handleUserMedia = () => {
    setCameraError(null);
  };

  const handleUserMediaError = (error: string | DOMException) => {
    console.error('Camera error:', error);
    const errorMessage = typeof error === 'string' ? error : error.message;
    setCameraError(`Camera access denied or unavailable: ${errorMessage}`);
  };

  if (!hasCamera) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">📷</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Camera Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            No camera device was detected on your device. Please connect a
            camera and refresh the page.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Full screen webcam */}
      <div className="absolute inset-0">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover"
          mirrored={false}
          onUserMedia={handleUserMedia}
          onUserMediaError={handleUserMediaError}
          style={{ visibility: cameraError ? 'hidden' : 'visible' }}
        />
      </div>

      {/* Camera error overlay */}
      {cameraError && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 text-white">
          <div className="text-center max-w-md">
            <div className="mb-4 text-4xl">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Camera Error</h2>
            <p className="text-sm opacity-80 mb-4">{cameraError}</p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Retry Camera Access
              </Button>
              <Button
                onClick={() => setCameraError(null)}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-black"
              >
                Continue Without Camera
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dimmed overlay with clear center area */}
      {!imgSrc && !cameraError && (
        <div className="absolute inset-0">
          {/* Create a container for the overlay layout */}
          <div className="relative w-full h-full">
            {/* Top overlay */}
            <div className="absolute top-0 left-0 right-0 bg-black/60">
              <div className="p-8 text-center">
                <p className="text-2xl font-medium text-white mb-2">
                  Position document in the frame
                </p>
                <p className="text-lg text-white opacity-80">
                  Only the center square area will be captured
                </p>
              </div>
            </div>

            {/* Centered clear square with shadow overlay */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                        border-4 border-white rounded-lg bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] z-10"
              style={{
                width: 'min(80vw, 400px)',
                height: 'min(80vw, 400px)',
              }}
            >
              {/* Corner indicators */}
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
            </div>

            {/* Bottom overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 flex items-center justify-center p-8">
              <div className="flex items-center gap-4 absolute left-4">
                {devices.length > 1 && (
                  <Button
                    onClick={() => {
                      const currentIndex = devices.findIndex(
                        d => d.deviceId === deviceId
                      );
                      const nextIndex = (currentIndex + 1) % devices.length;
                      setDeviceId(devices[nextIndex].deviceId);
                    }}
                    variant="ghost"
                    className="text-white"
                  >
                    <SwitchCamera className="w-6 h-6" />
                  </Button>
                )}
              </div>
              <Button
                onClick={capture}
                className="w-20 h-20 rounded-full bg-white text-black hover:bg-gray-200 border-4 border-gray-300"
              >
                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-400"></div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Captured image preview */}
      {imgSrc && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-4">
          <div className="relative max-w-sm max-h-96 mb-4">
            <img
              src={imgSrc}
              alt="Captured"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex gap-4">
            <Button
              onClick={retake}
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Retake
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">Use Photo</Button>
          </div>
        </div>
      )}
    </div>
  );
}
