import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastType = "success" | "error" | "info" | "warning";

export const showToast = (
  message: string,
  type: ToastType = "info",
  duration: number = 3000,
) => {
  switch (type) {
    case "success":
      return toast.success(message, { autoClose: duration });
    case "error":
      return toast.error(message, { autoClose: duration });
    case "warning":
      return toast.warning(message, { autoClose: duration });
    case "info":
    default:
      return toast.info(message, { autoClose: duration });
  }
};

export const showConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  const toastId = toast.info(
    <div>
      <p className="font-medium mb-2">{message}</p>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => {
            toast.dismiss(toastId);
            onConfirm();
          }}
          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600"
        >
          Yes, delete
        </button>
        <button
          onClick={() => {
            toast.dismiss(toastId);
            if (onCancel) onCancel();
          }}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>,
    {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
      position: "top-center"
    }
  );
  
  return toastId;
};

export const Toast = () => {
  return (
    <ToastContainer
      closeOnClick
      draggable
      newestOnTop
      pauseOnFocusLoss
      pauseOnHover
      autoClose={3000}
      hideProgressBar={false}
      position="top-right"
      rtl={false}
      theme="light"
    />
  );
};
