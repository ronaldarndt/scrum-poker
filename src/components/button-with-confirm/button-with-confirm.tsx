import clsx from "clsx";
import { ForwardedRef, forwardRef, useRef, useState } from "react";
import { mergeRefs } from "react-merge-refs";
import { useOnClickOutside } from "usehooks-ts";

interface Props {
  text: string;
  confirmText: string;
  confirmClass?: string;
  onConfirm: () => unknown;
  className?: string;
}

function ButtonWithConfirm(props: Props, ref: ForwardedRef<HTMLButtonElement>) {
  const [clickedOnce, setClickedOnce] = useState(false);

  const localRef = useRef<HTMLButtonElement>(null);

  useOnClickOutside(localRef, () => {
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
      ref={mergeRefs([localRef, ref])}
      className={clsx(props.className, clickedOnce && props.confirmClass)}
    >
      {clickedOnce ? props.confirmText : props.text}
    </button>
  );
}

export default forwardRef(ButtonWithConfirm);
