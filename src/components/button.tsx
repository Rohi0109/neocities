
type ButtonProps = {
  title: string;
  color?: string;
  onClick?: () => void;
};

export function Button({
  title,
  color = "#841584",
  onClick = () => {},
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{ color }}
    >
      {title}
    </button>
  );
}
