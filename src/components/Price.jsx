import { splitPrice } from "../lib/format";

// The currency sign is set smaller and lighter so the amount reads first.
export default function Price({ value, currency, large = false }) {
  const { symbol, amount } = splitPrice(value, currency);
  return (
    <span className={`price${large ? " price-large" : ""}`}>
      <span className="price-symbol">{symbol}</span>
      {amount}
    </span>
  );
}
