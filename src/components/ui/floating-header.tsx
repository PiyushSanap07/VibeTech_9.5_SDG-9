import React from 'react';
import { Grid2X2Icon, MenuIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetFooter } from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function FloatingHeader() {
    const [open, setOpen] = React.useState(false);

    const links = [
        {
            label: 'Features',
            href: '#features',
        },
        {
            label: 'Pricing',
            href: '#pricing',
        },
        {
            label: 'About',
            href: '#about',
        },
    ];

    return (
        <header
            className={cn(
                'sticky top-5 z-50',
                'mx-auto w-full max-w-3xl rounded-lg border shadow',
                'bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg',
            )}
        >
            <nav className="mx-auto flex items-center justify-between p-1.5">
                <div className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 duration-100">
                    <Grid2X2Icon className="size-5 text-primary-600" />
                    <p className="font-mono text-base font-bold text-primary-600">InnoFund</p>
                </div>
                <div className="hidden items-center gap-1 lg:flex">
                    {links.map((link) => (
                        <a
                            key={link.label}
                            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                            href={link.href}
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                        Login
                    </Link>
                    <Sheet open={open} onOpenChange={setOpen}>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setOpen(!open)}
                            className="lg:hidden"
                        >
                            <MenuIcon className="size-4" />
                        </Button>
                        <SheetContent
                            className="bg-background/95 supports-[backdrop-filter]:bg-background/80 gap-0 backdrop-blur-lg"
                            showClose={false}
                            side="left"
                        >
                            <div className="grid gap-y-2 overflow-y-auto px-4 pt-12 pb-5">
                                {links.map((link) => (
                                    <a
                                        key={link.label}
                                        className={buttonVariants({
                                            variant: 'ghost',
                                            className: 'justify-start',
                                        })}
                                        href={link.href}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                            <SheetFooter className="mt-auto border-t p-4 flex flex-col gap-2">
                                <Link to="/login" className={buttonVariants({ variant: 'outline', className: 'w-full' })}>
                                    Sign In
                                </Link>
                                <Link to="/register" className={buttonVariants({ className: 'w-full' })}>
                                    Get Started
                                </Link>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>
            </nav>
        </header>
    );
}
