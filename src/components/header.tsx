import Link from 'next/link';
import { BookOpenCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary-foreground font-headline">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <span>FlashZen</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
