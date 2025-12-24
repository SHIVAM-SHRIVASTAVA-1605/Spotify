import { create } from "zustand";

interface SubscribeModalProps {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
};

const useSubscribeModal = create<SubscribeModalProps>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

export default useSubscribeModal;