import clsx from "clsx";
import { useRef, useState, type RefObject } from "react";
import { LuPencil } from "react-icons/lu";
import { mergeRefs } from "react-merge-refs";

interface WrapperProps {
  children: React.ReactNode;
  onDoubleClick: (event: React.MouseEvent<HTMLInputElement>) => unknown;
  onClick: (event: React.MouseEvent<HTMLInputElement>) => unknown;
  onMouseDown: (event: React.MouseEvent<HTMLInputElement>) => unknown;
  className?: string;
  ref?: RefObject<HTMLDivElement>;
}

interface Props {
  className?: string;
  value: string;
  onChange: (value: string) => unknown;
  wrapper: (props: WrapperProps) => React.ReactNode;
  ref?: RefObject<HTMLInputElement>;
}

export default function EditableText(props: Props) {
  const [editing, setEditing] = useState(false);

  const localRef = useRef<HTMLInputElement>(null);

  function handleChange(value: string) {
    props.onChange(value);
    setEditing(false);
  }

  function handleDefaultEvent(e: React.MouseEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  return editing ? (
    <input
      defaultValue={props.value}
      className={props.className}
      onBlur={(e) => handleChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleChange(e.currentTarget.value);
        }
      }}
      ref={mergeRefs([props.ref, localRef])}
    />
  ) : (
    <props.wrapper
      onClick={(e) => handleDefaultEvent(e)}
      onMouseDown={(e) => handleDefaultEvent(e)}
      onDoubleClick={(e) => {
        handleDefaultEvent(e);
        setEditing(true);

        setTimeout(() => {
          localRef?.current?.focus();
          localRef.current?.select();
        }, 0);
        return false;
      }}
      className={clsx(props.className, "flex flex-row items-center gap-1")}
      ref={props.ref}
    >
      {props.value}
      <LuPencil />
    </props.wrapper>
  );
}
