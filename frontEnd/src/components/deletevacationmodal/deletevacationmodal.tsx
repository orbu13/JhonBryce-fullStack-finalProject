import React from "react";
import "./deletevacationmodal.css"

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vacationName?: string; // Optional, for dynamic messaging
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  vacationName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Delete</h3>
        <p>
          Are you sure you want to delete{" "}
          <strong>{vacationName || "this vacation"}</strong>? This action cannot
          be undone.
        </p>
        <div>
          <button onClick={onClose}>Cancel</button>
          <button onClick={onConfirm} style={{ backgroundColor: "red" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
