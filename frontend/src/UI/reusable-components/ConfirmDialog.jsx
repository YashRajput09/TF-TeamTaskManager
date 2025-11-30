import React from "react";

const ConfirmDialog = ({
  open,
  title = "Are you sure?",
  message = "Do you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      {/* DIALOG BOX */}
      <div
        className="relative z-50 w-full max-w-sm bg-white dark:bg-gray-800 
        rounded-2xl shadow-xl p-6 animate-scale-in"
      >
        {/* TITLE */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>

        {/* MESSAGE */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {message}
        </p>

        {/* BUTTONS */}
        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 
            text-gray-700 dark:text-gray-200 hover:bg-gray-300 
            dark:hover:bg-gray-600 transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white 
            hover:bg-red-700 transition"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
