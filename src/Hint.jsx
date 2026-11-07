import { Tooltip } from 'host/ui';

export function Hint({ label, children }) {
    return <Tooltip label={label}>{children}</Tooltip>;
}
