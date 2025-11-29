import { twMerge } from "tailwind-merge";

interface BoxPages {
    children: React.ReactNode;
    className?: string;
}

const Box: React.FC<BoxPages> = ({
    children,
    className
}) => {
    return (
        <div className={
            twMerge(`
                bg-neutral-900,
                rounded-lg
                h-fit
                w-full
            `, className)
        }>
            {children}
        </div>
    );
}

export default Box;