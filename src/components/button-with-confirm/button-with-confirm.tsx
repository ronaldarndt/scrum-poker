import clsx from "clsx";
import { useRef, useState, type RefObject } from "react";
import { mergeRefs } from "react-merge-refs";
import { useOnClickOutside } from "usehooks-ts";

interface Props {
  text: string;
  confirmText: string;
  confirmClass?: string;
  onConfirm: () => unknown;
  className?: string;
  ref?: RefObject<HTMLButtonElement>;
}

export default function ButtonWithConfirm(props: Props) {
  const [clickedOnce, setClickedOnce] = useState(false);

  const localRef = useRef<HTMLButtonElement>(null);

  useOnClickOutside(localRef as RefObject<HTMLButtonElement>, () => {
    setClickedOnce(false);
  });

  function handleClick() {
    setClickedOnce((c) => !c);

    if (clickedOnce) {
      props.onConfirm();
    }
  }

  return (
    <button
      onClick={handleClick}
      ref={mergeRefs([localRef, props.ref])}
      className={clsx(props.className, clickedOnce && props.confirmClass)}
    >
      {clickedOnce ? props.confirmText : props.text}
    </button>
  );
}
