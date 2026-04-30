'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Logo({ size = 'medium', showText = true }) {
  const sizes = {
    small: { width: 40, height: 40, textSize: 'text-lg' },
    medium: { width: 80, height: 80, textSize: 'text-2xl' },
    large: { width: 130, height: 130, textSize: 'text-4xl' },
  };

  const { width, height, textSize } = sizes[size];
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      className="flex flex-col items-center gap-3 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/dashboard')}
    >
      
      <div
        className="relative"
        style={{ width, height }}
      >
        <div className="absolute inset-0 bg-black rounded-full flex items-center justify-center shadow-2xl shadow-red-600/30 border-2 border-red-600 p-2">
          {!imgError ? (
            <Image
              src="/logos/blood-donations-logo.png"
              alt="Blood Donations Logo"
              width={width - 12}
              height={height - 12}
              className="object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <span style={{ fontSize: width * 0.45 }} className="text-red-500">🩸</span>
          )}
        </div>
      </div>

      {/* Text - White "Blood Donations" + Gray "Management System" */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h1 className={`${textSize} font-extrabold text-black tracking-wide`}>
            Blood <span className="text-red-500">Donations</span>
          </h1>
          <p className="text-xs text-black mt-0.5 font-medium tracking-widest uppercase">
            Management System
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}