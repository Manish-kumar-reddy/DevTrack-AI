import Modal from "./Modal";

export default function ConfirmDialog({ open, title = "Are you sure?", description, onConfirm, onCancel, confirming }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <button className="btn-secondary" onClick={onCancel} disabled={confirming}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={confirming}>
            {confirming ? "Deleting..." : "Delete"}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
    </Modal>
  );
}
