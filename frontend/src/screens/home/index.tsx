import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import CommandBox from "@/components/ui/commandbox";
import { FaGithub } from "react-icons/fa";
import CommandBoxRun from "@/components/ui/commandboxrun";
import { Analytics } from "@vercel/analytics/react"

interface GeneratedResult {
  expression: string;
  answer: string;
}

interface Response {
  expr: string;
  result: string;
  assign: boolean;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color] = useState("rgb(255, 255, 255)");
  const [reset, setReset] = useState(false);
  const [dictOfVars, setDictOfVars] = useState({});
  const [result, setResult] = useState<GeneratedResult>();
  const [latexPosition, setLatexPosition] = useState({ x: 10, y: 200 });
  const [latexExpression, setLatexExpression] = useState<Array<string>>([]);

  const getCoordinates = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if ("touches" in event && event.touches.length > 0) {
      const touch = event.touches[0];
      const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: (event as React.MouseEvent<HTMLCanvasElement>).nativeEvent.offsetX,
        y: (event as React.MouseEvent<HTMLCanvasElement>).nativeEvent.offsetY,
      };
    }
  };

  const handleReset = useCallback(() => {
    setReset(true);
  }, []);

  const runRoute = useCallback(async () => {
    const canvas = canvasRef.current;

    if (canvas) {
      const response = await axios({
        method: "post",
        url: `${import.meta.env.VITE_API_URL}/calculate`,
        data: {
          image: canvas.toDataURL("image/png"),
          dict_of_vars: dictOfVars,
        },
      });

      const resp = await response.data;
      console.log("Response", resp);
      resp.data.forEach((data: Response) => {
        if (data.assign === true) {
          setDictOfVars({
            ...dictOfVars,
            [data.expr]: data.result,
          });
        }
      });
      const ctx = canvas.getContext("2d");
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      let minX = canvas.width,
        minY = canvas.height,
        maxX = 0,
        maxY = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          if (imageData.data[i + 3] > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      setLatexPosition({ x: centerX, y: centerY });
      resp.data.forEach((data: Response) => {
        setTimeout(() => {
          setResult({
            expression: data.expr,
            answer: data.result,
          });
        }, 1000);
      });
    }
  }, [dictOfVars]);

  const handleRun = useCallback(() => {
    runRoute();
  }, [runRoute]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        handleReset();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "j") {
        event.preventDefault();
        handleRun();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleReset, handleRun]);

  useEffect(() => {
    if (latexExpression.length > 0 && window.MathJax) {
      setTimeout(() => {
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub]);
      }, 0);
    }
  }, [latexExpression]);

  const renderLatexToCanvas = useCallback(
    (expression: string, answer: string) => {
      const latex = `\\(\\LARGE{${expression} = ${answer}}\\)`;
      setLatexExpression((prev) => [...prev, latex]);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (result) {
      renderLatexToCanvas(result.expression, result.answer);
    }
  }, [result, renderLatexToCanvas]);

  useEffect(() => {
    if (reset) {
      resetCanvas();
      setLatexExpression([]);
      setResult(undefined);
      setDictOfVars({});
      setReset(false);
    }
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.lineCap = "round";
        ctx.lineWidth = 3;
      }
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9/MathJax.js?config=TeX-MML-AM_CHTML";
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.MathJax.Hub.Config({
        tex2jax: {
          inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
          ],
        },
      });
    };

    const preventTouch = (e: TouchEvent) => {
      if (e.target === canvas) {
        e.preventDefault();
      }
    };

    if (canvas) {
      canvas.addEventListener("touchstart", preventTouch, { passive: false });
      canvas.addEventListener("touchmove", preventTouch, { passive: false });
    }

    return () => {
      document.head.removeChild(script);
      if (canvas) {
        canvas.removeEventListener("touchstart", preventTouch);
        canvas.removeEventListener("touchmove", preventTouch);
      }
    };
  }, []);

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const startDrawing = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault();
    const coordinates = getCoordinates(event);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.background = "#18181B";
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coordinates.x, coordinates.y);
        setIsDrawing(true);
      }
    }
  };

  const draw = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault();
    if (!isDrawing) return;
    const coordinates = getCoordinates(event);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = color;
        ctx.lineTo(coordinates.x, coordinates.y);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault();
    setIsDrawing(false);
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-[#FA6775] p-4 flex justify-between items-center z-50">
        <CommandBox onReset={handleReset} />
        <div className="font-sans hover:underline text-black text-2xl font-extrabold tracking-wide decoration-2 decoration-wavy decoration-yellow-200 transform hover:scale-110 transition-transform duration-300 select-none">
          NOTEZ
        </div>
        <a
          href="https://github.com/m3hu1/notez"
          target="_blank"
          rel="noopener noreferrer"
          className="text-black transform hover:scale-110 transition-transform duration-300"
        >
          <FaGithub className="h-8 w-8" />
        </a>
      </div>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden">
        <canvas
          ref={canvasRef}
          id="canvas"
          className="absolute top-0 left-0 w-full h-full bg-[#18181B]"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>
      {latexExpression &&
        latexExpression.map((latex, index) => (
          <Draggable
            key={index}
            defaultPosition={latexPosition}
            onStop={(_, data) => setLatexPosition({ x: data.x, y: data.y })}
          >
            <div className="absolute p-2 text-white rounded shadow-md">
              <div className="latex-content">{latex}</div>
            </div>
          </Draggable>
        ))}
      <CommandBoxRun onRun={handleRun} />
      <Analytics />
      </>
  );
}