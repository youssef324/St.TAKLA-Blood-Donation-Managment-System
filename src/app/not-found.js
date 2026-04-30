'use client';
import Link from 'next/link';
import AnimatedPage from '@/components/ui/AnimatedPage';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <AnimatedPage className="max-w-md w-full text-center space-y-6">
        <div className="text-9xl font-bold text-red-600 opacity-20 select-none">404</div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">Page Not Found</h1>
          <p className="text-gray-600">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/dashboard" passHref>
            <Button size="large" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </AnimatedPage>
    </div>
  );
}
