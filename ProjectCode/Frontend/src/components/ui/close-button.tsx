import { CloseIcon } from "@/assets/icons/close_icon";
import { Link, useNavigate } from "react-router-dom";

type CloseButtonProps =
  | { to: string; label?: string }
  | { back: true; label?: string };

export default function CloseButton(props: CloseButtonProps) {
  const navigate = useNavigate();
  const label = props.label ?? "Close";

  if ("back" in props) {
    return (
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label={label}
        className="
          absolute top-4 right-4 md:top-8 md:right-8
          p-1 rounded-full bg-lightgrey
          flex items-center justify-center
          hover:bg-greyhover transition
        "
      >
        <CloseIcon className="h-6 w-6" aria-hidden="true" />
      </button>
    );
  }

  return (
    <Link
      to={props.to}
      aria-label={label}
      className="
        absolute top-4 right-4 md:top-8 md:right-8
        p-1 rounded-full bg-lightgrey
        flex items-center justify-center
        hover:bg-darkgrey transition
      "
    >
      <CloseIcon className="h-6 w-6" aria-hidden="true" />
    </Link>
  );
}
