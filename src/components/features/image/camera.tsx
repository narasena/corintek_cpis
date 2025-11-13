import { Button } from '@/components/ui/button';
import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'environment',
};

export default function WebcamCapture() {
  const webcamRef = useRef<Webcam | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    setImgSrc(imageSrc as string);
  }, [webcamRef, setImgSrc]);

  return (
    <>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        minScreenshotWidth={180}
        minScreenshotHeight={180}
      />
      <Button onClick={capture}>Capture Photo</Button>
      {imgSrc && <img src={imgSrc} alt="img" />}
    </>
  );
}
