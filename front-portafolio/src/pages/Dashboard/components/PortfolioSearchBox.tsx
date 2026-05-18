interface PortfolioSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PortfolioSearchBox({ value, onChange }: PortfolioSearchBoxProps) {
  return (
    <label className="feed-search">
      <span className="sr-only">Buscar portafolios</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por nombre o profesion"
      />
    </label>
  );
}
