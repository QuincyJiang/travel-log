import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function CollapsibleSection({
  children,
  className = "",
  description,
  id,
  index,
  meta,
  title,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const animationFrame = useRef(0);
  const panelId = `${id}-panel`;
  const titleId = `${id}-title`;

  useEffect(() => () => cancelAnimationFrame(animationFrame.current), []);

  const toggle = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (!hasOpened) {
      setHasOpened(true);
      animationFrame.current = requestAnimationFrame(() => setIsOpen(true));
      return;
    }

    setIsOpen(true);
  };

  return (
    <section className={`fold-card ${className} ${isOpen ? "is-open" : ""}`} aria-labelledby={titleId}>
      <button
        className="fold-card-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="fold-card-index">{index}</span>
        <span className="fold-card-heading">
          <span className="section-index">{meta}</span>
          <strong id={titleId}>{title}</strong>
        </span>
        <span className="fold-card-description">{description}</span>
        <span className="fold-card-action">
          <span>{isOpen ? "收起" : "展开"}</span>
          <ChevronDown size={18} strokeWidth={1.8} aria-hidden="true" />
        </span>
      </button>

      <div
        className="fold-card-panel"
        id={panelId}
        aria-hidden={!isOpen}
        inert={isOpen ? undefined : ""}
      >
        <div className="fold-card-panel-inner">{hasOpened ? children : null}</div>
      </div>
    </section>
  );
}
