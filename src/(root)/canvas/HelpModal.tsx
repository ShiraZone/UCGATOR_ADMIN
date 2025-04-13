import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { COLORS } from "../../constant/COLORS";

interface HelpModalDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalDialogProps) => {

    if (!isOpen) return null

    return (
        <div className="relative z-99" aria-labelledby="modal-title" role='dialog' aria-modal="true">
            <div className="fixed inset-0 bg-gray-500/50 bg-opacity-75 transition-opacity" aria-hidden="true" />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform rounded-lg overflow-auto bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg max-h-[700px]">
                        <div className="border-b-1 border-b-gray-200 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 items-center">
                            <button onClick={onClose} className="cursor-pointer">
                                <FontAwesomeIcon icon={faXmarkCircle} color={COLORS.BLUE} className="text-2xl" />
                            </button>
                        </div>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[500px] overflow-y-auto">
                            <h1 className="text-2xl font-bold mb-2 text-uc-blue">About Canvas Editor</h1>
                            <p className="text-md tracking-wide mb-2">The Canvas Editor is an interactive space where you can design and manage your digital floor plans. It's perfect for mapping out rooms, navigation paths, and other points of interest.</p>
                            <section>
                                <h2 className="text-2xl font-bold mb-2 text-uc-blue">What is the Canvas Editor?</h2>
                                <p className="text-sm leading-relaxed">
                                    The <strong>Canvas Editor</strong> is your interactive space to <span className="font-medium">manage building floor plans</span> visually.
                                    It lets you:
                                </p>
                                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                                    <li>📍 Place and edit <strong>pins</strong> for rooms or key locations</li>
                                    <li>🏢 Switch between <strong>floors</strong> using the sidebar</li>
                                    <li>✏️ Modify layouts in <strong>Edit</strong> mode</li>
                                    <li>💾 <strong>Save</strong> and <strong>publish</strong> your work</li>
                                    <li>🖱️ Interact directly with the map by clicking to place items</li>
                                </ul>
                            </section>
                            <section className="my-3">
                                <section>
                                    <h2 className="text-2xl font-bold mb-2 text-uc-blue">Basic Workflow</h2>

                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <h3 className="font-semibold">1. Start a Project</h3>
                                            <p>Select or create a building from the sidebar. Each building can have multiple floors (layers).</p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">2. Add a Floor Plan</h3>
                                            <p>Click <strong>Add Floor</strong> to upload a floor image and name it (e.g., "Ground Floor").</p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">3. Enter Edit Mode</h3>
                                            <p>Click the <strong>Edit</strong> button to begin placing and managing pins.</p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">4. Add Pins</h3>
                                            <p>Click on the map to place a pin. Fill in its name, type, description, and image.</p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">5. Save Your Work</h3>
                                            <p>Click <strong>Save</strong> to store changes. Use <strong>Publish</strong> to push changes live.</p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">6. Switch Between Floors</h3>
                                            <p>Use the <strong>Layers panel</strong> on the left to switch between different floor plans.</p>
                                        </div>

                                        <div>
                                            <h3 className="font-semibold">7. Use Help Anytime</h3>
                                            <p>Click the <strong>Help</strong> button for quick guidance, tips, and FAQs.</p>
                                        </div>
                                    </div>
                                </section>
                            </section>
                            <section className="my-3">
                                <section>
                                    <h2 className="text-2xl font-bold mb-2 text-uc-blue">Warning</h2>
                                    <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                                        <li>You'll have to delete the floor if you want to change the floor image.</li>
                                        <li>Pin dragging is currently not yet supported</li>
                                    </ul>
                                </section>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}