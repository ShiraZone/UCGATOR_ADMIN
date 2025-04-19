import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"

interface DialogProps {
    open: boolean
    title: string
    description?: string
    onConfirm: () => void
    onCancel: () => void
    confirmText?: string
}

export const DialogConfirm = ({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
}: DialogProps) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-md">
                <div className="flex items-center gap-3 mb-4">
                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-yellow-500 text-xl" />
                    <h2 className="text-lg font-bold">{title}</h2>
                </div>
                {description && <p className="mb-4 text-sm text-gray-600">{description}</p>}
                <div className="flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer">
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}