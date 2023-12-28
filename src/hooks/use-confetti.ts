import { Confetti } from "@/types";
import confetti from "canvas-confetti";
import { nanoid } from "nanoid";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface Props {
  onLaunch: (ctx: Confetti) => void;
  confetti?: Record<string, Confetti>;
  enabled?: boolean;
}

export default function useConfetti(props: Props) {
  const [, setIsLaunching] = useState(false);

  const renderedConfetti = useRef<string[]>([]);

  const confettiIds = Object.keys(props.confetti ?? {}).join(",");

  useHotkeys(
    "a",
    () => {
      setIsLaunching((l) => {
        if (!l) initDraw();
        return true;
      });
    },
    { keydown: true, keyup: false },
  );

  useHotkeys(
    "esc",
    () => {
      setIsLaunching(false);
      document.querySelector("#cnvTest")?.remove();
    },
    { keydown: true, keyup: false },
  );

  useEffect(() => {
    if (!props.confetti) return;

    const confettiIds = Object.keys(props.confetti);

    for (const id of confettiIds) {
      const { current } = renderedConfetti;
      if (current.includes(id)) continue;

      renderedConfetti.current = [...current, id].slice(-25);

      const confettiData = props.confetti[id];

      if (props.enabled)
        confetti({
          angle: 180 - confettiData.angle,
          spread: 45,
          origin: confettiData.position,
          startVelocity: confettiData.velocity,
        });
    }
  }, [confettiIds, props.confetti]);

  function initDraw() {
    const canvas = document.createElement("canvas");
    canvas.id = "cnvTest";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.cursor = "none";
    document.body.appendChild(canvas);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "9001";
    const ctx = canvas.getContext("2d")!;
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    const startPoint = { x: 0, y: 0 };
    const endPoint = { x: 0, y: 0 };
    let mouseDown = false;

    canvas.addEventListener(
      "mousemove",
      (e) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🎉", e.clientX, e.clientY);

        if (!mouseDown) return;

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.fillStyle = "transparent";
        ctx.fill();
        ctx.arc(startPoint.x, startPoint.y, 25, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.fillStyle = "white";
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();

        endPoint.x = e.clientX;
        endPoint.y = e.clientY;
      },
      false,
    );
    canvas.addEventListener(
      "mousedown",
      (event) => {
        startPoint.x = event.clientX;
        startPoint.y = event.clientY;
        mouseDown = true;
      },
      false,
    );
    canvas.addEventListener(
      "mouseup",
      () => {
        mouseDown = false;

        const normalizedOrigin = {
          x: startPoint.x / window.innerWidth,
          y: startPoint.y / window.innerHeight,
        };

        const angle =
          (Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x) *
            180) /
          Math.PI;

        props.onLaunch({
          angle,
          velocity:
            Math.sqrt(
              (endPoint.x - startPoint.x) ** 2 +
                (endPoint.y - startPoint.y) ** 2,
            ) / 10,
          position: normalizedOrigin,
          id: nanoid(),
        });
      },
      false,
    );
  }
}
