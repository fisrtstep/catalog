import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Card,
    EmptyState,
    Input,
    PageHeader,
    Price,
    Spinner,
    toast,
    useCart,
} from 'host/ui';

const API = 'https://fakestoreapi.com';
const ALL = 'all';

/**
 * Catalog page — host should pass { token, customerId, username }.
 * Fetches GET /products. Does not own routing or login.
 * UI + cart state come from the host via `host/ui`.
 */
export function Page({ token, customerId, username }) {
    const [products, setProducts] = useState([]);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState(ALL);
    const { items, add } = useCart();

    useEffect(() => {
        let cancelled = false;

        setStatus('loading');
        setError('');

        fetch(`${API}/products`)
            .then((res) => {
                if (!res.ok) throw new Error(`Products request failed (${res.status})`);
                return res.json();
            })
            .then((data) => {
                if (cancelled) return;
                setProducts(Array.isArray(data) ? data : []);
                setStatus('ready');
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err.message || 'Failed to load products');
                setStatus('error');
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const categories = useMemo(
        () => [ALL, ...new Set(products.map((p) => p.category))],
        [products],
    );

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return products.filter(
            (p) =>
                (category === ALL || p.category === category) &&
                (!q || p.title.toLowerCase().includes(q)),
        );
    }, [products, query, category]);

    const inCart = (id) => items.find((i) => i.productId === id)?.quantity ?? 0;

    const handleAdd = (product) => {
        add(product);
        toast(`Added “${product.title.slice(0, 40)}” to cart`);
    };

    return (
        <section className="space-y-6">
            <PageHeader
                title="Catalog"
                subtitle={
                    (username
                        ? `Browsing as ${username} (user #${customerId ?? '—'})`
                        : 'Product list from Fake Store') +
                    (token ? '' : ' · no token passed yet')
                }
            />

            {status === 'loading' && <Spinner label="Loading products…" />}

            {status === 'error' && <Alert tone="error">{error}</Alert>}

            {status === 'ready' && (
                <>
                    <div className="space-y-3">
                        <Input
                            type="search"
                            placeholder="Search products…"
                            aria-label="Search products"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                            {categories.map((c) => (
                                <Button
                                    key={c}
                                    size="sm"
                                    variant={c === category ? 'primary' : 'secondary'}
                                    onClick={() => setCategory(c)}
                                    className="capitalize"
                                >
                                    {c}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {visible.length === 0 ? (
                        <EmptyState
                            title="No products match"
                            body="Try a different search or category."
                            action={
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setQuery('');
                                        setCategory(ALL);
                                    }}
                                >
                                    Reset filters
                                </Button>
                            }
                        />
                    ) : (
                        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {visible.map((product) => (
                                <Card as="li" key={product.id} className="flex flex-col">
                                    <div className="flex h-40 items-center justify-center bg-slate-50 p-4">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col gap-2 p-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <Badge>{product.category}</Badge>
                                            {inCart(product.id) > 0 && (
                                                <Badge tone="success">
                                                    {inCart(product.id)} in cart
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
                                            {product.title}
                                        </h3>
                                        <div className="mt-auto flex items-center justify-between pt-2">
                                            <Price value={product.price} />
                                            <Button size="sm" onClick={() => handleAdd(product)}>
                                                Add to cart
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    );
}

export default Page;
