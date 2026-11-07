import { formatPrice } from 'host/ui';

export function PriceTag({ cents }) {
    return <span className="font-semibold">{formatPrice(cents)}</span>;
}
