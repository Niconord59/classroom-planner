import React from 'react';
import { createPortal } from 'react-dom';

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="relative bg-white rounded-xl shadow-2xl transform transition-all sm:max-w-lg sm:w-full">
        <div className="p-6 space-y-4">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          >
            &times;
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

const DialogHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const DialogTitle = ({ children }) => (
  <h3 className="text-lg leading-6 font-medium text-gray-900">
    {children}
  </h3>
);

export { Dialog, DialogHeader, DialogTitle };
